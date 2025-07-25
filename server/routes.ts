import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { bogPaymentService, BOGCreateOrderRequest } from "./bogPayment";
import { 
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertNewsletterSchema,
  insertContactMessageSchema
} from "@shared/schema";

// Helper function to map payment method to BOG payment_method array
function getPaymentMethods(paymentMethod: string): string[] {
  switch (paymentMethod) {
    case 'card':
      return ['card'];
    case 'installment':
      return ['bog_loan']; // BOG installment loans
    case 'bnpl':
      return ['bnpl']; // Buy now pay later / part-by-part
    default:
      return ['card'];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin product routes
  app.post("/api/admin/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Payment initiation route
  app.post("/api/payments/initiate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shippingAddress, billingAddress, items, paymentMethod = 'card' } = req.body;
      
      // Calculate total
      let total = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        const itemTotal = parseFloat(product.price) * item.quantity;
        total += itemTotal;
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create order with pending payment status
      const orderData = insertOrderSchema.parse({
        userId,
        total: total.toString(),
        shippingAddress,
        billingAddress,
        paymentStatus: "pending"
      });

      const order = await storage.createOrder(orderData, orderItems as any);

      // Create BOG payment order using official BOG Payment API
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const bogOrderRequest: BOGCreateOrderRequest = {
        callback_url: `${baseUrl}/api/payments/callback`,
        external_order_id: order.id,
        purchase_units: {
          currency: 'GEL',
          total_amount: total,
          basket: orderItems.map((item) => ({
            product_id: item.productId,
            description: `Product ${item.productId}`, // You might want to get actual product name
            quantity: item.quantity,
            unit_price: parseFloat(item.price),
            total_price: item.quantity * parseFloat(item.price)
          }))
        },
        redirect_urls: {
          success: `${baseUrl}/payment-success`,
          fail: `${baseUrl}/payment-cancel`
        },
        ttl: 60, // 60 minutes to complete payment
        payment_method: getPaymentMethods(paymentMethod), // Set payment method based on user selection
        capture: 'automatic', // Immediate capture
        application_type: 'web'
      };

      // Create BOG order (using real BOG Payment API)
      const bogOrder = await bogPaymentService.createOrder(bogOrderRequest);
      console.log("BOG Order Response:", JSON.stringify(bogOrder, null, 2));
      
      // Update order with payment ID
      await storage.updateOrderPayment(order.id, bogOrder.id, 'pending');
      
      const paymentUrl = bogPaymentService.getPaymentUrl(bogOrder);
      console.log("Generated Payment URL:", paymentUrl);
      
      const response = {
        orderId: order.id,
        paymentId: bogOrder.id,
        paymentUrl,
        status: 'created'
      };
      
      console.log("Sending response to frontend:", JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  // BOG Payment callback (webhook)
  app.post("/api/payments/callback", async (req, res) => {
    try {
      console.log("BOG Payment callback received:", req.body);
      
      // BOG will send payment status update here
      const { order_id, payment_id, status } = req.body;
      
      if (order_id && payment_id && status) {
        // Update order payment status based on BOG callback
        const orderStatus = status === 'SUCCESS' ? 'completed' : status === 'FAILED' ? 'cancelled' : 'pending';
        const paymentStatus = status === 'SUCCESS' ? 'completed' : status === 'FAILED' ? 'failed' : 'pending';
        
        await storage.updateOrderPayment(order_id, payment_id, paymentStatus);
        await storage.updateOrderStatus(order_id, orderStatus);
      }
      
      // Always respond with 200 OK to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing BOG callback:", error);
      res.status(200).json({ received: true }); // Still acknowledge to prevent retries
    }
  });

  // Payment success callback
  app.get("/api/payments/success", async (req, res) => {
    try {
      const { orderId, paymentId } = req.query;
      
      if (!orderId || !paymentId) {
        return res.status(400).json({ message: "Missing orderId or paymentId" });
      }

      // Get payment status from BOG
      const bogPayment = await bogPaymentService.getPayment(paymentId as string);
      
      // Update order based on payment status
      let orderStatus = 'pending';
      let paymentStatus = bogPayment.status.toLowerCase();
      
      if (bogPayment.status === 'APPROVED' || bogPayment.status === 'COMPLETED') {
        orderStatus = 'confirmed';
        paymentStatus = 'completed';
        
        // Clear user's cart after successful payment
        const order = await storage.getOrder(orderId as string);
        if (order) {
          await storage.clearCart(order.userId);
        }
      }
      
      await storage.updateOrderStatus(orderId as string, orderStatus, paymentStatus);
      
      // Redirect to success page
      res.redirect(`/?payment=success&orderId=${orderId}`);
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.redirect(`/?payment=error`);
    }
  });

  // Payment cancel callback
  app.get("/api/payments/cancel", async (req, res) => {
    try {
      const { orderId } = req.query;
      
      if (orderId) {
        await storage.updateOrderStatus(orderId as string, 'cancelled', 'cancelled');
      }
      
      res.redirect(`/?payment=cancelled&orderId=${orderId}`);
    } catch (error) {
      console.error("Error handling payment cancellation:", error);
      res.redirect(`/?payment=error`);
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shippingAddress, billingAddress, items } = req.body;
      
      // Calculate total
      let total = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        const itemTotal = parseFloat(product.price) * item.quantity;
        total += itemTotal;
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }

      const orderData = insertOrderSchema.parse({
        userId,
        total: total.toString(),
        shippingAddress,
        billingAddress
      });

      const order = await storage.createOrder(orderData, orderItems as any);
      
      // Clear cart after successful order
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin order routes
  app.get("/api/admin/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Newsletter routes
  app.post("/api/newsletter", async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeNewsletter(newsletterData);
      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(contactData);
      res.json({ message: "Contact message sent successfully" });
    } catch (error) {
      console.error("Error sending contact message:", error);
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // Admin contact routes
  app.get("/api/admin/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put("/api/admin/contacts/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
