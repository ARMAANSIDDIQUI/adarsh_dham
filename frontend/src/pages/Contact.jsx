import React, { useRef, useState } from 'react';
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
import { motion } from 'framer-motion';

// --- SVG Icons ---
// Replaced react-icons with inline SVGs to remove dependency issues.

const FaMapMarkerAlt = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" {...props}><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
);

const FaEnvelope = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
);

const FaPhone = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path></svg>
);

const FaSpinner = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>
);

const FaCheckCircle = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>
);

const FaExclamationCircle = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M504 256c0 136.997-111.003 248-248 248S8 392.997 8 256C8 119.083 119.083 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.982 12.654z"></path></svg>
);


const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending');
    setStatusMessage('Sending your message...');

    const serviceID = 'service_9s61191';
    const templateID = 'template_ave6g79';
    const publicKey = 'dVjQ8g-uLP6BiH_zF'; // Your Public Key is now included.

    emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then(
        (result) => {
          console.log('SUCCESS!', result.text);
          setStatus('success');
          setStatusMessage('Your message has been sent successfully!');
          setTimeout(() => {
            setStatus('idle');
            form.current.reset();
          }, 3000);
        },
        (error) => {
          console.log('FAILED...', error.text);
          setStatus('error');
          setStatusMessage('Failed to send message. Please try again later.');
           setTimeout(() => {
            setStatus('idle');
          }, 3000);
        }
      );
  };
  
  const StatusIcon = ({ className }) => {
    switch (status) {
      case 'sending':
        return <FaSpinner className={`animate-spin mr-2 ${className}`} />;
      case 'success':
        return <FaCheckCircle className={`mr-2 ${className}`} />;
      case 'error':
        return <FaExclamationCircle className={`mr-2 ${className}`} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-pink-500 hover:bg-pink-600';
    }
  };

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
            <FaMapMarkerAlt className="text-pink-500 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-800">Address</h3>
            <p className="text-sm text-gray-600 text-center">Adarsh Dham, [Full Address Line]</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-pink-50 rounded-lg">
            <FaEnvelope className="text-pink-500 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-800">Email</h3>
            <a href="mailto:ssdn.kashipur@gmail.com" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">ssdn.kashipur@gmail.com</a>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-pink-50 rounded-lg">
            <FaPhone className="text-pink-500 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-800">Phone</h3>
            <a href="tel:+911234567890" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">+91 12345 67890</a>
          </div>
        </div>



        {/* Contact Form */}
        <form ref={form} onSubmit={sendEmail} className="mt-8 space-y-4 pt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Send Us a Message</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" name="name" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="Your Full Name" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="your.email@example.com" required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" name="message" rows="4" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="How can we help you?" required></textarea>
          </div>
          
          {status !== 'idle' && (
             <div className={`text-center p-3 rounded-lg text-white flex items-center justify-center ${getStatusColor()}`}>
                <StatusIcon className="w-5 h-5" />
                <span>{statusMessage}</span>
            </div>
          )}
          
          <button type="submit" disabled={status === 'sending'} className={`w-full px-4 py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor()}`}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
                {/* Find Us Map */}
        <div className="border-b pb-8 border-pink-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Find Us</h3>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3478.498421943835!2d78.96919807552839!3d29.238963875294336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390a5d557a6225ff%3A0x8f7f2b41293a5270!2sAdarsh%20Dham!5e0!3m2!1sen!2sin!4v1727983416041!5m2!1sen!2sin" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }}
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;

