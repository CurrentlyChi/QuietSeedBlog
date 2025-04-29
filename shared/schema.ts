import { pgTable, text, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
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
