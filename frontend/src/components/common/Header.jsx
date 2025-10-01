import React, { useState, useEffect } from 'react';
import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../redux/slices/authSlice.js';
import { 
    FaUser, FaSignInAlt, FaSignOutAlt, FaHome, FaInfoCircle, FaPhone, FaCalendarAlt, 
    FaUserShield, FaListAlt, FaBell, FaBars, FaTimes 
} from 'react-icons/fa';
import EnableNotificationsButton from '../common/EnableNotificationsButton.jsx';

// Custom NavLink for cleaner code and active link styling
const NavLink = ({ to, icon, text, onClick, end = false }) => (
    <RouterNavLink
        to={to}
        onClick={onClick}
        end={end} 
        className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 transition-colors duration-300 rounded-md text-base font-medium ` +
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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setIsMenuOpen(false);
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const hasAdminRole = user?.roles?.some(role =>
        ['admin', 'super-admin', 'super-operator', 'operator'].includes(role)
    );

    return (
        // ✨ FIX: Changed from 'bg-white/95 backdrop-blur-sm' to a solid 'bg-white'
        <header className="bg-white shadow-sm sticky top-0 z-[9999]">
            <nav className="container mx-auto flex items-center justify-between p-4 max-w-7xl">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-pink-600 transition-colors duration-200 z-[9999]">
                    Adarsh Dham
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-x-2">
                    <NavLink to="/" icon={<FaHome />} text="Home" end={true} />
                    <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" />
                    <NavLink to="/about" icon={<FaInfoCircle />} text="About" />
                    <NavLink to="/contact" icon={<FaPhone />} text="Contact" />
                    
                    {isAuthenticated && (
                        <>
                            <NavLink to="/my-bookings" icon={<FaListAlt />} text="My Bookings" />
                            <NavLink to="/notifications" icon={<FaBell />} text="Notifications" />
                        </>
                    )}
                </div>
                
                {/* Desktop Auth/User Actions */}
                <div className="hidden lg:flex items-center gap-x-4">
                    {isAuthenticated ? (
                        <>
                            <EnableNotificationsButton />
                            {hasAdminRole && <NavLink to="/admin" icon={<FaUserShield />} text="Admin" />}
                            <div className="flex items-center gap-x-2 text-gray-700">
                                <FaUser />
                                <span className="font-medium">{user?.name || 'User'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-x-1.5 text-red-600 hover:text-red-700 font-semibold transition-colors duration-200 p-2 rounded-md hover:bg-red-50"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" icon={<FaSignInAlt />} text="Login" />
                            <NavLink to="/register" icon={<FaUser />} text="Register" />
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button onClick={handleMenuToggle} className="lg:hidden text-gray-800 p-2 z-[9999]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isMenuOpen ? 'times' : 'bars'}
                            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </motion.div>
                    </AnimatePresence>
                </button>
            </nav>
        
            {/* Full-screen Mobile Menu Panel */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9998] bg-white lg:hidden"
                    >
                        <div className="container mx-auto h-full flex flex-col justify-between p-4 pt-24">
                            {/* Main mobile nav links */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }}
                                className="flex flex-col items-center gap-y-4 text-2xl"
                            >
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <NavLink to="/" icon={<FaHome />} text="Home" onClick={handleMenuToggle} end={true} />
                                </motion.div>
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" onClick={handleMenuToggle} />
                                </motion.div>
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <NavLink to="/about" icon={<FaInfoCircle />} text="About" onClick={handleMenuToggle} />
                                </motion.div>
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <NavLink to="/contact" icon={<FaPhone />} text="Contact" onClick={handleMenuToggle} />
                                </motion.div>
                            </motion.div>

                            {/* Bottom user/auth actions */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }} className="pb-8">
                                <div className="border-t mb-4"></div>
                                {isAuthenticated ? (
                                    <div className="flex flex-col items-center gap-y-4">
                                        <NavLink to="/my-bookings" icon={<FaListAlt />} text="My Bookings" onClick={handleMenuToggle} />
                                        <NavLink to="/notifications" icon={<FaBell />} text="Notifications" onClick={handleMenuToggle} />
                                        {hasAdminRole && <NavLink to="/admin" icon={<FaUserShield />} text="Admin" onClick={handleMenuToggle} />}
                                        <EnableNotificationsButton />
                                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-x-3 p-3 rounded-md bg-red-50 text-red-600 font-semibold hover:bg-red-100">
                                            <FaSignOutAlt />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-y-4">
                                        <NavLink to="/login" icon={<FaSignInAlt />} text="Login" onClick={handleMenuToggle} />
                                        <NavLink to="/register" icon={<FaUser />} text="Register" onClick={handleMenuToggle} />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;