import { pgTable, serial, text, decimal, timestamp, varchar, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionKa: text("description_ka"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  brand: text("brand"),
  category: text("category"),
  categories: json("categories").$type<string[]>(),
  imageUrl: text("image_url"),
  capacity: text("capacity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: serial("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderCode: varchar("order_code", { length: 10 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  items: json("items").notNull(),
  customerInfo: json("customer_info").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const translations = pgTable("translations", {
  id: text("id").primaryKey(),
  key: text("key").unique().notNull(),
  english: text("english").notNull(),
  georgian: text("georgian").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletter = pgTable("newsletter", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Translation = typeof translations.$inferSelect;
export type Newsletter = typeof newsletter.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProductSchema = createInsertSchema(products);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders);
export const insertTranslationSchema = createInsertSchema(translations);
export const insertNewsletterSchema = createInsertSchema(newsletter);
export const insertContactMessageSchema = createInsertSchema(contactMessages);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;