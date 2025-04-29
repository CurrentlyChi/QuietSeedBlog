import { 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Post, type InsertPost, 
  type PostWithDetails,
  type SiteSettings, type InsertSiteSettings,
  type PageContent, type InsertPageContent,
  defaultSiteSettings,
  defaultAboutPageContent,
  users, categories, posts, siteSettings, pageContents
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, or, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Post methods
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPostWithDetails(slug: string): Promise<PostWithDetails | undefined>;
  getFeaturedPost(): Promise<PostWithDetails | undefined>;
  getPostsByCategory(categorySlug: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  searchPosts(query: string): Promise<Post[]>;
  
  // Site settings methods
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  
  // Page content methods
  getPageContent(id: string): Promise<PageContent | undefined>;
  updatePageContent(id: string, content: Partial<InsertPageContent>): Promise<PageContent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private posts: Map<number, Post>;
  private siteSettings: SiteSettings;
  private pageContents: Map<string, PageContent>;
  
  private userId: number;
  private categoryId: number;
  private postId: number;
  
  public sessionStore: session.Store;

  constructor() {
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.siteSettings = { id: 1, tagline: defaultSiteSettings.tagline, updatedAt: new Date() };
    this.pageContents = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.postId = 1;
    
    // Initialize the about page content
    this.pageContents.set('about', { ...defaultAboutPageContent, lastUpdated: new Date() });
    
    this.seedData();
  }
  
  // Site settings methods
  async getSiteSettings(): Promise<SiteSettings> {
    return { ...this.siteSettings };
  }
  
  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    this.siteSettings = {
      ...this.siteSettings,
      ...settings
    };
    return { ...this.siteSettings };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      // Preserve id and createdAt
      id: existingUser.id,
      createdAt: existingUser.createdAt
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Post methods
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(post => post.slug === slug);
  }

  async getPostWithDetails(slug: string): Promise<PostWithDetails | undefined> {
    const post = await this.getPostBySlug(slug);
    if (!post) return undefined;

    const author = await this.getUser(post.authorId);

    if (!author) return undefined;

    return {
      ...post,
      categoryName: "Uncategorized", // Default value since categories are removed
      categorySlug: "uncategorized", // Default value
      authorName: author.name
    };
  }

  async getFeaturedPost(): Promise<PostWithDetails | undefined> {
    // Check if we have any posts first
    const posts = Array.from(this.posts.values());
    if (posts.length === 0) {
      return undefined;
    }
    
    // First try to find a featured post
    const featuredPost = posts.find(post => post.featured === true || post.featured === "true");
    if (!featuredPost) {
      // If no featured post, get the most recent post
      const sortedPosts = posts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      return sortedPosts.length > 0 ? this.getPostWithDetails(sortedPosts[0].slug) : undefined;
    }
    
    return this.getPostWithDetails(featuredPost.slug);
  }

  async getPostsByCategory(categorySlug: string): Promise<Post[]> {
    // Since categories are removed, return all posts regardless of category
    console.log("getPostsByCategory called with removed categories, returning all posts");
    return this.getAllPosts();
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postId++;
    
    // Ensure proper types for all fields
    const newPost: Post = {
      id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl || null,
      publishedAt: post.publishedAt instanceof Date 
        ? post.publishedAt 
        : typeof post.publishedAt === 'string' 
          ? new Date(post.publishedAt) 
          : new Date(),
      categoryId: 1, // Fixed default value since categories are removed
      authorId: typeof post.authorId === 'number' ? post.authorId : 1,
      featured: typeof post.featured === 'boolean' 
        ? post.featured 
        : post.featured === 'true' 
          ? true 
          : false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Creating post with data:", newPost);
    this.posts.set(id, newPost);
    return newPost;
  }

  async updatePost(id: number, updatedFields: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;

    // Process fields to ensure correct types
    const processed: Partial<Post> = {};
    
    if (updatedFields.title !== undefined) processed.title = updatedFields.title;
    if (updatedFields.slug !== undefined) processed.slug = updatedFields.slug;
    if (updatedFields.content !== undefined) processed.content = updatedFields.content;
    if (updatedFields.excerpt !== undefined) processed.excerpt = updatedFields.excerpt;
    if (updatedFields.imageUrl !== undefined) processed.imageUrl = updatedFields.imageUrl || null;
    
    // Handle date conversion
    if (updatedFields.publishedAt !== undefined) {
      processed.publishedAt = updatedFields.publishedAt instanceof Date 
        ? updatedFields.publishedAt 
        : typeof updatedFields.publishedAt === 'string' 
          ? new Date(updatedFields.publishedAt) 
          : existingPost.publishedAt;
    }
    
    // Handle IDs
    if (updatedFields.categoryId !== undefined) {
      processed.categoryId = typeof updatedFields.categoryId === 'number' 
        ? updatedFields.categoryId 
        : parseInt(updatedFields.categoryId as any, 10) || existingPost.categoryId;
    }
    
    if (updatedFields.authorId !== undefined) {
      processed.authorId = typeof updatedFields.authorId === 'number' 
        ? updatedFields.authorId 
        : parseInt(updatedFields.authorId as any, 10) || existingPost.authorId;
    }
    
    // Handle boolean conversion
    if (updatedFields.featured !== undefined) {
      processed.featured = typeof updatedFields.featured === 'boolean' 
        ? updatedFields.featured 
        : updatedFields.featured === 'true' 
          ? true 
          : false;
    }

    const updatedPost: Post = {
      ...existingPost,
      ...processed,
      updatedAt: new Date()
    };
    
    console.log("Updating post with data:", updatedPost);
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async searchPosts(query: string): Promise<Post[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.posts.values())
      .filter(post => 
        post.title.toLowerCase().includes(lowerQuery) || 
        post.content.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  // Page content methods
  async getPageContent(id: string): Promise<PageContent | undefined> {
    return this.pageContents.get(id);
  }
  
  async updatePageContent(id: string, content: Partial<InsertPageContent>): Promise<PageContent> {
    const existingContent = this.pageContents.get(id) || { 
      id, 
      title: id.charAt(0).toUpperCase() + id.slice(1), 
      content: '', 
      lastUpdated: new Date() 
    };
    
    const updatedContent: PageContent = {
      ...existingContent,
      ...content,
      lastUpdated: new Date()
    };
    
    this.pageContents.set(id, updatedContent);
    return updatedContent;
  }

  // Seed initial data
  private async seedData() {
    try {
      // Create admin user
      const adminUser: InsertUser = {
        username: "admin",
        password: "password", // Changed to match user expectation
        name: "Admin User",
        isAdmin: true
      };
      const admin = await this.createUser(adminUser);
      
      // Create author
      const authorUser: InsertUser = {
        username: "maichi",
        password: "password", // Changed to match user expectation
        name: "Mai Chi",
        isAdmin: false
      };
      const author = await this.createUser(authorUser);
      
      // Categories removed
      console.log("Categories are removed from the application");
      
      // No pre-loaded posts as requested
      
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  // Post methods
  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.publishedAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async getPostWithDetails(slug: string): Promise<PostWithDetails | undefined> {
    const postRecord = await db.select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    
    if (postRecord.length === 0) return undefined;
    
    const post = postRecord[0];
    const author = await this.getUser(post.authorId);
    
    if (!author) return undefined;
    
    return {
      ...post,
      categoryName: "Uncategorized", // Default value since categories are removed
      categorySlug: "uncategorized", // Default value
      authorName: author.name
    };
  }

  async getFeaturedPost(): Promise<PostWithDetails | undefined> {
    // First try to find a featured post
    const featuredPosts = await db.select()
      .from(posts)
      .where(eq(posts.featured, true))
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    
    if (featuredPosts.length > 0) {
      return this.getPostWithDetails(featuredPosts[0].slug);
    }
    
    // If no featured post, get the most recent post
    const recentPosts = await db.select()
      .from(posts)
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    
    if (recentPosts.length > 0) {
      return this.getPostWithDetails(recentPosts[0].slug);
    }
    
    return undefined;
  }

  async getPostsByCategory(categorySlug: string): Promise<Post[]> {
    // Since categories are removed, return all posts regardless of category
    console.log("getPostsByCategory called with removed categories, returning all posts");
    return this.getAllPosts();
  }

  async createPost(post: InsertPost): Promise<Post> {
    // Convert string date to Date object if needed
    const postData: any = {...post};
    if (typeof postData.publishedAt === 'string') {
      postData.publishedAt = new Date(postData.publishedAt);
    }
    
    // Set default categoryId to 1 since categories are removed
    postData.categoryId = 1; // Default value for compatibility with schema
    console.log("Setting categoryId to 1 for compatibility");
    
    const [newPost] = await db.insert(posts).values(postData).returning();
    return newPost;
  }

  async updatePost(id: number, updatedFields: Partial<InsertPost>): Promise<Post | undefined> {
    // Convert string date to Date object if needed
    const postData: any = {...updatedFields};
    if (typeof postData.publishedAt === 'string') {
      postData.publishedAt = new Date(postData.publishedAt);
    }
    
    // Add updated timestamp
    postData.updatedAt = new Date();
    
    const [updatedPost] = await db
      .update(posts)
      .set(postData)
      .where(eq(posts.id, id))
      .returning();
    
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(eq(posts.id, id));
    
    return !!result;
  }

  async searchPosts(query: string): Promise<Post[]> {
    const searchTerm = `%${query}%`;
    
    return db.select()
      .from(posts)
      .where(
        or(
          like(posts.title, searchTerm),
          like(posts.content, searchTerm),
          like(posts.excerpt, searchTerm)
        )
      )
      .orderBy(desc(posts.publishedAt));
  }
  
  // Site settings methods
  async getSiteSettings(): Promise<SiteSettings> {
    const allSettings = await db.select().from(siteSettings);
    // If we have settings, return the first one
    if (allSettings.length > 0) {
      return allSettings[0];
    }
    
    // Otherwise create default settings
    const [newSettings] = await db
      .insert(siteSettings)
      .values({
        tagline: defaultSiteSettings.tagline,
      })
      .returning();
    
    return newSettings;
  }
  
  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const currentSettings = await this.getSiteSettings();
    
    const [updatedSettings] = await db
      .update(siteSettings)
      .set({
        ...settings,
        updatedAt: new Date()
      })
      .where(eq(siteSettings.id, currentSettings.id))
      .returning();
    
    return updatedSettings;
  }
  
  // Page content methods
  async getPageContent(id: string): Promise<PageContent | undefined> {
    try {
      console.log(`Fetching page content for id: ${id}`);
      const results = await db.select().from(pageContents).where(eq(pageContents.id, id));
      console.log(`Page content query results:`, results);
      
      if (results && results.length > 0) {
        console.log(`Found existing page content for ${id}`);
        return results[0];
      }
      
      // If it's the about page and it doesn't exist, create it with default content
      if (id === 'about') {
        console.log(`About page doesn't exist, creating with default content`);
        // Create with the full default content
        const newContent = await this.updatePageContent('about', {
          ...defaultAboutPageContent,
          id: 'about'
        });
        
        console.log(`Created default about page content:`, newContent);
        return newContent;
      }
      
      console.log(`No page content found for ${id} and no default provided`);
      return undefined;
    } catch (error) {
      console.error(`Error fetching page content for ${id}:`, error);
      throw error;
    }
  }
  
  async updatePageContent(id: string, content: Partial<InsertPageContent>): Promise<PageContent> {
    try {
      console.log(`Updating page content for id: ${id}`, content);
      
      // Check if content already exists but avoid infinite recursion
      const results = await db.select().from(pageContents).where(eq(pageContents.id, id));
      const existingContent = results && results.length > 0 ? results[0] : null;
      
      if (existingContent) {
        console.log(`Existing page content found, updating...`);
        // Update existing content
        const [updatedContent] = await db
          .update(pageContents)
          .set({
            ...content,
            lastUpdated: new Date()
          })
          .where(eq(pageContents.id, id))
          .returning();
        
        console.log(`Updated page content successfully:`, updatedContent);
        return updatedContent;
      } else {
        console.log(`No existing page content, inserting new content...`);
        // Insert new content
        const [newContent] = await db
          .insert(pageContents)
          .values({
            id,
            title: content.title || id.charAt(0).toUpperCase() + id.slice(1),
            content: content.content || '',
            lastUpdated: new Date()
          })
          .returning();
        
        console.log(`Inserted new page content successfully:`, newContent);
        return newContent;
      }
    } catch (error) {
      console.error(`Error updating page content for ${id}:`, error);
      throw error;
    }
  }
  
  // Initialize the database with seed data if needed
  async seedData() {
    try {
      // Check if admin user exists
      const existingAdmin = await this.getUserByUsername('admin');
      
      if (!existingAdmin) {
        // Create admin user
        const adminUser: InsertUser = {
          username: "admin",
          password: "password",  // In production, this would be hashed
          name: "Admin User",
          isAdmin: true
        };
        await this.createUser(adminUser);
      }
      
      // Check if author exists
      const existingAuthor = await this.getUserByUsername('maichi');
      
      if (!existingAuthor) {
        // Create author
        const authorUser: InsertUser = {
          username: "maichi",
          password: "password",  // In production, this would be hashed
          name: "Mai Chi",
          isAdmin: false
        };
        await this.createUser(authorUser);
      }
      
      // Categories removed
      console.log("Categories are removed from the application");
      
      // Ensure we have site settings
      await this.getSiteSettings();
      
      // Ensure we have about page content
      await this.getPageContent('about');
      
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

// Switch to database storage for persistence
export const storage = new DatabaseStorage();

// Initialize the database with seed data
storage.seedData().catch(err => {
  console.error("Failed to seed database:", err);
});