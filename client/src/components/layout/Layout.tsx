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
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-4 z-50 shadow-lg animate-bounce-attention">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold">NOTIFICATION:</span>
            <span className="text-lg">Use the GREEN BLOG button and RED SEARCH button in the header!</span>
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
