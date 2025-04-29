import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Adding layout update at 4:06 AM
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [children]);
  
  return (
    <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">
      {/* Direct Action Banner */}
      <div className="w-full bg-red-600 text-white py-4 fixed top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">The Quiet Blog</h1>
          <div className="flex items-center space-x-4">
            <a href="/" className="bg-blue-800 text-white font-bold px-5 py-2 rounded-md shadow-md border-2 border-yellow-400">
              BLOG
            </a>
            <button 
              onClick={() => document.querySelector('button[aria-label="Search"]')?.click()} 
              className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-md shadow-md border-2 border-blue-800 flex items-center"
            >
              <span className="mr-2">SEARCH</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Header />
      
      <main className="container mx-auto px-4 pt-40 pb-12 flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
