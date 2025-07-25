import {
  users,
  wallets,
  products,
  transactions,
  notifications,
  type User,
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Product,
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Wallet operations
  getWalletByUserId(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(
    userId: string,
    currency: "FC" | "USD",
    amount: string
  ): Promise<Wallet>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<Product>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Auth operations
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    // Create wallet for new user
    await this.createWallet({ userId: user.id });

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Wallet operations
  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values(walletData)
      .returning();
    return wallet;
  }

  async updateWalletBalance(
    userId: string,
    currency: "FC" | "USD",
    amount: string
  ): Promise<Wallet> {
    const balanceField = currency === "FC" ? wallets.balanceFC : wallets.balanceUSD;
    const [wallet] = await db
      .update(wallets)
      .set({
        [currency === "FC" ? "balanceFC" : "balanceUSD"]: sql`${balanceField} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();
    return wallet;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async updateProductStock(id: string, quantity: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        stock: sql`${products.stock} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Transaction operations
  async createTransaction(
    transactionData: InsertTransaction
  ): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  // Notification operations
  async createNotification(
    notificationData: InsertNotification
  ): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Auth operations
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export const storage = new DatabaseStorage();
