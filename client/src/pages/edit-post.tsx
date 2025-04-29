import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategoryOptions } from "@/hooks/use-categories";
import { ArrowLeft, Loader2 } from "lucide-react";

// Create a form schema
const formSchema = insertPostSchema.extend({
  featured: z.enum(["true", "false"]),
});

type FormValues = z.infer<typeof formSchema>;

const EditPost = () => {
  const [match, params] = useRoute<{ id: string }>('/admin/edit/:id');
  const isEditMode = !!match;
  const postId = match ? parseInt(params.id, 10) : null;
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const categoryOptions = useCategoryOptions();

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "Reflection",
      excerpt: "",
      featuredImage: "",
      author: "Olivia Gardens",
      authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      readTime: "5 min read",
      featured: "false",
    },
  });

  // Fetch existing post data if in edit mode
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    enabled: isEditMode,
  });

  // Fill the form with existing data when available
  useEffect(() => {
    if (post && isEditMode) {
      form.reset(post);
    }
  }, [post, form, isEditMode]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/posts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      navigate('/admin');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('PUT', `/api/posts/${postId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      toast({
        title: "Success!",
        description: "Your post has been updated.",
      });
      navigate('/admin');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditMode && postId) {
      updatePostMutation.mutate(values);
    } else {
      createPostMutation.mutate(values);
    }
  };

  const isLoading = isLoadingPost || createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>
        <h1 className="text-3xl font-serif font-semibold">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            {isEditMode ? 'Update Post Details' : 'Post Details'}
          </CardTitle>
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
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
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
                        placeholder="Brief excerpt of the post (appears on cards)" 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="readTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Read Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5 min read" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="URL to the featured image" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use a high-quality image URL that represents your post
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
                    <FormLabel>Content (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter post content in HTML format" 
                        className="min-h-[300px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the full content of your post in HTML format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="URL to the author's profile image" {...field} />
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
                        checked={field.value === "true"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "true" : "false");
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Post</FormLabel>
                      <FormDescription>
                        This post will be highlighted on the homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPost;
