import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Create a range of page numbers to display
  const getPageRange = () => {
    const range = [];
    const maxDisplay = 3; // Max number of page links to show
    
    // Always show page 1
    range.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range to show maxDisplay pages
    if (end - start + 1 < maxDisplay) {
      if (start === 2) {
        end = Math.min(totalPages - 1, start + maxDisplay - 1);
      } else if (end === totalPages - 1) {
        start = Math.max(2, end - maxDisplay + 1);
      }
    }
    
    // Add ellipsis if needed before start
    if (start > 2) {
      range.push("...");
    }
    
    // Add the range of pages
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis if needed after end
    if (end < totalPages - 1) {
      range.push("...");
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };
  
  const pageRange = getPageRange();
  
  return (
    <div className="mt-12 flex justify-center">
      <div className="inline-flex rounded-md shadow-sm">
        <Link 
          href={currentPage > 1 ? `${basePath}/page/${currentPage - 1}` : basePath}
          className={cn(
            "px-4 py-2 bg-white border border-muted text-primary-foreground rounded-l-lg hover:bg-secondary",
            currentPage === 1 && "opacity-50 cursor-not-allowed hover:bg-white"
          )}
          onClick={(e) => {
            if (currentPage === 1) e.preventDefault();
          }}
        >
          Previous
        </Link>
        
        {pageRange.map((page, idx) => 
          typeof page === "number" ? (
            <Link
              key={idx}
              href={page === 1 ? basePath : `${basePath}/page/${page}`}
              className={cn(
                "px-4 py-2 border border-muted",
                page === currentPage 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-white text-primary-foreground hover:bg-secondary"
              )}
            >
              {page}
            </Link>
          ) : (
            <span key={idx} className="px-4 py-2 bg-white border border-muted text-muted-foreground">
              {page}
            </span>
          )
        )}
        
        <Link 
          href={currentPage < totalPages ? `${basePath}/page/${currentPage + 1}` : basePath}
          className={cn(
            "px-4 py-2 bg-white border border-muted text-primary-foreground rounded-r-lg hover:bg-secondary",
            currentPage === totalPages && "opacity-50 cursor-not-allowed hover:bg-white"
          )}
          onClick={(e) => {
            if (currentPage === totalPages) e.preventDefault();
          }}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
