import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Menu, X } from "lucide-react";
import { useCurrentUser, useMobileMenu, useSearch } from "@/lib/hooks";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  // Added at 4:05 AM to fix visibility issues
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { data: userData, refetch } = useCurrentUser();
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useMobileMenu();
  const { isSearchOpen, openSearch, closeSearch, searchQuery, setSearchQuery } = useSearch();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeSearch();
    closeMobileMenu();
  };
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      refetch();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to home if on admin page
      if (location.startsWith("/admin")) {
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location]);
  
  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };
  
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-purple-700 shadow-md fixed top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 animate-fade-in">
          <i className="ri-seedling-line text-2xl text-white"></i>
          <h1 className="text-3xl font-handwritten text-white font-bold">The Quiet Seed</h1>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
          className="lg:hidden text-white bg-blue-800 p-2 rounded-md focus:outline-none"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 animate-fade-in">
          <Link 
            href="/" 
            className="nav-link text-white hover:text-yellow-200 transition-colors font-medium"
          >
            Home
          </Link>
          <Link 
            href="/" 
            className="nav-link bg-yellow-400 text-blue-800 font-bold px-4 py-2 rounded-md shadow-sm hover:bg-yellow-300 transition-colors"
          >
            BLOG
          </Link>
          <Link 
            href="/about" 
            className="nav-link text-white hover:text-yellow-200 transition-colors font-medium"
          >
            About
          </Link>
          
          <button 
            onClick={openSearch} 
            className="bg-white text-blue-800 hover:bg-yellow-100 transition-colors flex items-center p-2 rounded-lg shadow-md"
            aria-label="Search"
          >
            <SearchIcon className="h-6 w-6" />
            <span className="ml-2 font-medium">Search</span>
          </button>
          
          {isSearchOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Search</h2>
                  <button onClick={closeSearch} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-10 pr-4 py-3 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <SearchIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </form>
              </div>
            </div>
          )}
          
          {userData?.isAuthenticated ? (
            <>
              {userData.user.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/admin">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} bg-gradient-to-r from-blue-700 to-purple-800 py-4 shadow-md animate-slide-up lg:hidden`}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link 
            href="/" 
            className="text-white hover:text-yellow-200 pb-2 border-b border-blue-500 font-medium"
          >
            Home
          </Link>
          <Link 
            href="/" 
            className="bg-yellow-400 text-blue-800 font-bold py-3 px-4 rounded-md w-full flex justify-center shadow-md"
          >
            BLOG
          </Link>
          <Link 
            href="/about" 
            className="text-white hover:text-yellow-200 pb-2 border-b border-blue-500 font-medium"
          >
            About
          </Link>
          
          <button 
            onClick={openSearch} 
            className="flex items-center justify-center space-x-2 bg-white text-blue-800 p-3 rounded-md w-full transition-colors shadow-md font-medium"
          >
            <SearchIcon className="h-6 w-6" />
            <span>SEARCH</span>
          </button>
          
          {userData?.isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              {userData.user.isAdmin && (
                <Link href="/admin">
                  <Button className="w-full" variant="outline">Admin Dashboard</Button>
                </Link>
              )}
              <Button 
                className="w-full"
                variant="ghost"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/admin">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
