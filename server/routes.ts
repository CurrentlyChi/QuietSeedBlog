import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, InsertUser } from "@shared/schema";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
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
      console.log("Received post creation request with data:", req.body);
      const validatedData = insertPostSchema.parse(req.body);
      console.log("Validated post data:", validatedData);
      
      // Make sure we have a valid categoryId - default to 4 if not present or invalid
      if (!validatedData.categoryId || validatedData.categoryId === 1) {
        console.log("Setting default categoryId to 4 (Mindfulness)");
        validatedData.categoryId = 4;
      }
      
      const post = await storage.createPost(validatedData);
      console.log("Created new post:", post);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
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
      
      // Special case for 'all' category - return all posts
      if (category === 'all') {
        console.log("Handling 'all' category request - fetching all posts");
        const posts = await storage.getAllPosts();
        console.log(`Found ${posts.length} posts for 'all' category`);
        return res.json(posts);
      }
      
      const posts = await storage.getPostsByCategory(category);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching posts by category:", error);
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
  
  // Page content routes
  app.get("/api/pages/:id", async (req: Request, res: Response) => {
    try {
      const pageId = req.params.id;
      console.log(`Received request for page content: ${pageId}`);
      
      const pageContent = await storage.getPageContent(pageId);
      console.log(`Retrieved page content for ${pageId}:`, pageContent ? "Found" : "Not found");
      
      if (!pageContent) {
        console.log(`No page content found for '${pageId}'`);
        return res.status(404).json({ message: `Page content for '${pageId}' not found` });
      }
      
      console.log(`Returning page content for ${pageId}`);
      return res.json(pageContent);
    } catch (error) {
      console.error("Error fetching page content:", error);
      return res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  
  app.put("/api/pages/:id", async (req: Request, res: Response) => {
    try {
      const pageId = req.params.id;
      console.log(`Updating page ${pageId} with content:`, req.body);
      
      // Basic validation
      if (!req.body || typeof req.body.content !== 'string') {
        return res.status(400).json({ 
          message: "Invalid page content. Content field must be a string." 
        });
      }
      
      const updatedContent = await storage.updatePageContent(pageId, req.body);
      console.log(`Page ${pageId} updated successfully`);
      
      return res.json(updatedContent);
    } catch (error) {
      console.error("Error updating page content:", error);
      return res.status(500).json({ message: "Failed to update page content" });
    }
  });

  // Update user credentials (for admin only)
  app.put("/api/user/:id", async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update user information" });
      }
      
      // Check if user is admin
      const currentUser = req.user as any;
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Only administrators can update user information" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Create schema for updating user
      const updateUserSchema = z.object({
        username: z.string().min(3).optional(),
        password: z.string().min(6).optional(),
        name: z.string().min(2).optional(),
      });
      
      // Validate the request body
      const validatedData = updateUserSchema.parse(req.body);
      
      // If password is being updated, hash it
      if (validatedData.password) {
        validatedData.password = await hashPassword(validatedData.password);
      }
      
      const updatedUser = await storage.updateUser(id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
