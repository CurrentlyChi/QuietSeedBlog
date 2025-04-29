import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertPostSchema } from "@shared/schema";
import session from "express-session";
import memoryStore from "memorystore";
import { randomUUID } from "crypto";

const MemoryStore = memoryStore(session);

interface SessionData {
  userId?: number;
  isAdmin?: boolean;
}

declare module "express-session" {
  interface SessionData {
    user: SessionData;
  }
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || randomUUID(),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000 // Prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production"
      }
    })
  );
  
  // API routes
  // Authentication
  app.post("/api/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session data
      req.session.user = {
        userId: user.id,
        isAdmin: user.isAdmin
      };
      
      // Return user info (excluding password)
      const { password, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/me", async (req, res) => {
    if (!req.session.user?.userId) {
      return res.status(401).json({ isAuthenticated: false });
    }
    
    try {
      const user = await storage.getUser(req.session.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userInfo } = user;
      res.json({ isAuthenticated: true, user: userInfo });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // Posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });
  
  app.get("/api/posts/featured", async (req, res) => {
    try {
      const post = await storage.getFeaturedPost();
      
      if (!post) {
        return res.status(404).json({ message: "No featured post found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured post" });
    }
  });
  
  app.get("/api/posts/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const posts = await storage.searchPosts(query);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error searching posts" });
    }
  });
  
  app.get("/api/posts/category/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const posts = await storage.getPostsByCategory(slug);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts by category" });
    }
  });
  
  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getPostWithDetails(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });
  
  // Admin routes (protected)
  app.post("/api/posts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        ...data,
        authorId: req.session.user.userId!
      });
      
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  
  app.put("/api/posts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPostSchema.partial().parse(req.body);
      
      const post = await storage.updatePost(id, data);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  
  app.delete("/api/posts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
