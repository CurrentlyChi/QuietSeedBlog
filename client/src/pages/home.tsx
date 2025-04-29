import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import FeaturedPost from "@/components/featured-post";
import PostCard from "@/components/post-card";
import CategoryFilter from "@/components/category-filter";
import SearchBar from "@/components/search-bar";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

const Home = () => {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string | undefined>();

  // Parse URL for category or search query
  useEffect(() => {
    const url = new URL(window.location.href);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    setActiveCategory(category || undefined);
    setSearchQuery(search || undefined);
  }, [location]);

  // Featured post query
  const featuredPostQuery = useQuery({
    queryKey: ['/api/posts/featured'],
    enabled: !activeCategory && !searchQuery,
  });

  // Posts query
  const getQueryEndpoint = () => {
    if (searchQuery) {
      return `/api/search?q=${encodeURIComponent(searchQuery)}`;
    }
    if (activeCategory) {
      return `/api/category/${encodeURIComponent(activeCategory)}`;
    }
    return '/api/posts';
  };

  const postsQuery = useQuery({
    queryKey: [getQueryEndpoint()],
  });

  // Handle load more
  const [visiblePosts, setVisiblePosts] = useState(6);
  
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 6);
  };

  // Filter out featured post from regular posts
  const posts = postsQuery.data || [];
  const featuredPost = featuredPostQuery.data;
  
  const regularPosts = activeCategory || searchQuery 
    ? posts 
    : posts.filter(post => !featuredPost || post.id !== featuredPost.id);

  const displayedPosts = regularPosts.slice(0, visiblePosts);

  return (
    <>
      {/* Hero Section */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mt-1 font-serif text-4xl font-medium text-gray-900 sm:text-5xl sm:tracking-tight animate-fade-in">
              Welcome to <span className="text-primary">The Quiet Seed</span>
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 animate-slide-up">
              A space for thoughtful reflections on mindful living, gentle how-to guides, and philosophical musings.
            </p>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <CategoryFilter activeCategory={activeCategory} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Loading state */}
        {postsQuery.isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-primary text-lg">Loading posts...</div>
          </div>
        )}

        {/* Error state */}
        {postsQuery.isError && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load posts</p>
            <Button 
              variant="outline" 
              onClick={() => postsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Search results heading */}
        {searchQuery && posts.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold mb-4 text-gray-900">
              Search results for "{searchQuery}"
            </h2>
            <p className="text-gray-500">Found {posts.length} posts matching your search.</p>
          </div>
        )}

        {/* No results state */}
        {!postsQuery.isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <p className="text-lg mb-4">No posts found matching "{searchQuery}"</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Clear Search
                </Button>
              </>
            ) : activeCategory ? (
              <>
                <p className="text-lg mb-4">No posts found in the {activeCategory} category</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  View All Posts
                </Button>
              </>
            ) : (
              <p className="text-lg">No posts available yet. Check back soon!</p>
            )}
          </div>
        )}

        {/* Featured Post */}
        {!activeCategory && !searchQuery && featuredPost && (
          <FeaturedPost post={featuredPost} />
        )}

        {/* Recent Posts */}
        {displayedPosts.length > 0 && (
          <>
            <h2 className="font-serif text-2xl font-semibold mb-6 text-gray-900">
              {activeCategory ? `${activeCategory} Articles` : searchQuery ? 'Search Results' : 'Recent Articles'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {displayedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {regularPosts.length > visiblePosts && (
              <div className="flex justify-center py-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  className="border border-primary/30 text-primary hover:bg-secondary hover:text-primary"
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Search Section */}
      <section id="search" className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SearchBar />
        </div>
      </section>
    </>
  );
};

export default Home;
