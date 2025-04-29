import { pgTable, text, serial, timestamp, varchar, boolean, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true,
  createdAt: true,
});

// Post schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  categoryId: serial("category_id").references(() => categories.id).notNull(),
  authorId: serial("author_id").references(() => users.id).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create a custom insert schema that handles publishedAt as a string
export const insertPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  publishedAt: z.string().min(1),  // Accept string format
  categoryId: z.number().int().positive(),
  authorId: z.number().int().positive(),
  featured: z.boolean().default(false),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PostWithDetails = Post & {
  categoryName: string;
  categorySlug: string;
  authorName: string;
};

export type Login = z.infer<typeof loginSchema>;

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
}));

// Site settings schema
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  tagline: text("tagline").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

export const defaultSiteSettings: InsertSiteSettings = {
  tagline: "A personal space for mindful reflections and thoughtful stories about slow living."
};

// Page content schema
export const pageContents = pgTable("page_contents", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertPageContentSchema = createInsertSchema(pageContents).omit({
  lastUpdated: true,
});

export type PageContent = typeof pageContents.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;

export const defaultAboutPageContent: InsertPageContent = {
  id: 'about',
  title: 'About The Quiet Seed',
  content: `<div>
<p>Welcome to The Quiet Seed, a personal space dedicated to mindful reflections and thoughtful stories about finding balance in our fast-paced world.</p>
<p>This blog was created as a digital garden where ideas can grow slowly and organically. In a world of constant notifications and endless scrolling, The Quiet Seed offers a moment to pause, reflect, and appreciate the smaller moments that make life meaningful.</p>
<p>Here you'll find essays on mindfulness, personal growth, and the art of slow living. Each post is written with care and intention, focusing on quality over quantity.</p>
</div>
<h2>About the Author</h2>
<div>
<p>Hi, I'm Mai Chi. I'm the creator and writer behind The Quiet Seed. With a background in mindfulness practices and a passion for thoughtful writing, I started this blog as a way to share my journey toward a more intentional life.</p>
<p>When I'm not writing, you can find me tending to my small garden, reading books on slow living, or enjoying a cup of tea while watching the rain. I believe in the power of slowing down and paying attention to the present moment.</p>
<p>I'm so glad you're here, and I hope The Quiet Seed can be a small sanctuary of calm in your digital day.</p>
</div>`
};
