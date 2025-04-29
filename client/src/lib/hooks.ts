import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { type User, type Category, type Post, type PostWithDetails, type SiteSettings } from "@shared/schema";

// Define return types for our query hooks
type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
};

// Custom hook for getting logged-in user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["/api/me"],
    retry: false,
    refetchOnWindowFocus: false
  });
}

// Custom hook for loggin in
export function useLogin() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  
  return { isLoginOpen, openLogin, closeLogin };
}

// Custom hook for responsive design
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Custom hook for search functionality
export function useSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  
  return { 
    isSearchOpen, 
    openSearch, 
    closeSearch, 
    searchQuery, 
    setSearchQuery 
  };
}

// Custom hook for fetching posts
export function usePosts() {
  return useQuery({
    queryKey: ["/api/posts"]
  });
}

// Custom hook for fetching categories
export function useCategories() {
  return useQuery({
    queryKey: ["/api/categories"]
  });
}

// Custom hook for fetching a single post by slug
export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: [`/api/posts/${slug}`],
    enabled: !!slug
  });
}

// Custom hook for fetching posts by category
export function usePostsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: [`/api/category/${categorySlug}`],
    enabled: !!categorySlug
  });
}

// Custom hook for fetching the featured post
export function useFeaturedPost(): QueryResult<PostWithDetails> {
  const { data, isLoading, error } = useQuery<PostWithDetails>({
    queryKey: ["/api/posts/featured"]
  });
  
  return { data, isLoading, error: error as Error | null };
}

// Custom hook for searching posts
export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: [`/api/search?q=${encodeURIComponent(query)}`],
    enabled: query.length > 0
  });
}

// Custom hook for mobile menu
export function useMobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  return { isMobileMenuOpen, openMobileMenu, closeMobileMenu };
}

// Custom hook for getting site settings
export function useSiteSettings(): QueryResult<SiteSettings> {
  const { data, isLoading, error } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"]
  });
  
  return { data, isLoading, error: error as Error | null };
}

// Custom hook for updating site settings
export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      const response = await apiRequest("PUT", "/api/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both settings and any component that might use settings
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    }
  });
}
