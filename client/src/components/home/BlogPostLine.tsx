import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

interface BlogPostLineProps {
  post: {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    publishedAt: string | Date;
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    authorName: string;
  };
}

export default function BlogPostLine({ post }: BlogPostLineProps) {
  return (
    <article className="blog-post py-5 border-b border-muted last:border-b-0">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link 
              href={`/category/${post.categorySlug}`}
              className="text-xs px-2 py-0.5 bg-primary/10 text-primary-foreground rounded-md hover:bg-primary/20 transition-colors"
            >
              {post.categoryName}
            </Link>
            <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
          </div>
          
          <h3 className="font-serif text-lg font-medium text-foreground mb-2 hover:text-primary transition-colors">
            <Link href={`/post/${post.slug}`}>{post.title}</Link>
          </h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center mr-2">
              <span className="text-primary-foreground text-xs font-medium">{post.authorName ? post.authorName.charAt(0) : 'A'}</span>
            </div>
            <span className="text-xs text-muted-foreground">{post.authorName || 'Anonymous'}</span>
          </div>
        </div>
        
        {post.imageUrl && (
          <div className="hidden sm:block w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </article>
  );
}
