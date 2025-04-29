import { Link } from "wouter";
import { useFeaturedPost } from "@/lib/hooks";
import { formatDate, getReadingTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedPost() {
  const { data: post, isLoading, error } = useFeaturedPost();
  
  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="w-full lg:w-10/12 mx-auto overflow-hidden rounded-2xl shadow-md bg-card relative">
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    );
  }
  
  if (error || !post) {
    return null;
  }
  
  return (
    <section className="mb-16">
      <div className="w-full lg:w-10/12 mx-auto overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-card relative">
        <div className="h-80 w-full bg-muted relative overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <Link href={`/category/${post.categorySlug}`} className="category-pill inline-block px-3 py-1 bg-primary/80 rounded-full text-xs mb-3">
              {post.categoryName}
            </Link>
            <Link href={`/post/${post.slug}`}>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">{post.title}</h2>
            </Link>
            <p className="text-white/90 mb-4 max-w-2xl">
              {post.excerpt}
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/30 overflow-hidden flex items-center justify-center">
                <span className="text-white font-medium">{post.authorName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{post.authorName}</p>
                <p className="text-sm text-white/80">
                  {formatDate(post.publishedAt)} · {getReadingTime(post.content)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
