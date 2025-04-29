import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all posts
  app.get("/api/posts", async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get featured post
  app.get("/api/posts/featured", async (_req: Request, res: Response) => {
    try {
      const post = await storage.getFeaturedPost();
      if (!post) {
        return res.status(404).json({ message: "No featured post found" });
      }
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch featured post" });
    }
  });

  // Get post by ID
  app.get("/api/posts/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let post;
      
      const id = parseInt(idOrSlug);
      if (!isNaN(id)) {
        // If it's a number, treat as ID
        post = await storage.getPost(id);
      } else {
        // Otherwise, treat as slug
        post = await storage.getPostWithDetails(idOrSlug);
      }
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      return res.json(post);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create new post
  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      return res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update post
  app.put("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const validatedData = insertPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updatePost(id, validatedData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      return res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const success = await storage.deletePost(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }

      return res.json({ message: "Post deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Search posts
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const posts = await storage.searchPosts(query);
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to search posts" });
    }
  });

  // Get posts by category
  app.get("/api/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const posts = await storage.getPostsByCategory(category);
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch posts by category" });
    }
  });
  
  // Get all categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Get site settings
  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });
  
  // Update site settings
  app.put("/api/settings", async (req: Request, res: Response) => {
    try {
      console.log("Received settings update request with body:", req.body);
      
      // Validate input has tagline
      if (!req.body || typeof req.body.tagline !== 'string') {
        console.error("Invalid settings data received:", req.body);
        return res.status(400).json({ 
          message: "Invalid settings data. Tagline must be a string." 
        });
      }
      
      // Process the update
      const updatedSettings = await storage.updateSiteSettings(req.body);
      console.log("Settings updated successfully:", updatedSettings);
      
      return res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      return res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
