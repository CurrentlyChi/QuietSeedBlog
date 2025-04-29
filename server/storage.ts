import { 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Post, type InsertPost, 
  type PostWithDetails 
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private posts: Map<number, Post>;
  
  private userId: number;
  private categoryId: number;
  private postId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.postId = 1;
    
    this.seedData();
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
    const featuredPost = Array.from(this.posts.values()).find(post => post.featured === true || post.featured === "true");
    if (!featuredPost) return undefined;
    
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
        password: "admin123",
        name: "Admin User",
        isAdmin: true
      };
      const admin = await this.createUser(adminUser);
      
      // Create author
      const authorUser: InsertUser = {
        username: "maichi",
        password: "password123",
        name: "Mai Chi",
        isAdmin: false
      };
      const author = await this.createUser(authorUser);
      
      // Create categories
      const categoryData = [
        { name: "Reflection", slug: "reflection", description: "Thoughtful reflections on mindful living" },
        { name: "How-To", slug: "how-to", description: "Practical guides for mindful practices" },
        { name: "Story", slug: "story", description: "Personal stories of transformation" },
        { name: "Philosophy", slug: "philosophy", description: "Exploring philosophical aspects of mindfulness" }
      ];
      
      const categories = await Promise.all(categoryData.map(cat => this.createCategory(cat)));
      
      // Create posts
      const post1: InsertPost = {
        title: "Finding Stillness in a Busy World",
        slug: "finding-stillness-in-a-busy-world",
        content: "In the hustle of modern life, we often forget to pause and listen to the quietness within. The constant notifications, endless to-do lists, and societal pressure to always be productive can leave us feeling disconnected from ourselves and the world around us.",
        excerpt: "In the hustle of modern life, we often forget to pause and listen to the quietness within. This reflection explores how to create moments of tranquility even on the busiest days...",
        imageUrl: "https://images.unsplash.com/photo-1598901847919-b95dd0fabbb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
        publishedAt: new Date("2023-06-12"),
        categoryId: categories[0].id,
        authorId: author.id,
        featured: "true"
      };
      await this.createPost(post1);
      
      const post2: InsertPost = {
        title: "5 Simple Morning Rituals for Inner Peace",
        slug: "5-simple-morning-rituals",
        content: "Morning routines set the tone for your entire day. When we begin our day mindfully, we're more likely to carry that sense of calm and intention throughout our hours.",
        excerpt: "Start your day with intention and calm. These five morning practices take just minutes but can transform your entire day...",
        imageUrl: "https://images.unsplash.com/photo-1532686942355-a422d8144d29?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        publishedAt: new Date("2023-05-28"),
        categoryId: categories[1].id,
        authorId: author.id,
        featured: "false"
      };
      await this.createPost(post2);
      
      const post3: InsertPost = {
        title: "The Forgotten Art of Letter Writing",
        slug: "forgotten-art-of-letter-writing",
        content: "In our digital age of instant messages and quick emails, the art of letter writing has become increasingly rare. Yet there's something uniquely meaningful about putting pen to paper.",
        excerpt: "In a world of instant messages, discover why putting pen to paper can become a profound mindfulness practice and deepen your connections...",
        imageUrl: "https://images.unsplash.com/photo-1635445525049-e4bd640a8850?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        publishedAt: new Date("2023-05-15"),
        categoryId: categories[3].id,
        authorId: author.id,
        featured: "false"
      };
      await this.createPost(post3);
      
      const post4: InsertPost = {
        title: "What I Learned From a Month Without Internet",
        slug: "month-without-internet",
        content: "Last summer, I made a decision that many would consider radical: I spent an entire month in a remote countryside cottage with no internet connection.",
        excerpt: "A personal journey through thirty days of digital detox in a remote countryside cottage changed my relationship with technology forever...",
        imageUrl: "https://images.unsplash.com/photo-1472157592780-9e5265f17f8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        publishedAt: new Date("2023-05-05"),
        categoryId: categories[2].id,
        authorId: author.id,
        featured: "false"
      };
      await this.createPost(post4);
      
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
}

export const storage = new MemStorage();