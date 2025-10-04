import React from 'react';
import { FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaAddressCard } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Assuming you have react-router-dom setup for internal links

const Footer = () => {
    // Contact and Navigation data provided by the user
    const contactInfo = [
        { icon: FaPhone, text: '+91 98370 50318', href: 'tel:+919837050318' },
        { icon: FaEnvelope, text: 'ssdn.kashipur@gmail.com', href: 'mailto:ssdn.kashipur@gmail.com' },
        { icon: FaMapMarkerAlt, text: 'View Location on Map', href: 'https://maps.app.goo.gl/EecnPGYRw3JgQThV6', target: '_blank' },
    ];

    const socialLinks = [
        { icon: FaYoutube, text: 'YouTube', href: 'https://youtube.com/@kashipuradarshdham1181?si=lpXByVnZyHzhI2tN', target: '_blank' },
    ];

    const mainNavLinks = [
        { text: 'Home', to: '/' },
        { text: 'Calendar', to: '/calendar' },
        { text: 'Events List', to: '/events' },
        { text: 'Contact Us', to: '/contact' },
    ];

    return (
        <footer className="bg-primaryDarkFooter text-neutral py-10 px-4 md:px-6 font-body">
            <div className="max-w-7xl mx-auto">
                
                {/* Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/20 pb-8 mb-8 text-left">
                    
                    {/* Column 1: Logo/Title */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-2xl font-bold font-heading text-white mb-4">Adarsh Dham</h3>
                        <p className="text-sm text-neutral/80">
                            Dedicated to spiritual guidance and community welfare in Uttarakhand.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2">
                            {mainNavLinks.map((link, index) => (
                                <li key={index}>
                                    <Link 
                                        to={link.to}
                                        className="text-sm text-neutral/80 hover:text-accent transition-colors duration-200"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Information */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">Get in Touch</h4>
                        <ul className="space-y-3">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex items-start text-sm">
                                    <item.icon className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-accent" />
                                    <a 
                                        href={item.href} 
                                        target={item.target || '_self'}
                                        rel={item.target === '_blank' ? 'noopener noreferrer' : ''}
                                        className="text-neutral/80 hover:text-accent transition-colors duration-200 break-all"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Column 4: Social Media & Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">Connect {/* & Legal */} </h4>
                        
                        <div className="flex space-x-4 mb-6">
                            {socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Link to Adarsh Dham ${link.text}`}
                                    className="text-white hover:text-accent transition-colors duration-200 p-2 rounded-full border border-white/50 hover:border-accent"
                                >
                                    <link.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                        
                        <div className="flex flex-col space-y-2 text-sm font-medium">
                            {/* <a 
                                href="/privacy-policy" 
                                className="text-neutral/80 hover:text-accent transition-colors duration-200"
                            >
                                Privacy Policy
                            </a>
                            <a 
                                href="/terms" 
                                className="text-neutral/80 hover:text-accent transition-colors duration-200"
                            >
                                Terms of Service
                            </a> */}
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm font-light text-neutral/60">
                        &copy; {new Date().getFullYear()} Adarsh Dham. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
