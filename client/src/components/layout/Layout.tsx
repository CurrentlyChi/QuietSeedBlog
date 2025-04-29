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
      {/* Emergency Notification Banner */}
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-4 z-50 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold">INSTRUCTIONS:</span>
            <span className="text-xl">Click the buttons below!</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="bg-green-500 text-white font-bold px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition-colors border-2 border-yellow-400 flex items-center">
              <span className="text-xl">BLOG</span>
            </a>
            <button
              onClick={() => document.querySelector('button[aria-label="Search"]')?.click()}
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition-colors border-2 border-yellow-400 flex items-center animate-pulse-scale"
            >
              <span className="text-xl mr-2">SEARCH</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Header />
      
      <main className="container mx-auto px-4 pt-36 pb-12 flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
