import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [children]);
  
  return (
    <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
