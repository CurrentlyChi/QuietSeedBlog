import { 
  users, categories, posts, 
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
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Post methods
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostWithDetails(slug: string): Promise<PostWithDetails | undefined>;
  getFeaturedPost(): Promise<Post | undefined>;
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
    
    // Initialize with default data
    this.seedData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Post methods
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug
    );
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostWithDetails(slug: string): Promise<PostWithDetails | undefined> {
    const post = await this.getPostBySlug(slug);
    if (!post) return undefined;
    
    const category = this.categories.get(post.categoryId);
    const author = this.users.get(post.authorId);
    
    if (!category || !author) return undefined;
    
    const { password, ...authorWithoutPassword } = author;
    
    return {
      ...post,
      category,
      author: authorWithoutPassword,
    };
  }
  
  async getFeaturedPost(): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.featured
    );
  }
  
  async getPostsByCategory(categorySlug: string): Promise<Post[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return Array.from(this.posts.values())
      .filter((post) => post.categoryId === category.id)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date();
    
    // If publishedAt is not provided, use current date
    const publishedAt = insertPost.publishedAt || now;
    
    const post: Post = { 
      ...insertPost, 
      id,
      publishedAt,
      createdAt: now,
      updatedAt: now
    };
    
    this.posts.set(id, post);
    return post;
  }
  
  async updatePost(id: number, updatedFields: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost: Post = {
      ...post,
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
    if (!query) return this.getAllPosts();
    
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.posts.values())
      .filter((post) => 
        post.title.toLowerCase().includes(lowercaseQuery) || 
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  // Seed initial data
  private seedData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In production, this would be hashed
      isAdmin: true
    };
    this.createUser(adminUser).then(user => {
      // Create categories
      const categories: InsertCategory[] = [
        { name: "Reflection", slug: "reflection" },
        { name: "How-To", slug: "how-to" },
        { name: "Story", slug: "story" },
        { name: "Philosophy", slug: "philosophy" }
      ];
      
      Promise.all(categories.map(cat => this.createCategory(cat)))
        .then(savedCategories => {
          // Create sample posts
          const samplePosts: InsertPost[] = [
            {
              title: "The Art of Mindful Presence",
              slug: "the-art-of-mindful-presence",
              content: `<p>In our fast-paced world, we often find ourselves rushing from one task to another, rarely taking the time to fully experience the present moment. Mindful presence is the practice of being fully engaged with whatever we're doing, free from distraction or judgment, with a soft and open awareness.</p>
              
              <p>When we're mindfully present, we're not thinking about what happened earlier, or worrying about the future. We're simply here, now, with an attitude of openness and curiosity.</p>
              
              <h2>Why Mindful Presence Matters</h2>
              
              <p>The quality of our life depends on the quality of our attention. When we're distracted or on autopilot, we miss much of what's happening around and within us. We might eat without tasting, listen without hearing, and look without seeing.</p>
              
              <p>Research has shown that people who practice mindfulness report greater well-being, reduced stress, and improved relationships. By fully experiencing each moment as it unfolds, we can discover a deeper appreciation for our lives.</p>
              
              <h2>Simple Ways to Practice Mindful Presence</h2>
              
              <ul>
                <li>Take three conscious breaths, feeling the sensation of breathing</li>
                <li>Really taste your food by eating slowly and without distractions</li>
                <li>When walking, feel your feet touching the ground</li>
                <li>Listen to someone without planning what you'll say next</li>
                <li>Observe nature with all your senses</li>
              </ul>
              
              <p>Remember that mindfulness isn't about achieving a special state or forcing yourself to relax. It's simply about being aware of what's already here, moment by moment, with kindness and curiosity.</p>
              
              <p>As Thich Nhat Hanh wisely said, "The present moment is filled with joy and happiness. If you are attentive, you will see it."</p>`,
              excerpt: "Discovering the beauty of being fully present in each moment, and how it transforms our experience of everyday life.",
              imageUrl: "https://images.unsplash.com/photo-1508214854206-19cbf82a85c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
              publishedAt: new Date("2023-05-12"),
              categoryId: savedCategories[3].id, // Philosophy
              authorId: user.id,
              featured: true
            },
            {
              title: "Creating a Peaceful Morning Routine",
              slug: "creating-a-peaceful-morning-routine",
              content: `<p>How we start our mornings often sets the tone for the entire day. By creating a peaceful morning routine, we can cultivate a sense of calm and intention that carries us through whatever the day may bring.</p>
              
              <h2>Why Your Morning Matters</h2>
              
              <p>Research shows that willpower and focus are typically strongest in the morning. By dedicating this precious time to activities that nourish your body, mind, and spirit, you're investing in your well-being and effectiveness throughout the day.</p>
              
              <h2>Elements of a Peaceful Morning</h2>
              
              <h3>1. Wake Gently</h3>
              <p>Consider using a sunrise alarm clock that gradually brightens, mimicking natural daylight. This helps your body wake up more naturally than a jarring alarm sound.</p>
              
              <h3>2. Hydrate First</h3>
              <p>After hours without water, your body needs hydration. Start with a glass of room temperature water, perhaps with a squeeze of lemon, before consuming anything else.</p>
              
              <h3>3. Move Mindfully</h3>
              <p>Gentle stretching, yoga, or a short walk helps awaken your body and clear your mind. Focus on how your body feels rather than pushing for performance.</p>
              
              <h3>4. Cultivate Stillness</h3>
              <p>Even five minutes of meditation, deep breathing, or simply sitting quietly with your thoughts can center you for the day ahead.</p>
              
              <h3>5. Nourish Thoughtfully</h3>
              <p>Prepare a nutritious breakfast that will sustain your energy, and eat it without digital distractions.</p>
              
              <h2>Creating Your Personal Routine</h2>
              
              <p>The most sustainable morning routine is one that feels good to you. Experiment with different activities and timings to discover what leaves you feeling centered and energized.</p>
              
              <p>Start small—perhaps with just 15 minutes of intentional morning time—and gradually extend as desired. Remember that consistency matters more than duration.</p>
              
              <p>By giving yourself the gift of peaceful mornings, you're not being selfish; you're ensuring that you bring your best self to everything and everyone you encounter throughout your day.</p>`,
              excerpt: "Start your day with intention and calm. This guide shows you how to craft a morning ritual that grounds you for the day ahead.",
              imageUrl: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              publishedAt: new Date("2023-04-28"),
              categoryId: savedCategories[1].id, // How-To
              authorId: user.id,
              featured: false
            },
            {
              title: "Finding Stillness in a Busy World",
              slug: "finding-stillness-in-a-busy-world",
              content: `<p>In our hyperconnected, always-on world, moments of true stillness have become increasingly rare. Yet it's often in these quiet spaces that we find clarity, creativity, and a deeper connection to ourselves.</p>
              
              <p>I've spent much of my life in perpetual motion—physically, mentally, digitally. Always doing, planning, consuming, producing. It took a period of burnout to help me realize that this constant activity wasn't making my life richer; it was depleting it.</p>
              
              <h2>The Noise That Surrounds Us</h2>
              
              <p>External noise is obvious—traffic, notifications, the hum of appliances. But internal noise can be even more disruptive: the endless stream of thoughts, worries about the future, ruminations about the past, and the pressure to optimize every aspect of our lives.</p>
              
              <p>This noise doesn't just rob us of peace; it fragments our attention and disconnects us from the depth of our experience.</p>
              
              <h2>Creating Pockets of Stillness</h2>
              
              <p>I've found that cultivating stillness doesn't require dramatic life changes or hours of meditation (though those can be wonderful). Instead, it's about creating small pockets of quiet throughout our days:</p>
              
              <ul>
                <li>Pausing for three deep breaths before responding to an email or message</li>
                <li>Sitting in my garden for five minutes with no purpose other than to be there</li>
                <li>Walking without headphones, just noticing the world around me</li>
                <li>Creating a digital sunset—no screens for the hour before bed</li>
                <li>Morning moments of silence with tea before the day begins</li>
              </ul>
              
              <p>These moments might seem insignificant, but they're gateways to a different quality of awareness—one where we're not caught in the trance of doing, but simply being.</p>
              
              <h2>What Stillness Offers</h2>
              
              <p>In these quiet spaces, I've found gifts that the noise never provided: insights that bubble up when my mind isn't crowded, a deeper appreciation for simple pleasures, and a more compassionate relationship with myself.</p>
              
              <p>Perhaps most valuably, stillness helps me differentiate between the urgent and the important, between societal expectations and what truly matters to me.</p>
              
              <p>As the poet Rumi said, "In silence there is eloquence." May we all find moments to listen to that eloquent silence amid our busy lives.</p>`,
              excerpt: "Modern life moves at a relentless pace. Here's how I found moments of quiet contemplation amidst the noise and haste.",
              imageUrl: "https://images.unsplash.com/photo-1560421683-6856ea585c78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              publishedAt: new Date("2023-04-15"),
              categoryId: savedCategories[0].id, // Reflection
              authorId: user.id,
              featured: false
            },
            {
              title: "The Elegance of Simple Living",
              slug: "the-elegance-of-simple-living",
              content: `<p>There's an undeniable elegance to simplicity. When we pare away the unnecessary—whether in our physical spaces, our schedules, or our mental landscapes—what remains often has a clarity and beauty that was previously obscured.</p>
              
              <h2>Beyond Minimalism</h2>
              
              <p>Simple living isn't just about owning fewer things, though that can be part of it. It's about making conscious choices about what we allow into our lives. It's quality over quantity, depth over breadth, and intentionality over default settings.</p>
              
              <p>When we approach life with this filter, asking "Does this add genuine value?" rather than "Could this possibly be useful someday?", our surroundings naturally become more aligned with what truly matters to us.</p>
              
              <h2>The Freedom of Enough</h2>
              
              <p>Society constantly tells us we need more—more possessions, more achievements, more experiences—to be happy. But there's profound liberation in recognizing what constitutes "enough" for us personally.</p>
              
              <p>When we know what enough looks like, we're free from the endless treadmill of acquisition and accumulation. We can stop running and start being.</p>
              
              <h2>Simple Living in Practice</h2>
              
              <p>Embracing simplicity might involve:</p>
              
              <ul>
                <li>Creating breathing room in your schedule</li>
                <li>Focusing on relationships that nourish you</li>
                <li>Preparing meals with few but quality ingredients</li>
                <li>Curating a wardrobe of items you truly enjoy wearing</li>
                <li>Designing your home for comfort and function, not impression</li>
                <li>Limiting information intake to what serves your values and interests</li>
              </ul>
              
              <h2>The Aesthetics of Less</h2>
              
              <p>There's a visual calm that comes with simplicity. When our eyes have fewer things to process, we can appreciate the beauty of what remains. The sunlight falling across a wooden table. The perfect curve of a ceramic bowl. The texture of linen. The space between objects.</p>
              
              <p>This visual calm often translates to mental calm, allowing our thoughts to settle like water in a still pond.</p>
              
              <h2>An Ongoing Practice</h2>
              
              <p>Simple living isn't a destination but a continual rebalancing. Life has a way of becoming complicated again if we're not mindful.</p>
              
              <p>But each time we choose to simplify—to release what doesn't serve us and create space for what does—we reaffirm our commitment to a life defined not by its possessions or packed schedules, but by its meaning and presence.</p>
              
              <p>As Anne Morrow Lindbergh wrote, "One cannot collect all the beautiful shells on the beach...One can collect only a few, and they are more beautiful if they are few."</p>`,
              excerpt: "Exploring how paring down our possessions and commitments can open up space for what truly matters in our lives.",
              imageUrl: "https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              publishedAt: new Date("2023-03-30"),
              categoryId: savedCategories[3].id, // Philosophy
              authorId: user.id,
              featured: false
            },
            {
              title: "Journaling for Self-Discovery",
              slug: "journaling-for-self-discovery",
              content: `<p>There's something magical about the connection between pen, paper, and our deepest thoughts. Journaling creates a sacred space for self-exploration, offering clarity in a noisy world and insight into patterns we might otherwise miss.</p>
              
              <h2>Why Journal?</h2>
              
              <p>The benefits of journaling extend far beyond record-keeping:</p>
              
              <ul>
                <li>It helps us process emotions and experiences</li>
                <li>It reveals patterns in our thoughts and behaviors</li>
                <li>It provides perspective on our growth over time</li>
                <li>It clarifies our values and aspirations</li>
                <li>It serves as a trusted confidant for our unfiltered thoughts</li>
              </ul>
              
              <p>Research even suggests that regular journaling can strengthen immune function, decrease stress, and improve mood.</p>
              
              <h2>Getting Started: The Blank Page</h2>
              
              <p>Many people feel intimidated by an empty journal. Remember that your journal is for you alone—there's no right or wrong way to fill its pages. Some helpful approaches for beginners:</p>
              
              <h3>Start Simple</h3>
              <p>Begin with just 5-10 minutes of writing. You might list three things you're grateful for or simply describe your day.</p>
              
              <h3>Create Comfort</h3>
              <p>Choose a journal that feels inviting and a pen that flows nicely. Find a quiet, comfortable spot for your practice.</p>
              
              <h3>Release Judgment</h3>
              <p>Your journal isn't a literary work—it's a tool for self-discovery. Spelling, grammar, and eloquence don't matter here.</p>
              
              <h2>Journaling Prompts for Self-Discovery</h2>
              
              <p>When you're ready to go deeper, try these prompts:</p>
              
              <ul>
                <li>What am I feeling right now, and where do I feel it in my body?</li>
                <li>When did I feel most alive today?</li>
                <li>What's something I believe now that I didn't five years ago?</li>
                <li>If I could talk to my younger self, what would I say?</li>
                <li>What am I avoiding thinking about?</li>
                <li>When do I feel most authentically myself?</li>
                <li>What does my ideal day look like?</li>
              </ul>
              
              <h2>Different Journaling Approaches</h2>
              
              <p>As you develop your practice, you might explore different methods:</p>
              
              <h3>Stream of Consciousness</h3>
              <p>Write continuously without editing or censoring, letting thoughts flow freely.</p>
              
              <h3>Structured Reflection</h3>
              <p>Use specific prompts or questions to guide your writing.</p>
              
              <h3>Gratitude Journal</h3>
              <p>Focus on recording things you appreciate about your life.</p>
              
              <h3>Dialogue Journaling</h3>
              <p>Have a conversation on paper with different parts of yourself, other people, or even concepts like fear or creativity.</p>
              
              <h2>A Journey, Not a Destination</h2>
              
              <p>Like any practice, journaling becomes richer over time. Don't worry about writing every day—consistency matters more than frequency. Even once a week can yield meaningful insights.</p>
              
              <p>The true value often emerges when you revisit earlier entries and witness your own evolution. As you continue journaling, you may be surprised by the wisdom you discover—not from some external source, but from within yourself.</p>`,
              excerpt: "A beginner's guide to using journaling as a tool for reflection, clarity, and personal growth with simple prompts to get started.",
              imageUrl: "https://images.unsplash.com/photo-1615800001964-5afd0ae8e49a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              publishedAt: new Date("2023-03-15"),
              categoryId: savedCategories[1].id, // How-To
              authorId: user.id,
              featured: false
            },
            {
              title: "How I Found Balance After Burnout",
              slug: "how-i-found-balance-after-burnout",
              content: `<p>Three years ago, I was the poster child for hustle culture. I wore my 60-hour workweeks like a badge of honor. I multi-tasked constantly, answered emails at midnight, and believed that rest was something I'd earn "someday" when I'd achieved enough. My body had been sending warning signals for months—persistent headaches, disturbed sleep, a perpetual knot in my stomach—but I ignored them all.</p>
              
              <p>Until one Tuesday morning, when I couldn't get out of bed.</p>
              
              <p>It wasn't physical illness that kept me there, though my immune system had certainly taken a hit. It was a bone-deep exhaustion that no amount of coffee could touch, combined with an overwhelming sense that I simply couldn't face another day of pushing myself so relentlessly.</p>
              
              <h2>The Slow Descent</h2>
              
              <p>Burnout didn't happen overnight. Looking back, I can trace its development:</p>
              
              <p>It began with working through lunch breaks and staying late "just to finish one more thing." Then came the working weekends, initially "just this once" but gradually becoming routine. Sleep suffered as my mind couldn't switch off from work problems. Relationships became secondary to deadlines. Activities that once brought me joy—hiking, cooking, playing guitar—fell away because they felt "unproductive."</p>
              
              <p>I'd created a life that was all output and no input.</p>
              
              <h2>The Turning Point</h2>
              
              <p>That morning, unable to continue as I had been, became my reluctant awakening. My doctor was clear: this wasn't weakness or laziness—it was my body and mind enforcing the rest I'd refused to give them voluntarily.</p>
              
              <p>I took a medical leave of absence—something I'd previously have considered unthinkable. In the strange emptiness that followed, without the constant validation of achievement, I had to face some uncomfortable questions: Who was I without my work? What was I trying to prove, and to whom? What did "success" even mean if it came at the cost of my health and happiness?</p>
              
              <h2>Rebuilding with Balance</h2>
              
              <p>Recovery wasn't linear, and it wasn't quick. It involved not just rest, but a fundamental reevaluation of how I lived. Gradually, I began incorporating principles of slow living:</p>
              
              <h3>Boundaries</h3>
              <p>I established clear work hours and honored them. I removed email from my phone and created separation between work and home.</p>
              
              <h3>Presence</h3>
              <p>I practiced being fully engaged with whatever I was doing, rather than mentally drafting emails while having dinner with friends.</p>
              
              <h3>Pleasure</h3>
              <p>I reintroduced activities done purely for enjoyment, with no productivity goal attached.</p>
              
              <h3>Rest</h3>
              <p>I began treating rest as a non-negotiable part of my schedule, not a reward for working hard enough.</p>
              
              <h3>Meaning</h3>
              <p>I reconnected with my deeper values and began making decisions based on them, not external metrics of success.</p>
              
              <h2>Where I Am Now</h2>
              
              <p>Today, my life looks very different. I still work, and I still care about doing good work, but it's no longer the center of my identity or the sole measure of my worth.</p>
              
              <p>I've learned to recognize early warning signs of overwhelm and to respond with self-compassion rather than self-criticism. I've discovered that I'm actually more effective when I work fewer hours but with greater presence and clarity.</p>
              
              <p>Most importantly, I've realized that a well-lived life contains many elements—connection, curiosity, contribution, rest, joy, meaning—and that sustainable success must honor all of them.</p>
              
              <p>The irony isn't lost on me that I had to break down completely before I could build a more balanced life. But if sharing my experience helps even one person recognize and change their own path before reaching that point, then perhaps that difficult chapter served a purpose beyond my own learning.</p>`,
              excerpt: "My personal journey through corporate burnout and how slow living principles helped me rebuild a more sustainable life.",
              imageUrl: "https://images.unsplash.com/photo-1518655048521-f130df041f66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              publishedAt: new Date("2023-02-28"),
              categoryId: savedCategories[2].id, // Story
              authorId: user.id,
              featured: false
            }
          ];
          
          // Save the posts
          Promise.all(samplePosts.map(post => this.createPost(post)))
            .then(() => {
              console.log("Sample data created successfully");
            });
        });
    });
  }
}

export const storage = new MemStorage();
