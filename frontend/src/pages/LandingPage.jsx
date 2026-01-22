import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';

const LandingPage = () => {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      if (e.target.closest('a[href^="#"]')) {
        e.preventDefault();
        const href = e.target.closest('a').getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <Navbar />
      <Hero />
      <TechStack />
      <Footer />
    </div>
  );
};

export default LandingPage;
