import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { usePosts, usePostsByCategory, useSearchPosts } from "@/lib/hooks";
import FeaturedPost from "@/components/home/FeaturedPost";
import CategoryFilter from "@/components/home/CategoryFilter";
import BlogPostCard from "@/components/home/BlogPostCard";
import Newsletter from "@/components/home/Newsletter";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [location] = useLocation();
  const [, params] = useRoute("/category/:slug");
  const [, searchParams] = useRoute("/search");
  
  const categorySlug = params?.slug;
  const searchQuery = searchParams ? new URLSearchParams(window.location.search).get("q") || "" : "";
  
  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Determine which query to use based on route
  const { data: allPosts, isLoading: allPostsLoading } = usePosts();
  const { data: categoryPosts, isLoading: categoryPostsLoading } = usePostsByCategory(categorySlug);
  const { data: searchResults, isLoading: searchLoading } = useSearchPosts(searchQuery);
  
  let posts = allPosts;
  let isLoading = allPostsLoading;
  let title = "Recent Posts";
  let basePath = "";
  
  if (categorySlug) {
    posts = categoryPosts;
    isLoading = categoryPostsLoading;
    title = `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Posts`;
    basePath = `/category/${categorySlug}`;
  } else if (searchQuery) {
    posts = searchResults;
    isLoading = searchLoading;
    title = `Search Results for "${searchQuery}"`;
    basePath = `/search?q=${encodeURIComponent(searchQuery)}`;
  }
  
  // Calculate pagination
  const totalPages = posts ? Math.ceil(posts.length / POSTS_PER_PAGE) : 0;
  const paginatedPosts = posts
    ? posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
    : [];
  
  // Reset to page 1 when changing routes
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, searchQuery]);
  
  // Process posts data to include category name for display
  const processedPosts = paginatedPosts.map(post => {
    const category = post.category || { name: "Category", slug: "category" };
    const author = post.author || { username: "Author" };
    
    return {
      ...post,
      categoryName: category.name,
      categorySlug: category.slug,
      authorName: author.username
    };
  });
  
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
          <Skeleton className="h-48 w-full" />
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="animate-fade-in">
      {!searchQuery && (
        <>
          <FeaturedPost />
          <CategoryFilter />
        </>
      )}
      
      <section>
        <h2 className="font-serif text-2xl text-primary-foreground mb-6">{title}</h2>
        
        {isLoading ? (
          renderSkeletons()
        ) : posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        
        <Pagination 
          totalPages={totalPages} 
          currentPage={currentPage} 
          basePath={basePath || "/"}
        />
      </section>
      
      <Newsletter />
    </div>
  );
}
