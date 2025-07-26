import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { loginSchema, registerSchema, type User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Omit<import("@shared/schema").User, 'password'> {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60, // 1 week
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Set up session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !(await comparePasswords(validatedData.password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set up session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user route
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
}

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Admin middleware
export async function requireAdmin(req: any, res: any, next: any) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
}