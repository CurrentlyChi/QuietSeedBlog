import { Link, useLocation } from "wouter";
import { useCategories } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryFilter() {
  const [location] = useLocation();
  const { data: categories, isLoading } = useCategories();
  
  // Extract the current category from URL if we're on a category page
  const currentCategory = location.startsWith("/category/") 
    ? location.split("/category/")[1] 
    : null;
  
  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-24 h-10 rounded-full" />
          ))}
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-12">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <Link href="/" className={`category-pill px-5 py-2 ${!currentCategory ? 'bg-primary text-white' : 'bg-white border border-muted text-primary-foreground'} shadow-sm hover:shadow rounded-full text-sm font-medium`}>
          All Posts
        </Link>
        
        {categories?.map((category) => (
          <Link 
            key={category.id}
            href={`/category/${category.slug}`}
            className={`category-pill px-5 py-2 ${currentCategory === category.slug ? 'bg-primary text-white' : 'bg-white border border-muted text-primary-foreground'} shadow-sm hover:shadow rounded-full text-sm font-medium`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
