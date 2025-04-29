import { useState, useEffect } from "react";
import { useLocation, Link, useRoute } from "wouter";
import { useCurrentUser, usePosts, useSiteSettings, useUpdateSiteSettings, usePageContent, useUpdatePageContent } from "@/lib/hooks";
import RichTextEditor from "@/components/ui/rich-text-editor";
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
import { loginSchema, type SiteSettings, type PageContent, type InsertPageContent, User } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
      console.log("Resetting form with settings:", settings);
      settingsForm.reset({
        tagline: settings.tagline,
      });
    }
  }, [settings]); // Remove settingsForm from dependencies to prevent infinite loops

  // Submit settings form
  const onSettingsSubmit = async (values: SettingsFormValues) => {
    try {
      console.log("Submitting settings:", values);
      await updateSettings.mutateAsync(values);
      
      // Add a slight delay to ensure the cache is invalidated properly
      setTimeout(() => {
        toast({
          title: "Settings updated",
          description: "Your site settings have been successfully updated.",
        });
      }, 300);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Page content form
  const { data: aboutPageContent, isLoading: pageContentLoading } = usePageContent("about");
  const updatePageContent = useUpdatePageContent();
  
  // Create page content form schema
  const pageContentFormSchema = z.object({
    title: z.string().min(3, {
      message: "Title must be at least 3 characters.",
    }).max(100, {
      message: "Title must not be longer than 100 characters.",
    }),
    content: z.string().min(20, {
      message: "Content must be at least 20 characters.",
    }),
  });
  
  type PageContentFormValues = z.infer<typeof pageContentFormSchema>;
  
  // Page content form
  const pageContentForm = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentFormSchema),
    defaultValues: {
      title: aboutPageContent?.title || "",
      content: aboutPageContent?.content || "",
    },
  });
  
  // Update form values when page content is loaded
  useEffect(() => {
    if (aboutPageContent) {
      pageContentForm.reset({
        title: aboutPageContent.title,
        content: aboutPageContent.content,
      });
    }
  }, [aboutPageContent]);
  
  // Submit page content form
  const onPageContentSubmit = async (values: PageContentFormValues) => {
    try {
      await updatePageContent.mutateAsync({
        pageId: "about",
        content: values
      });
      
      toast({
        title: "Page content updated",
        description: "The About page content has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page content",
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
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
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
        
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Edit Pages</CardTitle>
              <CardDescription>
                Customize your static page content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pageContentLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-36 w-full" />
                </div>
              ) : (
                <Form {...pageContentForm}>
                  <form onSubmit={pageContentForm.handleSubmit(onPageContentSubmit)} className="space-y-6">
                    <FormField
                      control={pageContentForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Title</FormLabel>
                          <FormDescription>
                            The title that appears at the top of the About page
                          </FormDescription>
                          <FormControl>
                            <Input 
                              placeholder="About The Quiet Seed" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={pageContentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Content</FormLabel>
                          <FormDescription>
                            The main content of the About page (use the toolbar to format text)
                          </FormDescription>
                          <FormControl>
                            <div className="rich-editor-wrapper border rounded-md overflow-hidden">
                              <RichTextEditor 
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Enter your page content"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Last updated: {aboutPageContent ? new Date(aboutPageContent.lastUpdated).toLocaleString() : "Never"}
                      </p>
                      <Button 
                        type="submit" 
                        disabled={updatePageContent.isPending || !pageContentForm.formState.isDirty}
                      >
                        {updatePageContent.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
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

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your admin credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm userId={userData.user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Account settings form component
function AccountSettingsForm({ userId }: { userId: number }) {
  const { toast } = useToast();

  // Create user update schema
  const userUpdateSchema = z.object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }).optional(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }).optional(),
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }).optional(),
  });

  type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

  // Form setup
  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserUpdateFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Clear form
      form.reset({
        username: "",
        password: "",
        name: "",
      });
      
      // Show success message
      toast({
        title: "Account updated",
        description: "Your credentials have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update account settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: UserUpdateFormValues) => {
    // Ensure at least one field is filled
    if (!values.username && !values.password && !values.name) {
      toast({
        title: "Update failed",
        description: "You must fill in at least one field to update",
        variant: "destructive",
      });
      return;
    }
    
    await updateUserMutation.mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormDescription>
                Enter a new username if you want to change it
              </FormDescription>
              <FormControl>
                <Input 
                  placeholder="New username" 
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
              <FormDescription>
                Enter a new password if you want to change it
              </FormDescription>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="New password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormDescription>
                This name will be displayed as the author of your posts
              </FormDescription>
              <FormControl>
                <Input 
                  placeholder="Your display name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Leave fields blank if you don't want to change them
          </p>
          <Button 
            type="submit" 
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Updating..." : "Update Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
