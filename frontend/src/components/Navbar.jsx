import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../auth/firebase';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
      scrolled 
        ? 'bg-gradient-to-br from-gray-50/95 via-white/95 to-gray-100/95 shadow-2xl border-b border-gray-200/50' 
        : 'bg-gradient-to-br from-gray-50/90 via-white/90 to-gray-100/90'
    }`}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black text-gray-900">
            ⏰ CloudTask
          </Link>

          {/* Auth Buttons (Conditional) */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
