import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { usePosts, usePostsByCategory, useSearchPosts } from "@/lib/hooks";
import FeaturedPost from "@/components/home/FeaturedPost";
import BlogPostLine from "@/components/home/BlogPostLine";
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
  
  // Process posts data to include author name for display
  const processedPosts = paginatedPosts.map(post => {
    // For posts coming directly from the API (without joined data)
    if (!post.authorName) {
      return {
        ...post,
        authorName: "Admin" // Default author
      };
    }
    
    // For posts with properly joined data
    const author = post.author || { username: "Author" };
    
    return {
      ...post,
      authorName: post.authorName || author.username
    };
  });
  
  const renderSkeletons = () => (
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
  );
  
  return (
    <div className="animate-fade-in">
      {!searchQuery && (
        <>
          <FeaturedPost />
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {processedPosts.map(post => (
              <BlogPostLine key={post.id} post={post} />
            ))}
          </div>
        )}
        
        <Pagination 
          totalPages={totalPages} 
          currentPage={currentPage} 
          basePath={basePath || "/"}
        />
      </section>
    </div>
  );
}
