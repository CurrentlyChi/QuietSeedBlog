import { useRoute, Link } from "wouter";
import { usePost } from "@/lib/hooks";
import { formatDate, getReadingTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Newsletter from "@/components/home/Newsletter";

export default function BlogPost() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug;
  
  const { data: post, isLoading, error } = usePost(slug);
  
  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <Skeleton className="h-80 w-full rounded-2xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-5 w-full my-3" />
        ))}
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-serif text-primary-foreground mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/" className="text-primary hover:text-primary-foreground transition-colors">
          ← Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <div className="h-80 w-full rounded-2xl overflow-hidden mb-8">
            <img 
              src={post.imageUrl || 'https://images.unsplash.com/photo-1508214854206-19cbf82a85c0?ixlib=rb-4.0.3'} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <Link 
            href={`/category/${post.category.slug}`}
            className="inline-block px-3 py-1 bg-primary/80 text-white rounded-full text-xs mb-3"
          >
            {post.category.name}
          </Link>
          
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
              <span className="text-primary-foreground">{post.author.username.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{post.author.username}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(post.publishedAt)} · {getReadingTime(post.content)}
              </p>
            </div>
          </div>
        </header>
        
        {/* Post Content */}
        <div 
          className="prose max-w-none prose-headings:font-serif prose-headings:text-primary-foreground prose-p:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary-foreground prose-a:transition-colors prose-img:rounded-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      
      {/* Post Footer */}
      <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-muted">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-primary hover:text-primary-foreground transition-colors">
            ← Back to Home
          </Link>
          <Link href={`/category/${post.category.slug}`} className="text-primary hover:text-primary-foreground transition-colors">
            More in {post.category.name} →
          </Link>
        </div>
      </div>
      
      <Newsletter />
    </div>
  );
}
