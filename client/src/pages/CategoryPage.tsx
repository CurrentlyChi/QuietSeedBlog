import { useRoute } from "wouter";
import { useState } from "react";
import { usePostsByCategory, usePosts } from "@/lib/hooks";
import { Post, PostWithDetails } from "@shared/schema";
import BlogPostLine from "@/components/home/BlogPostLine";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug;
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  // Use appropriate hook based on category
  const { data: categoryPosts = [], isLoading: categoryLoading, error: categoryError } = usePostsByCategory(categorySlug);
  const { data: allPosts = [], isLoading: allPostsLoading, error: allPostsError } = usePosts();
  
  // Select data source based on category with proper typing
  const posts: Post[] = categorySlug === 'all' ? (allPosts as Post[]) : (categoryPosts as Post[]);
  const isLoading = categorySlug === 'all' ? allPostsLoading : categoryLoading;
  const error = categorySlug === 'all' ? allPostsError : categoryError;
  
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="py-5 border-b border-muted last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="hidden sm:block h-24 w-24 rounded-md" />
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
  let categoryName;
  if (categorySlug === 'all') {
    categoryName = 'All Posts';
  } else {
    categoryName = posts.length > 0 
      ? posts[0].categoryName 
      : categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1);
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-primary-foreground mb-3">{categoryName}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {posts.length === 0 ? 
            "No posts in this category yet. Check back soon for new content!" : 
            categorySlug === 'all' ?
              `Explore our complete collection of ${posts.length} posts` :
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
          <section className="mb-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {paginatedPosts.map((post: Post) => (
                <BlogPostLine key={post.id} post={post} />
              ))}
            </div>
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