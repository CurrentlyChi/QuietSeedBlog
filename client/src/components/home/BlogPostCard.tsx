import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

interface BlogPostCardProps {
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

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="blog-post bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-48 bg-muted relative overflow-hidden">
        <img 
          src={post.imageUrl || 'https://images.unsplash.com/photo-1508214854206-19cbf82a85c0?ixlib=rb-4.0.3'} 
          alt={post.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <Link 
          href={`/category/${post.categorySlug}`}
          className="absolute top-3 left-3 category-pill px-3 py-1 bg-primary/80 text-white rounded-full text-xs"
        >
          {post.categoryName}
        </Link>
      </div>
      
      <div className="p-6">
        <h3 className="font-serif text-xl font-medium text-foreground mb-2 hover:text-primary transition-colors">
          <Link href={`/post/${post.slug}`}>{post.title}</Link>
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-medium">{post.authorName ? post.authorName.charAt(0) : 'A'}</span>
            </div>
            <span className="text-xs text-muted-foreground">{post.authorName || 'Anonymous'}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
