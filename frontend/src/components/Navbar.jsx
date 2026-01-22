import { useEffect, useState } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
      scrolled 
        ? 'bg-gradient-to-br from-gray-50/95 via-white/95 to-gray-100/95 shadow-2xl border-b border-gray-200/50' 
        : 'bg-gradient-to-br from-gray-50/90 via-white/90 to-gray-100/90'
    }`}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Far Left */}
          <div className="text-2xl font-black text-gray-900">
            ⏰ CloudTask
          </div>

          {/* Auth Buttons - Far Right */}
          <div className="flex items-center space-x-3">
            <a 
              href="#login"
              className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Login
            </a>
            <a 
              href="#signup"
              className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
