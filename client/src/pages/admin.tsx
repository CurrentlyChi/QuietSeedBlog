import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['/api/posts'],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/posts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
      setPostToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setPostToDelete(id);
  };

  const confirmDelete = () => {
    if (postToDelete !== null) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-primary font-medium">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-4">Error Loading Posts</h2>
          <p className="mb-6 text-gray-600">There was a problem loading the posts. Please try again.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/posts'] })}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-semibold">Post Management</h1>
        <Link href="/admin/new">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {posts && posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium mb-4">No Posts Yet</h2>
          <p className="text-gray-500 mb-6">Start creating content for your blog by adding your first post.</p>
          <Link href="/admin/new">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{formatDate(post.publishedAt)}</TableCell>
                  <TableCell>{post.featured === "true" ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/edit/${post.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the post.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePostMutation.mutate(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Admin;
