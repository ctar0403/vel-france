import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { bogPaymentService, BOGCreateOrderRequest } from "./bogPayment";
import { 
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertNewsletterSchema,
  insertContactMessageSchema
} from "@shared/schema";

// Helper function to configure BOG payment options
function getBOGPaymentConfig(paymentMethod: string, totalAmount: number): { 
  payment_method: string[], 
  bnpl?: boolean,
  config?: {
    loan?: {
      type?: string;
      month?: number;
    };
  };
} {
  switch (paymentMethod) {
    case 'card':
      // Card payment includes all available payment methods on BOG gateway
      return { 
        payment_method: ['card', 'google_pay', 'apple_pay', 'bog_p2p', 'bog_loyalty'] 
      };
    case 'installment':
      return { 
        payment_method: ['bnpl'], // Use bnpl payment method
        bnpl: false, // Show only standard installment plan
        config: {
          loan: {
            type: undefined, // Discount code from BOG calculator (undefined for no discount)
            month: 12 // 12-month installment plan
          }
        }
      };
    case 'bnpl':
      return { 
        payment_method: ['bnpl'], // Use bnpl payment method
        bnpl: true, // Show only payment in installments (part-by-part)
        config: {
          loan: {
            type: undefined, // Discount code from BOG calculator (undefined for no discount)
            month: 6 // 6-month part-by-part plan
          }
        }
      };
    default:
      return { payment_method: ['card'] };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup custom authentication
  setupAuth(app);

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

  // Get individual product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
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
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products for admin:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product", error: (error as Error).message });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product", error: (error as Error).message });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
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

  // Cart routes - Support both authenticated and unauthenticated users
  app.get("/api/cart", async (req: any, res) => {
    try {
      // For unauthenticated users, return session cart
      if (!(req.session as any).userId) {
        const sessionCart = (req.session as any).cart || [];
        // Convert session cart to proper format with product details
        const cartWithProducts = [];
        for (const item of sessionCart) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            cartWithProducts.push({
              id: item.id,
              userId: null,
              productId: item.productId,
              quantity: item.quantity,
              createdAt: new Date(),
              product
            });
          }
        }
        return res.json(cartWithProducts);
      }
      
      // For authenticated users, get cart from database
      const userId = (req.session as any).userId;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: any, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      // For unauthenticated users, store in session
      if (!(req.session as any).userId) {
        if (!(req.session as any).cart) {
          (req.session as any).cart = [];
        }
        
        const sessionCart = (req.session as any).cart;
        const existingItem = sessionCart.find((item: any) => item.productId === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          sessionCart.push({
            id: `session_${Date.now()}_${Math.random()}`,
            productId,
            quantity
          });
        }
        
        const product = await storage.getProduct(productId);
        const cartItem = {
          id: existingItem?.id || sessionCart[sessionCart.length - 1].id,
          userId: null,
          productId,
          quantity: existingItem ? existingItem.quantity : quantity,
          createdAt: new Date(),
          product
        };
        
        return res.json(cartItem);
      }
      
      // For authenticated users, store in database
      const userId = (req.session as any).userId;
      const cartItemData = insertCartItemSchema.parse({
        productId,
        quantity,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const itemId = req.params.id;
      
      // For unauthenticated users, update session cart
      if (!(req.session as any).userId) {
        const sessionCart = (req.session as any).cart || [];
        const item = sessionCart.find((item: any) => item.id === itemId);
        if (item) {
          item.quantity = quantity;
          const product = await storage.getProduct(item.productId);
          return res.json({
            id: item.id,
            userId: null,
            productId: item.productId,
            quantity: item.quantity,
            createdAt: new Date(),
            product
          });
        }
        return res.status(404).json({ message: "Item not found" });
      }
      
      // For authenticated users, update database
      const cartItem = await storage.updateCartItem(itemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: any, res) => {
    try {
      const itemId = req.params.id;
      
      // For unauthenticated users, remove from session cart
      if (!(req.session as any).userId) {
        const sessionCart = (req.session as any).cart || [];
        const index = sessionCart.findIndex((item: any) => item.id === itemId);
        if (index > -1) {
          sessionCart.splice(index, 1);
        }
        return res.json({ message: "Item removed from cart" });
      }
      
      // For authenticated users, remove from database
      await storage.removeFromCart(itemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", async (req: any, res) => {
    try {
      // For unauthenticated users, clear session cart
      if (!(req.session as any).userId) {
        (req.session as any).cart = [];
        return res.json({ message: "Cart cleared" });
      }
      
      // For authenticated users, clear database cart
      const userId = (req.session as any).userId;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // BOG Payment with Calculator Results
  app.post("/api/payments/initiate-with-calculator", async (req: any, res) => {
    try {
      const userId = (req.session as any).userId || null;
      const { shippingAddress, billingAddress, items, calculatorResult, paymentMethod } = req.body;
      
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

      // Create BOG payment order using calculator results
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // BOG API configuration based on payment method type
      let paymentConfig: any = {};
      
      if (paymentMethod === 'bnpl') {
        // For Buy Now Pay Later (part-by-part) - use bnpl method with type "zero"
        paymentConfig = {
          payment_method: ['bnpl'],
          bnpl: true,
          config: {
            loan: {
              type: calculatorResult.discount_code || 'zero',
              month: calculatorResult.month || 6
            }
          }
        };
      } else {
        // For standard installments - use bog_loan method with type "standard"
        paymentConfig = {
          payment_method: ['bog_loan'],  // Use bog_loan for standard installments
          config: {
            loan: {
              type: calculatorResult.discount_code || 'standard',
              month: calculatorResult.month || 12
            }
          }
        };
      }
      
      console.log(`Using BOG Calculator: ${calculatorResult.month} months (${paymentMethod}), payment_method: ${paymentMethod === 'bnpl' ? 'bnpl' : 'bog_loan'}`);

      const bogOrderRequest: BOGCreateOrderRequest = {
        callback_url: `${baseUrl}/api/payments/callback`,
        external_order_id: order.id,
        purchase_units: {
          currency: 'GEL',
          total_amount: total,
          basket: orderItems.map((item) => ({
            product_id: item.productId,
            description: `Product ${item.productId}`,
            quantity: item.quantity,
            unit_price: parseFloat(item.price),
            total_price: item.quantity * parseFloat(item.price)
          }))
        },
        redirect_urls: {
          success: `${baseUrl}/payment-success`,
          fail: `${baseUrl}/payment-cancel`
        },
        ttl: 60,
        ...paymentConfig,
        capture: 'automatic',
        application_type: 'web'
      };

      console.log(`Creating BOG order with calculator result:`, calculatorResult);
      console.log("BOG Order Request:", JSON.stringify(bogOrderRequest, null, 2));

      const bogOrder = await bogPaymentService.createOrder(bogOrderRequest);
      console.log("BOG Order Response:", JSON.stringify(bogOrder, null, 2));
      
      await storage.updateOrderPayment(order.id, bogOrder.id, 'pending');
      
      const paymentUrl = bogPaymentService.getPaymentUrl(bogOrder);
      
      const response = {
        orderId: order.id,
        paymentId: bogOrder.id,
        paymentUrl,
        status: 'created'
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error initiating calculator payment:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  // Payment initiation route (for card payments only)
  app.post("/api/payments/initiate", async (req: any, res) => {
    try {
      const userId = (req.session as any).userId || null;
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
      const paymentConfig = getBOGPaymentConfig(paymentMethod, total);
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
        ...paymentConfig, // Set payment method and bnpl config
        capture: 'automatic', // Immediate capture
        application_type: 'web'
      };

      // Debug: Log the complete BOG order request
      console.log(`Creating BOG order for payment method: ${paymentMethod}`);
      console.log("BOG Order Request:", JSON.stringify(bogOrderRequest, null, 2));

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
      
      // Handle the actual BOG callback structure
      const { body } = req.body;
      
      if (body && body.external_order_id && body.order_status) {
        const externalOrderId = body.external_order_id; // This is our order ID
        const bogOrderId = body.order_id; // BOG's order ID
        const orderStatus = body.order_status.key; // 'completed', 'failed', etc.
        
        // Update order payment status based on BOG callback
        const mappedOrderStatus = orderStatus === 'completed' ? 'confirmed' : orderStatus === 'failed' ? 'cancelled' : 'pending';
        const mappedPaymentStatus = orderStatus === 'completed' ? 'completed' : orderStatus === 'failed' ? 'failed' : 'pending';
        
        console.log(`Updating order ${externalOrderId} with status: ${mappedOrderStatus}, payment: ${mappedPaymentStatus}`);
        
        await storage.updateOrderPayment(externalOrderId, bogOrderId, mappedPaymentStatus);
        await storage.updateOrderStatus(externalOrderId, mappedOrderStatus, mappedPaymentStatus);
        
        // Clear cart after successful payment
        if (orderStatus === 'completed') {
          const order = await storage.getOrder(externalOrderId);
          if (order && order.userId) {
            await storage.clearCart(order.userId);
          }
        }
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

      // Note: BOG payment status checking would require additional API call
      // For now, we'll rely on the callback for status updates
      console.log("Payment success callback received for:", orderId, paymentId);
      
      // Update order as successful since we reached the success callback
      let orderStatus = 'confirmed';
      let paymentStatus = 'completed';
      
      // Clear user's cart after successful payment
      const order = await storage.getOrder(orderId as string);
      if (order && order.userId) {
        await storage.clearCart(order.userId);
      }
      
      await storage.updateOrderStatus(orderId as string, orderStatus, paymentStatus);
      
      // Get the updated order to retrieve the order code
      const updatedOrder = await storage.getOrder(orderId as string);
      
      // Redirect to success page with order code
      res.redirect(`/payment-success?orderCode=${updatedOrder?.orderCode || orderId}`);
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
  app.post("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
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

  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Public order route by order code (for unique URLs)
  app.get("/api/orders/code/:orderCode", async (req, res) => {
    try {
      const orderCode = req.params.orderCode;
      
      const order = await storage.getOrderByCode(orderCode);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order by code:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Admin order routes
  app.get("/api/admin/orders", requireAdmin, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
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

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
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
  app.get("/api/admin/contacts", requireAdmin, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
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

  app.put("/api/admin/contacts/:id/read", requireAdmin, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
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
