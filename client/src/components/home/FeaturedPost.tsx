import { Link } from "wouter";
import { useFeaturedPost, useSiteSettings, useCurrentUser } from "@/lib/hooks";
import { formatDate, getReadingTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fruitArtwork from "@/assets/fruit-art.svg";

export default function FeaturedPost() {
  const { data: featuredPost, isLoading: loadingPost, error: postError } = useFeaturedPost();
  const { data: settings, isLoading: loadingSettings } = useSiteSettings();
  const { data: userData } = useCurrentUser();
  
  // Determine where the "Write a Post" button should link to based on authentication
  const writePostLink = userData?.isAuthenticated ? "/admin" : "/auth"; // Send to auth page if not logged in
  
  // Always render the hero welcome section
  const heroSection = (
    <section className="mb-16 py-20 bg-[#E6D7FF]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Welcome to<br />
              <span className="text-primary font-handwritten">The Quiet Seed</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-lg">
              {settings && settings.tagline ? settings.tagline : "A personal space for mindful reflections and thoughtful stories about slow living in a fast-paced world."}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="outline" asChild size="lg" className="border-purple-700 text-purple-800 hover:bg-purple-100">
                <Link href="/about">
                  About This Blog
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <img 
              src={fruitArtwork} 
              alt="Artistic fruit illustration" 
              className="max-w-full h-auto rounded-3xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
  
  // Handle different states of featured post
  let featuredPostSection = null;
  
  if (loadingPost) {
    featuredPostSection = (
      <section className="mb-16">
        <div className="w-full lg:w-10/12 mx-auto overflow-hidden rounded-2xl shadow-md bg-card relative">
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    );
  } else if (featuredPost && !postError) {
    // If we have a featured post, prepare it
    const post = featuredPost;
    const authorInitial = post?.authorName ? post.authorName.charAt(0) : "A";
    const authorName = post?.authorName || "Anonymous";
    
    featuredPostSection = (
      <section className="mb-16">
        <h2 className="text-2xl font-serif font-semibold text-primary-foreground mb-6">Featured Post</h2>
        <div className="w-full lg:w-10/12 mx-auto overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-card relative">
          <div className="h-80 w-full bg-muted relative overflow-hidden">
            <img 
              src={post?.imageUrl || "https://images.unsplash.com/photo-1508214854206-19cbf82a85c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} 
              alt={post?.title || "Blog post"} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <Link href={`/post/${post?.slug || ''}` }>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">{post?.title || "Untitled Post"}</h2>
              </Link>
              <p className="text-white/90 mb-4 max-w-2xl">
                {post?.excerpt || ""}
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/30 overflow-hidden flex items-center justify-center">
                  <span className="text-white font-medium">{authorInitial}</span>
                </div>
                <div>
                  <p className="font-medium">{authorName}</p>
                  <p className="text-sm text-white/80">
                    {post?.publishedAt ? formatDate(post.publishedAt) : ""} {post?.content ? `· ${getReadingTime(post.content)}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Return both sections (hero and featured post if available)
  return (
    <>
      {heroSection}
      {featuredPostSection}
    </>
  );
}