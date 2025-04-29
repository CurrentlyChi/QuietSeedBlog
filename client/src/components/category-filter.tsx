import { categories } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface CategoryFilterProps {
  activeCategory?: string;
}

const CategoryFilter = ({ activeCategory }: CategoryFilterProps) => {
  const [location] = useLocation();
  const isSearch = location.includes('search=');

  return (
    <div className="bg-white pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link href="/">
            <a className={`category-pill ${(!activeCategory && !isSearch) ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
              All
            </a>
          </Link>
          {categories.map((category) => (
            <Link key={category} href={`/?category=${category}`}>
              <a className={`category-pill ${activeCategory === category ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                {category}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
