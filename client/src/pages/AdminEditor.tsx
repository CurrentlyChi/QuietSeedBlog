import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useCurrentUser, useCategories } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPostSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function AdminEditor() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { data: userData, isLoading: authLoading } = useCurrentUser();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const [, params] = useRoute("/admin/edit/:id");
  const isEditing = location.startsWith("/admin/edit/");
  const postId = params?.id ? parseInt(params.id) : null;
  
  // Fetch post if editing
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditing);
  
  // Form schema
  const formSchema = insertPostSchema.extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(10, "Content should be at least 10 characters"),
    excerpt: z.string().min(10, "Excerpt should be at least 10 characters"),
  });
  
  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      categoryId: 0,
      authorId: 0,
      featured: false
    }
  });
  
  // Update slug when title changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title") {
        form.setValue("slug", slugify(value.title || ""));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Fetch post data if editing
  useEffect(() => {
    if (isEditing && postId) {
      const fetchPost = async () => {
        try {
          setIsLoadingPost(true);
          const response = await fetch(`/api/posts/${postId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch post");
          }
          
          const post = await response.json();
          setEditingPost(post);
          
          // Set form values
          form.reset({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            imageUrl: post.imageUrl || "",
            publishedAt: new Date(post.publishedAt).toISOString(),
            categoryId: post.categoryId,
            authorId: post.authorId,
            featured: post.featured
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load post data",
            variant: "destructive"
          });
        } finally {
          setIsLoadingPost(false);
        }
      };
      
      fetchPost();
    }
  }, [isEditing, postId]);
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userData?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create or edit posts",
        variant: "destructive"
      });
      return;
    }
    
    // Set author ID
    values.authorId = userData.user.id;
    
    try {
      if (isEditing && postId) {
        // Update post
        await apiRequest("PUT", `/api/posts/${postId}`, values);
        toast({
          title: "Success",
          description: "Post updated successfully"
        });
      } else {
        // Create new post
        await apiRequest("POST", "/api/posts", values);
        toast({
          title: "Success",
          description: "Post created successfully"
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/featured"] });
      
      // Redirect to admin dashboard
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    }
  };
  
  // Authentication check
  if (authLoading || isLoadingPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-60 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-1/3 mt-4" />
      </div>
    );
  }
  
  if (!userData?.isAuthenticated || !userData.user.isAdmin) {
    navigate("/admin");
    return null;
  }
  
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif text-primary-foreground">
          {isEditing ? "Edit Post" : "Create New Post"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/admin")}>
          Cancel
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Post Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly version of the title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content here..." 
                        className="min-h-[300px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Supports HTML for formatting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief summary of the post..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A short description for previews
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL for the featured image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Post</FormLabel>
                      <FormDescription>
                        Featured posts appear at the top of the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
