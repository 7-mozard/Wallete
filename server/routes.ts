import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  transferSchema,
  createMoneySchema,
  creditAccountSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Auth middleware
const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token d'accès requis" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.id);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Utilisateur non autorisé" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

// Admin middleware
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès administrateur requis" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur d'inscription" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      if (user.isBlocked) {
        return res.status(401).json({ message: "Compte bloqué" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur de connexion" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Wallet routes
  app.get("/api/wallet", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const wallet = await storage.getWalletByUserId(req.user!.id);
      if (!wallet) {
        return res.status(404).json({ message: "Portefeuille non trouvé" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Transfer routes
  app.post("/api/transfer", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, amount, currency } = transferSchema.parse(req.body);

      const sender = await storage.getUserById(req.user!.id);
      const recipient = await storage.getUserByEmail(recipientEmail);

      if (!recipient) {
        return res.status(404).json({ message: "Destinataire non trouvé" });
      }

      if (sender!.id === recipient.id) {
        return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer de l'argent à vous-même" });
      }

      const senderWallet = await storage.getWalletByUserId(sender!.id);
      const currentBalance = currency === "FC" ? Number(senderWallet!.balanceFC) : Number(senderWallet!.balanceUSD);

      if (currentBalance < amount) {
        return res.status(400).json({ message: "Solde insuffisant" });
      }

      // Deduct from sender
      await storage.updateWalletBalance(sender!.id, currency, (-amount).toString());
      // Add to recipient
      await storage.updateWalletBalance(recipient.id, currency, amount.toString());

      // Create transaction record
      const transaction = await storage.createTransaction({
        type: "transfer",
        fromUserId: sender!.id,
        toUserId: recipient.id,
        amount: amount.toString(),
        currency,
        description: `Transfert vers ${recipient.email}`,
      });

      // Create notifications
      await storage.createNotification({
        userId: recipient.id,
        title: "Transfert reçu",
        message: `Vous avez reçu ${amount} ${currency} de ${sender!.email}`,
      });

      res.json({ message: "Transfert effectué avec succès", transaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur de transfert" });
    }
  });

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/products/:id/purchase", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProductById(productId);

      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: "Produit en rupture de stock" });
      }

      const userWallet = await storage.getWalletByUserId(req.user!.id);
      const currentBalance = product.currency === "FC" ? Number(userWallet!.balanceFC) : Number(userWallet!.balanceUSD);

      if (currentBalance < Number(product.price)) {
        return res.status(400).json({ message: "Solde insuffisant" });
      }

      // Deduct from user wallet
      await storage.updateWalletBalance(req.user!.id, product.currency, (-Number(product.price)).toString());
      
      // Update product stock
      await storage.updateProductStock(productId, 1);

      // Create transaction record
      const transaction = await storage.createTransaction({
        type: "purchase",
        fromUserId: req.user!.id,
        amount: product.price,
        currency: product.currency,
        description: `Achat: ${product.name}`,
        productId: product.id,
      });

      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "Achat confirmé",
        message: `Vous avez acheté ${product.name} pour ${product.price} ${product.currency}`,
      });

      res.json({ message: "Achat effectué avec succès", transaction });
    } catch (error) {
      res.status(500).json({ message: "Erreur d'achat" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const transactions = req.user!.role === "admin" 
        ? await storage.getAllTransactions()
        : await storage.getTransactionsByUserId(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marquée comme lue" });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Admin routes
  app.post("/api/admin/create-money", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { amount, currency } = createMoneySchema.parse(req.body);

      // Create transaction record for money creation
      const transaction = await storage.createTransaction({
        type: "money_creation",
        fromUserId: req.user!.id,
        amount: amount.toString(),
        currency,
        description: `Création de monnaie électronique: ${amount} ${currency}`,
      });

      res.json({ message: "Monnaie créée avec succès", transaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur de création de monnaie" });
    }
  });

  app.post("/api/admin/credit-account", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { userEmail, amount, currency } = creditAccountSchema.parse(req.body);

      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Credit user account
      await storage.updateWalletBalance(user.id, currency, amount.toString());

      // Create transaction record
      const transaction = await storage.createTransaction({
        type: "deposit",
        fromUserId: req.user!.id,
        toUserId: user.id,
        amount: amount.toString(),
        currency,
        description: `Dépôt manuel par administrateur`,
      });

      // Create notification
      await storage.createNotification({
        userId: user.id,
        title: "Dépôt effectué",
        message: `Vous avez effectué un dépôt de ${amount} ${currency}`,
      });

      res.json({ message: "Compte crédité avec succès", transaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur de crédit de compte" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      // This would need to be implemented in storage
      res.json({ message: "Liste des utilisateurs" });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/admin/products", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur de création de produit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
