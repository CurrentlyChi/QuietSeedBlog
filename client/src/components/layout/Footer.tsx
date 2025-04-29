import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-muted py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="ri-seedling-line text-xl text-primary"></i>
              <h3 className="text-lg font-serif font-medium text-primary-foreground">The Quiet Seed</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              A space for mindful reflections, gentle guides, and thoughtful stories about slow living in a fast-paced world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-primary-foreground transition-colors" aria-label="Twitter">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif text-primary-foreground font-medium mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-primary-foreground font-medium mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground mb-2">
              <i className="ri-mail-line mr-2 text-primary"></i> hello@quietseed.com
            </p>
            <p className="text-sm text-muted-foreground">
              <i className="ri-map-pin-line mr-2 text-primary"></i> Japan
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} The Quiet Seed. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
