import Newsletter from "@/components/home/Newsletter";
import fruitArtwork from "@/assets/fruit-art.svg";

export default function About() {
  return (
    <div className="animate-fade-in">
      <section className="max-w-4xl mx-auto prose prose-headings:font-serif prose-headings:text-primary-foreground prose-p:text-foreground">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">About The Quiet Seed</h1>
        
        <div className="h-60 w-full rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-[#F9F6FF]">
          <img 
            src={fruitArtwork}
            alt="Fruit artwork illustration" 
            className="w-auto h-full object-contain"
          />
        </div>
        
        <div className="p-8 border border-dashed border-primary/30 rounded-lg bg-slate-50">
          <p className="text-lg text-center">
            This page is ready for your personal content.
          </p>
          
          <p className="text-center text-muted-foreground">
            Log in to the admin area to create and publish your own about page content.
          </p>
        </div>
        
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
        
        <div className="p-8 border border-dashed border-primary/30 rounded-lg bg-slate-50">
          <p className="text-center text-muted-foreground">
            Add your bio here by editing this page.
          </p>
        </div>
        
        <h2>Connect</h2>
        
        <div className="flex justify-center space-x-6 my-8">
          <a href="#" className="text-primary hover:text-primary-foreground transition-colors" aria-label="Twitter">
            <i className="ri-twitter-x-line text-2xl"></i>
          </a>
        </div>
        
      </section>
      
      <Newsletter />
    </div>
  );
}
