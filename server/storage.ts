import { 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Post, type InsertPost, 
  type PostWithDetails,
  type SiteSettings,
  type PageContent, type InsertPageContent,
  defaultSiteSettings,
  defaultAboutPageContent
} from "@shared/schema";

export interface IStorage {
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

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.siteSettings = { ...defaultSiteSettings };
    this.pageContents = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.postId = 1;
    
    // Initialize the about page content
    this.pageContents.set('about', { ...defaultAboutPageContent });
    
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
      categoryId: typeof post.categoryId === 'number' ? post.categoryId : 1,
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