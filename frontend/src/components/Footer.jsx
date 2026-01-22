const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 border-t border-gray-200 py-16 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              ⏰ CloudTask
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md">
              Cloud-native task management platform with seamless integrations and real-time collaboration.
            </p>
          </div>
          
          {/* Developer Section */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Developer</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="https://github.com/nakkshh/cloudtask" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Repository</a></li>
              <li><a href="#api" className="hover:text-gray-900 transition-colors">API</a></li>
              <li><a href="#docs" className="hover:text-gray-900 transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Full-width divider */}
      <div className="w-full border-t border-gray-200"></div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12">
        <div className="text-center text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 CloudTask. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Made with <span className="text-red-500">❤️</span> by 
            <a 
              href="https://github.com/nakkshh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              Nakkshh
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
