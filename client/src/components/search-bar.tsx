import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className = "" }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [_, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={`${className}`}>
      <h2 className="font-serif text-3xl font-semibold text-gray-900 mb-6">Find What You're Looking For</h2>
      <p className="text-gray-600 mb-8 max-w-xl mx-auto">Search our collection of articles on mindfulness, slow living, and intentional practices.</p>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row justify-center">
        <div className="relative flex-grow max-w-xl">
          <input 
            type="text" 
            className="block w-full rounded-l-md border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" 
            placeholder="Search by keyword or topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button 
          type="submit" 
          className="mt-3 sm:mt-0 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-r-md px-4 py-3 text-sm font-medium transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
