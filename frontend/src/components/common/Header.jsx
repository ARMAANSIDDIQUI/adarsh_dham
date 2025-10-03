import React, { useState, useEffect } from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser,
    FaSignInAlt,
    FaHome,
    FaInfoCircle,
    FaPhone,
    FaCalendarAlt,
    FaBars,
    FaTimes,
    FaClipboardList,
    FaComments,
    FaUserShield,
    FaUserCircle,
    FaBell,
    FaSignOutAlt,
    FaOm
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice.js';
import FloatingActionButtons from './FloatingActionButtons';
import EnableNotificationsButton from './EnableNotificationsButton';

const NavLink = ({ to, icon, text, onClick, end = false }) => (
    <RouterNavLink
        to={to}
        onClick={onClick}
        end={end}
        className={({ isActive }) =>
            `flex items-center whitespace-nowrap space-x-2 px-3 py-2 transition-colors duration-300 rounded-md text-base font-medium ` +
            (isActive
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
        }
    >
        {icon}
        <span>{text}</span>
    </RouterNavLink>
);

const Header = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
    const handleLogout = () => {
        dispatch(logout());
        setIsMenuOpen(false);
    };
    
    const isAdmin = user?.roles?.some((role) =>
        ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'].includes(role)
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => (document.body.style.overflow = 'unset');
    }, [isMenuOpen]);

    return (
        <>
            <header className="bg-white shadow-sm sticky top-0 z-[999]">
                <nav className="container mx-auto flex items-center justify-between px-4 py-3 max-w-7xl">
                    <Link to="/" className="text-2xl font-bold mr-5 text-gray-800 hover:text-pink-600 transition-colors duration-200 flex items-center gap-x-1">
                        <FaOm className="text-pink-500 text-3xl pr-2" />
                        <span>Adarsh Dham</span>
                    </Link>

                    {!isMobile && (
                        <div className="flex-1 flex items-center justify-center gap-x-3">
                            <NavLink to="/" icon={<FaHome />} text="Home" end />
                            <NavLink to="/about" icon={<FaInfoCircle />} text="About" />
                            <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" />
                            <NavLink to="/events" icon={<FaClipboardList />} text="Event List" />
                            <NavLink to="/comments" icon={<FaComments />} text="Comments" />
                            <NavLink to="/contact" icon={<FaPhone />} text="Contact" />
                            {isAuthenticated && (
                                <>
                                    <NavLink to="/my-bookings" icon={<FaClipboardList />} text="My Bookings" />
                                    {/* ✨ NEW NOTIFICATION BUTTON ADDED HERE */}
                                    <NavLink to="/notifications" icon={<FaBell />} text="Notifications" />
                                </>
                            )}
                        </div>
                    )}

                    {!isMobile && !isAuthenticated && (
                        <div className="flex items-center gap-x-3">
                            <NavLink to="/login" icon={<FaSignInAlt />} text="Login" />
                            <NavLink to="/register" icon={<FaUser />} text="Register" />
                        </div>
                    )}
                    
                    {isMobile && (
                        <button
                            onClick={handleMenuToggle}
                            className="text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-[1000]"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isMenuOpen ? 'times' : 'bars'}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    )}
                </nav>

                <AnimatePresence>
                    {isMobile && isMenuOpen && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
                            className="fixed inset-0 z-[998] bg-white"
                        >
                            <div className="flex flex-col h-full justify-center p-6">
                                <div className="flex flex-col items-center gap-y-6 text-2xl">
                                    <NavLink to="/" icon={<FaHome />} text="Home" onClick={handleMenuToggle} end />
                                    <NavLink to="/about" icon={<FaInfoCircle />} text="About" onClick={handleMenuToggle} />
                                    <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" onClick={handleMenuToggle} />
                                    <NavLink to="/events" icon={<FaClipboardList />} text="Event List" onClick={handleMenuToggle} />
                                    <NavLink to="/comments" icon={<FaComments />} text="Comments" onClick={handleMenuToggle} />
                                    <NavLink to="/contact" icon={<FaPhone />} text="Contact" onClick={handleMenuToggle} />
                                    
                                    <div className="w-1/2 border-t my-4"></div>
                                    
                                    {isAuthenticated ? (
                                        <>
                                            <NavLink to="/profile" icon={<FaUserCircle />} text="My Profile" onClick={handleMenuToggle} />
                                            <NavLink to="/my-bookings" icon={<FaClipboardList />} text="My Bookings" onClick={handleMenuToggle} />
                                            <div className="my-2"><EnableNotificationsButton /></div>
                                            <NavLink to="/notifications" icon={<FaBell />} text="Notifications History" onClick={handleMenuToggle} />
                                            {isAdmin && <NavLink to="/admin" icon={<FaUserShield/>} text="Admin Panel" onClick={handleMenuToggle} />}
                                            <div className="mt-4">
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-lg text-red-600 bg-red-50 rounded-lg">
                                                    <FaSignOutAlt /> Logout
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/login" icon={<FaSignInAlt />} text="Login" onClick={handleMenuToggle} />
                                            <NavLink to="/register" icon={<FaUser />} text="Register" onClick={handleMenuToggle} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
            
            {!isMobile && <FloatingActionButtons />}
        </>
    );
};

export default Header;