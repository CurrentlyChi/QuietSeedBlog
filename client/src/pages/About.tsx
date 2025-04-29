import Newsletter from "@/components/home/Newsletter";
import fruitArtwork from "@/assets/fruit-art.svg";
import { usePageContent } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function About() {
  const { data: pageContent, isLoading, error } = usePageContent("about");

  return (
    <div className="animate-fade-in">
      <section className="max-w-4xl mx-auto prose prose-headings:font-serif prose-headings:text-primary-foreground prose-p:text-foreground">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-60 w-full rounded-2xl mb-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 text-red-500">
            <p>Error loading About page content. Please try again later.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">
              {pageContent?.title || "About The Quiet Seed"}
            </h1>
            
            <div className="h-60 w-full rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-[#E6D7FF]">
              <img 
                src={fruitArtwork}
                alt="Fruit artwork illustration" 
                className="w-auto h-full object-contain"
              />
            </div>
            
            <div 
              className="mb-8" 
              dangerouslySetInnerHTML={{ __html: pageContent?.content || ""}}
            />
          </>
        )}
        
        <h2>About the Author</h2>
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
            <span className="text-primary-foreground text-2xl">M</span>
          </div>
          <div>
            <h3 className="text-xl font-serif text-primary-foreground mt-0">Mai Chi</h3>
            <p className="text-muted-foreground mt-1">Blog Author</p>
          </div>
        </div>
        
        <div className="mb-8">
          <p>
            Hi, I'm Mai Chi. I'm the creator and writer behind The Quiet Seed. With a background in mindfulness practices and a passion for thoughtful writing, I started this blog as a way to share my journey toward a more intentional life.
          </p>
          <p>
            When I'm not writing, you can find me tending to my small garden, reading books on slow living, or enjoying a cup of tea while watching the rain. I believe in the power of slowing down and paying attention to the present moment.
          </p>
          <p>
            I'm so glad you're here, and I hope The Quiet Seed can be a small sanctuary of calm in your digital day.
          </p>
        </div>
        
        <h2>Connect</h2>
        
        <div className="flex justify-center space-x-8 my-8">
          <a href="#" className="flex flex-col items-center text-primary hover:text-primary-foreground transition-colors" aria-label="Twitter">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </div>
            <span className="text-sm">Twitter</span>
          </a>
          <a href="#" className="flex flex-col items-center text-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </div>
            <span className="text-sm">Instagram</span>
          </a>
          <a href="#" className="flex flex-col items-center text-primary hover:text-primary-foreground transition-colors" aria-label="Email">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <span className="text-sm">Email</span>
          </a>
        </div>
        
      </section>
      
      <Newsletter />
    </div>
  );
}
