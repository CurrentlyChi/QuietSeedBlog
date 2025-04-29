import { 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Post, type InsertPost, 
  type PostWithDetails,
  type SiteSettings,
  defaultSiteSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private posts: Map<number, Post>;
  private siteSettings: SiteSettings;
  
  private userId: number;
  private categoryId: number;
  private postId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.siteSettings = { ...defaultSiteSettings };
    
    this.userId = 1;
    this.categoryId = 1;
    this.postId = 1;
    
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

    const category = await this.getCategoryById(post.categoryId);
    const author = await this.getUser(post.authorId);

    if (!category || !author) return undefined;

    return {
      ...post,
      categoryName: category.name,
      categorySlug: category.slug,
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
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];

    return Array.from(this.posts.values())
      .filter(post => post.categoryId === category.id)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postId++;
    const newPost: Post = {
      ...post,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async updatePost(id: number, updatedFields: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;

    const updatedPost: Post = {
      ...existingPost,
      ...updatedFields,
      updatedAt: new Date()
    };
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
      
      // Create categories
      const categoryData = [
        { name: "Reflection", slug: "reflection", description: "Thoughtful reflections on mindful living" },
        { name: "How-To", slug: "how-to", description: "Practical guides for mindful practices" },
        { name: "Story", slug: "story", description: "Personal stories of transformation" }
      ];
      
      const categories = await Promise.all(categoryData.map(cat => this.createCategory(cat)));
      
      // No pre-loaded posts as requested
      
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
}

export const storage = new MemStorage();