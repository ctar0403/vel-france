import {
  users,
  products,
  cartItems,
  orders,
  orderItems,
  newsletters,
  contactMessages,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Newsletter,
  type InsertNewsletter,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Generate unique order code (numbers only - 6 digits)
function generateOrderCode(): string {
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0'); // 3 random digits
  return `${timestamp}${random}`;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  bulkUpdateProductPricing(productIds: string[], discountPercentage: number): Promise<Product[]>;
  resetAllProductDiscounts(): Promise<Product[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  getOrder(orderId: string): Promise<Order | undefined>;
  getOrderByCode(orderCode: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | null>;
  getOrders(userId: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getAllOrders(): Promise<(Order & { user: User, orderItems: (OrderItem & { product: Product })[] })[]>;
  updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<Order>;
  updateOrderPayment(orderId: string, paymentId: string, paymentStatus: string): Promise<Order>;
  
  // Newsletter operations
  subscribeNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  unsubscribeNewsletter(email: string): Promise<void>;
  
  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  markMessageAsRead(id: string): Promise<ContactMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }



  async bulkUpdateProductPricing(productIds: string[], discountPercentage: number): Promise<Product[]> {
    const updatedProducts = [];
    
    for (const productId of productIds) {
      const [updatedProduct] = await db
        .update(products)
        .set({ 
          discountPercentage: discountPercentage,
          updatedAt: new Date() 
        })
        .where(eq(products.id, productId))
        .returning();
      
      if (updatedProduct) {
        updatedProducts.push(updatedProduct);
      }
    }
    
    return updatedProducts;
  }

  async resetAllProductDiscounts(): Promise<Product[]> {
    const updatedProducts = await db
      .update(products)
      .set({ 
        discountPercentage: 0,
        updatedAt: new Date() 
      })
      .returning();
    
    return updatedProducts;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(rows => 
        rows.map(row => ({
          ...row.cart_items,
          product: row.products!
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    // Generate unique order code
    let orderCode = generateOrderCode();
    
    // Ensure uniqueness by checking if code already exists
    let attempts = 0;
    while (attempts < 10) {
      const [existingOrder] = await db.select().from(orders).where(eq(orders.orderCode, orderCode));
      if (!existingOrder) break;
      orderCode = generateOrderCode();
      attempts++;
    }
    
    const orderWithCode = {
      ...order,
      orderCode
    };
    
    const [newOrder] = await db.insert(orders).values(orderWithCode).returning();
    
    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async getOrders(userId: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    // Only return orders with completed payment status (successful orders)
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.paymentStatus, 'completed')
      ))
      .orderBy(desc(orders.createdAt));

    const result = [];
    for (const order of userOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      result.push({
        ...order,
        orderItems: items.map(item => ({
          ...item.order_items,
          product: item.products!
        }))
      });
    }

    return result;
  }

  async getAllOrders(): Promise<(Order & { user: User, orderItems: (OrderItem & { product: Product })[] })[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    const result = [];
    for (const orderRow of allOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderRow.orders.id));

      result.push({
        ...orderRow.orders,
        user: orderRow.users!,
        orderItems: items.map(item => ({
          ...item.order_items,
          product: item.products!
        }))
      });
    }

    return result;
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    return order;
  }

  async getOrderByCode(orderCode: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | null> {
    // Only return completed/paid orders
    const [order] = await db.select().from(orders).where(and(
      eq(orders.orderCode, orderCode),
      eq(orders.paymentStatus, 'completed')
    ));
    
    if (!order) return null;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: items.map(item => ({
        ...item.order_items,
        product: item.products!
      }))
    };
  }

  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // First delete order items
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
      
      // Then delete the order
      const result = await db.delete(orders).where(eq(orders.id, orderId));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async updateOrderPayment(orderId: string, paymentId: string, paymentStatus: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        paymentId, 
        paymentStatus, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  // Newsletter operations
  async subscribeNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    try {
      const [newSubscription] = await db.insert(newsletters).values(newsletter).returning();
      return newSubscription;
    } catch (error) {
      // Handle duplicate email
      const [existing] = await db
        .update(newsletters)
        .set({ isActive: true })
        .where(eq(newsletters.email, newsletter.email))
        .returning();
      return existing;
    }
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db
      .update(newsletters)
      .set({ isActive: false })
      .where(eq(newsletters.email, email));
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async markMessageAsRead(id: string): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }
}

export const storage = new DatabaseStorage();
