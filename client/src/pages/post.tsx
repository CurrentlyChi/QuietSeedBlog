import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Twitter, Facebook, PenTool, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Post = () => {
  const [match, params] = useRoute<{ id: string }>('/post/:id');
  const postId = match ? parseInt(params.id, 10) : null;

  const { data: post, isLoading, isError } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse text-primary font-medium">Loading post...</div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-xl font-medium text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-500 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button variant="outline">Back to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <img className="w-full h-64 object-cover" src={post.featuredImage} alt={post.title} />
        
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-6">
            <Link href="/">
              <a className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to articles
              </a>
            </Link>
          </div>
          
          <span className="inline-block bg-secondary text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
            {post.category}
          </span>
          
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center mb-8">
            <img className="h-10 w-10 rounded-full" src={post.authorImage} alt={post.author} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={post.publishedAt.toString()}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          <Separator className="my-8" />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share this article</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Pinterest</span>
                <PenTool className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
