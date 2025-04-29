import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Menu, X } from "lucide-react";
import { useCurrentUser, useMobileMenu, useSearch } from "@/lib/hooks";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
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
    <header className="w-full bg-white shadow-sm fixed top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 animate-fade-in">
          <i className="ri-seedling-line text-2xl text-primary"></i>
          <h1 className="text-3xl font-handwritten text-primary font-bold">The Quiet Seed</h1>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
          className="lg:hidden text-primary-foreground focus:outline-none"
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
            className={`nav-link ${isActive("/") ? "active text-primary-foreground font-medium" : "text-primary hover:text-primary-foreground transition-colors"}`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`nav-link ${isActive("/about") ? "active text-primary-foreground font-medium" : "text-primary hover:text-primary-foreground transition-colors"}`}
          >
            About
          </Link>
          
          <div className="relative">
            <form onSubmit={handleSearch}>
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm w-40 transition-all focus:w-56"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
          </div>
          
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
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} bg-white py-4 shadow-md animate-slide-up lg:hidden`}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link 
            href="/" 
            className={`${isActive("/") ? "text-primary-foreground font-medium" : "text-primary"} pb-2 border-b border-muted`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`${isActive("/about") ? "text-primary-foreground font-medium" : "text-primary"} pb-2 border-b border-muted`}
          >
            About
          </Link>
          
          <form onSubmit={handleSearch} className="relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
          
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
