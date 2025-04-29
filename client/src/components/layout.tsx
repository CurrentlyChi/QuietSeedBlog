import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Instagram, 
  Twitter, 
  PenTool, 
  Menu, 
  X,
  Search,
  LogIn
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="bg-gray-50 font-sans text-gray-800 leading-relaxed">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="font-serif text-2xl font-medium text-primary cursor-pointer">The Quiet Seed</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/">
                  <a className={`nav-link border-b-2 ${location === '/' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Home</a>
                </Link>
                <Link href="/about">
                  <a className={`nav-link border-b-2 ${location === '/about' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>About</a>
                </Link>
                <Link href="/admin">
                  <a className={`nav-link border-b-2 ${location.startsWith('/admin') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Admin</a>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link href="/admin">
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Area
                </button>
              </Link>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`block pl-3 pr-4 py-2 border-l-4 ${location === '/' ? 'border-primary text-gray-900 bg-secondary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                Home
              </a>
            </Link>
            <Link href="/about">
              <a className={`block pl-3 pr-4 py-2 border-l-4 ${location === '/about' ? 'border-primary text-gray-900 bg-secondary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                About
              </a>
            </Link>
            <Link href="/admin">
              <a className={`block pl-3 pr-4 py-2 border-l-4 ${location.startsWith('/admin') ? 'border-primary text-gray-900 bg-secondary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                Admin
              </a>
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link href="/admin">
                <a className="block text-center rounded-md bg-primary text-white px-4 py-2 mx-3 font-medium">
                  Admin Area
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <h2 className="font-serif text-2xl font-medium">The Quiet Seed</h2>
              <p className="text-gray-300 text-sm">
                A mindful living blog dedicated to helping you find stillness, purpose, and joy in everyday moments.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Pinterest</span>
                  <PenTool className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Explore</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/">
                      <a className="text-base text-gray-400 hover:text-white">Home</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/about">
                      <a className="text-base text-gray-400 hover:text-white">About</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Reflection">
                      <a className="text-base text-gray-400 hover:text-white">Reflection</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=How-To">
                      <a className="text-base text-gray-400 hover:text-white">How-To</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/?category=Philosophy">
                      <a className="text-base text-gray-400 hover:text-white">Philosophy</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Connect</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Newsletter</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Contact</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-400 hover:text-white">Terms of Service</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {new Date().getFullYear()} The Quiet Seed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
