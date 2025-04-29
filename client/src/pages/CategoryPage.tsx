import { useRoute } from "wouter";
import { useState } from "react";
import { usePostsByCategory } from "@/lib/hooks";
import BlogPostCard from "@/components/home/BlogPostCard";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug;
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  const { data: posts = [], isLoading, error } = usePostsByCategory(categorySlug);
  
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl overflow-hidden shadow-sm">
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !posts) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif text-primary-foreground mb-4">Error Loading Posts</h2>
          <p className="text-muted-foreground">We couldn't load the posts for this category. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  // Find category name from the first post or display default
  const categoryName = posts.length > 0 
    ? posts[0].categoryName 
    : categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-primary-foreground mb-3">{categoryName}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {posts.length === 0 ? 
            "No posts in this category yet. Check back soon for new content!" : 
            `Explore our collection of ${posts.length} posts about ${categoryName?.toLowerCase()}`
          }
        </p>
      </header>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">There are no posts in this category yet.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {paginatedPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </section>
          
          {totalPages > 1 && (
            <Pagination 
              totalPages={totalPages} 
              currentPage={currentPage} 
              onPageChange={setCurrentPage} 
              className="my-8" 
              basePath={`/category/${categorySlug}`}
            />
          )}
        </>
      )}
    </div>
  );
}