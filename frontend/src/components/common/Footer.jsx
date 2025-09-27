import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm md:text-base font-light mb-3">
          &copy; {new Date().getFullYear()} Adarsh Dham.
        </p>
        <div className="flex justify-center flex-wrap space-x-4 text-sm font-medium">
          <a 
                href="#" 
                className="hover:text-pink-400 transition-colors duration-200 p-2 rounded-lg"
            >
                {/* Privacy Policy */}
            </a>
          <a 
                href="#" 
                className="hover:text-pink-400 transition-colors duration-200 p-2 rounded-lg"
            >
                {/* Terms of Service */}
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
