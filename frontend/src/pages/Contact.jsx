import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// --- SVG Icons ---
const FaMapMarkerAlt = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" {...props}><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
);
const FaEnvelope = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
);
// FIX: Added inline style to rotate the icon 90 degrees clockwise.
const FaPhone = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" style={{ transform: 'rotate(90deg)' }} {...props}><path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path></svg>
);

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceID = 'service_9s61191';
    const templateID = 'template_ave6g79';
    const publicKey = 'dVjQ8g-uLP6BiH_zF';

    emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then(
        (result) => {
          console.log('SUCCESS!', result.text);
          toast.success('Your message has been sent successfully!');
          form.current.reset();
        },
        (error) => {
          console.log('FAILED...', error.text);
          toast.error('Failed to send message. Please try again later.');
        }
      ).finally(() => {
        setLoading(false);
      });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body">
      <h1 className="text-3xl md:text-4xl font-bold font-heading text-primaryDark text-center mb-8 border-b-2 border-primary pb-3">
        Contact Us
      </h1>
      <div className="max-w-3xl mx-auto bg-card p-6 md:p-10 rounded-2xl shadow-soft text-gray-700 space-y-8">
        <p className="text-center text-lg text-gray-700">
          For any inquiries regarding accommodations, events, or general information, please feel free to reach out to us. We are here to help.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b pb-6 border-background">
          <div className="flex flex-col items-center space-y-3 p-4 bg-background rounded-xl">
            <FaMapMarkerAlt className="text-primaryDark w-6 h-6" />
            <h3 className="text-xl font-semibold font-heading text-gray-800">Address</h3>
            <p className="text-sm text-gray-700 text-center">Shri Adarsh Dham ,9th KM Stone, Kashipur-Ramnagar Road ,Village Bhogpur Kashipur ( Uttarakhand) Pin-244713</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-background rounded-xl">
            <FaEnvelope className="text-primaryDark w-6 h-6" />
            <h3 className="text-xl font-semibold font-heading text-gray-800">Email</h3>
            <a href="mailto:ssdn.kashipur@gmail.com" className="text-sm text-gray-700 hover:text-highlight transition-colors">ssdn.kashipur@gmail.com</a>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-background rounded-xl">
            <FaPhone className="text-primaryDark w-6 h-6" />
            <h3 className="text-xl font-semibold font-heading text-gray-800">Phone</h3>
            <a href="tel:+919837050318" className="text-sm text-gray-700 hover:text-highlight transition-colors">+91 98370 50318</a>
            <p>9:00 A.M - 1:00 P.M </p> & <p>4:00 P.M - 6:00 P.M</p>
          </div>
        </div>

        <form ref={form} onSubmit={sendEmail} className="mt-8 space-y-4 pt-4">
          <h3 className="text-2xl font-bold font-heading text-primaryDark mb-4 text-center">Send Us a Message</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" name="name" className="mt-1 block w-full px-4 py-2 border border-background rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-colors" placeholder="Your Full Name" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" className="mt-1 block w-full px-4 py-2 border border-background rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-colors" placeholder="your.email@example.com" required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" name="message" rows="4" className="mt-1 block w-full px-4 py-2 border border-background rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-colors" placeholder="How can we help you?" required></textarea>
          </div>
          <button type="submit" disabled={loading} className={`w-full px-4 py-3 text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed bg-highlight hover:bg-primaryDark`}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="border-b pb-8 border-background">
          <h3 className="text-2xl font-bold font-heading text-primaryDark mb-4 text-center">Find Us</h3>
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-soft border border-background">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3480.356567685083!2d78.99835587552448!3d29.2718581753217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjnCsDE2JzE4LjciTiA3OcKwMDAnMDMuNCJF!5e0!3m2!1sen!2sin!4v1759582987964!5m2!1sen!2sin" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Adarsh Dham Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;