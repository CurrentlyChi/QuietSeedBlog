import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import RichTextEditor from "@/components/ui/rich-text-editor";
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
// Category selection has been removed
import { ArrowLeft, Loader2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// UPDATED VERSION v2 - Create a simplified form schema that doesn't transform date, just validates presence
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  publishedAt: z.string().min(1, "Publish date is required"),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.number().int().positive(),
  authorId: z.number().int().positive(),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const EditPost = () => {
  const [match, params] = useRoute<{ id: string }>('/admin/edit/:id');
  const isEditMode = !!match;
  const postId = match ? parseInt(params.id, 10) : null;
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Set up the form with simple string date
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      excerpt: "",
      imageUrl: "",
      publishedAt: formattedDate, // Simple YYYY-MM-DD string
      categoryId: 1, // Reflection category
      authorId: 1, // Admin user
      featured: false, // Boolean value
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
    // We're keeping this super simple now - no date conversions
    const processedValues = {
      ...values,
      // The date is already a string from the text input
      // Just make sure it's in YYYY-MM-DD format (match pattern)
      publishedAt: values.publishedAt,
      // Ensure featured is a boolean
      featured: !!values.featured
    };
    
    // Log the values to help with debugging
    console.log("Form values before submission:", processedValues);
    console.log("publishedAt value:", processedValues.publishedAt);
    console.log("publishedAt type:", typeof processedValues.publishedAt);
    
    try {
      if (isEditMode && postId) {
        updatePostMutation.mutate(processedValues);
      } else {
        createPostMutation.mutate(processedValues);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: `Submission error: ${error}`,
        variant: "destructive",
      });
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

              <div className="grid grid-cols-1 gap-6">
                {/* Category ID is set to default value and hidden */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Super simplified date input */}
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="YYYY-MM-DD" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter date in YYYY-MM-DD format (e.g., 2025-04-29)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Add slug field */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="Post URL path (e.g. my-first-post)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="rich-editor-wrapper border rounded-md overflow-hidden">
                        <RichTextEditor 
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Write your post content here..."
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Format your content using the toolbar above
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden authorId field - we'll always use the current logged in user */}
              <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked || false);
                          // Now using boolean values directly
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
