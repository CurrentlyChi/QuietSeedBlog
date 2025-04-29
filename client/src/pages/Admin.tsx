import { useState, useEffect } from "react";
import { useLocation, Link, useRoute } from "wouter";
import { useCurrentUser, usePosts, useSiteSettings, useUpdateSiteSettings } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { loginSchema, type SiteSettings } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export default function Admin() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { data: userData, isLoading: authLoading, refetch } = useCurrentUser();
  const { data: posts, isLoading: postsLoading } = usePosts();
  
  // Login form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await apiRequest("POST", "/api/login", values);
      await refetch();
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };
  
  // Delete post
  const deletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/posts/${id}`, {});
      
      // Invalidate posts cache
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/featured"] });
      
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };
  
  // If not authenticated, show login form
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }
  
  if (!userData?.isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
            
            <p className="text-center text-muted-foreground text-sm mt-4">
              Use username: admin, password: admin123 to login
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If not admin, show error
  if (!userData.user.isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <h2 className="text-2xl font-serif text-primary-foreground mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You need administrator privileges to access this page.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }
  
  // Site settings form
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  // Create settings form schema
  const settingsFormSchema = z.object({
    tagline: z.string().min(10, {
      message: "Tagline must be at least 10 characters.",
    }).max(200, {
      message: "Tagline must not be longer than 200 characters.",
    }),
  });

  type SettingsFormValues = z.infer<typeof settingsFormSchema>;

  // Settings form
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      tagline: settings?.tagline || "",
    },
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        tagline: settings.tagline,
      });
    }
  }, [settings, settingsForm]);

  // Submit settings form
  const onSettingsSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings.mutateAsync(values);
      toast({
        title: "Settings updated",
        description: "Your site settings have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Admin dashboard
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif text-primary-foreground">Admin Dashboard</h1>
        <Link href="/admin/new">
          <Button>Create New Post</Button>
        </Link>
      </div>
      
      <Tabs defaultValue="posts" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Manage Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="flex justify-between items-center p-3 border border-muted rounded-md">
                      <div>
                        <Link href={`/post/${post.slug}`} className="text-primary-foreground font-medium hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(post.publishedAt)} · {post.featured ? "Featured" : "Regular"}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/admin/edit/${post.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No posts found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Customize your blog settings and appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <FormField
                      control={settingsForm.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blog Tagline</FormLabel>
                          <FormDescription>
                            This appears on your homepage and helps visitors understand what your blog is about
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your blog tagline" 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={updateSettings.isPending || !settingsForm.formState.isDirty}
                    >
                      {updateSettings.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
