import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaLaptopCode, FaPeace } from 'react-icons/fa';

// A different background image suitable for an "About" page
const aboutHeroUrl = 'https://images.unsplash.com/photo-1583595630311-822b64a7536f?q=80&w=1974&auto=format&fit=crop';

const About = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative flex items-center justify-center h-[50vh] bg-cover bg-center text-white" 
        style={{ backgroundImage: `url(${aboutHeroUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-4xl md:text-5xl font-bold text-center drop-shadow-lg p-4"
        >
          About Adarsh Dham
        </motion.h1>
      </div>

      {/* Content Section */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          {/* Our Mission Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-pink-500 flex flex-col items-center text-center"
          >
            <div className="bg-pink-100 p-4 rounded-full mb-4">
                <FaHeart className="text-4xl text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To promote peace, harmony, and well-being by providing a serene environment for spiritual seekers and hosting events that foster personal growth and communal harmony.
            </p>
          </motion.div>

          {/* Technology Vision Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-pink-500 flex flex-col items-center text-center"
          >
            <div className="bg-pink-100 p-4 rounded-full mb-4">
                <FaLaptopCode className="text-4xl text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">A Digital Sanctuary</h2>
            <p className="text-gray-600">
              This web application streamlines event and accommodation management, allowing devotees to seamlessly request lodging and stay updated on their booking status.
            </p>
          </motion.div>
        </div>

        {/* Closing Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-xl text-center"
        >
            <div className="flex justify-center mb-4">
                <FaPeace className="text-4xl text-pink-500"/>
            </div>
            <p className="text-lg text-gray-700 italic">
                We believe in using technology to serve our community more effectively, ensuring every visitor has a comfortable and welcoming experience.
            </p>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default About;