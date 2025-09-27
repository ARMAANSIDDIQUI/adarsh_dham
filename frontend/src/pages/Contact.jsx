import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Contact = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen ">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 border-b-2 border-pink-500 pb-3">
        Contact Us
      </h1>
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg text-gray-700 space-y-8">
        <p className="text-center text-lg text-gray-600">
          For any inquiries regarding accommodations, events, or general information, please feel free to reach out to us. We are here to help.
        </p>

        {/* Contact Details Grid (Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b pb-6 border-pink-100">
          <div className="flex flex-col items-center space-y-3 p-4 bg-pink-50 rounded-lg">
            <FaMapMarkerAlt className="text-pink-500 text-3xl" />
            <h3 className="text-xl font-semibold text-gray-800">Address</h3>
            <p className="text-sm text-gray-600 text-center">Adarsh Dham, [Full Address Line]</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-pink-50 rounded-lg">
            <FaEnvelope className="text-pink-500 text-3xl" />
            <h3 className="text-xl font-semibold text-gray-800">Email</h3>
            <a href="mailto:@adarshdham" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">info@adarshdham.org</a>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-pink-50 rounded-lg">
            <FaPhone className="text-pink-500 text-3xl" />
            <h3 className="text-xl font-semibold text-gray-800">Phone</h3>
            <a href="tel:+911234567890" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">+91 12345 67890</a>
          </div>
        </div>

        {/* Contact Form */}
        <form className="mt-8 space-y-4 pt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Send Us a Message</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="Your Full Name" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="your.email@example.com" required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" rows="4" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="How can we help you?" required></textarea>
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300">
            Send Message
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Contact;
