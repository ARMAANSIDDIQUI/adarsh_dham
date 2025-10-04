import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaUserCircle, FaSignOutAlt, FaIdBadge } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice.js';
import FloatingNotificationButton from './FloatingNotificationButton';

const FloatingActionButtons = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setIsUserMenuOpen(false);
    };

    const isAdmin = user?.roles?.some((role) =>
        ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'].includes(role)
    );

    if (!isAuthenticated) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
        },
    };

    const itemVariants = {
        hidden: { scale: 0, opacity: 0, y: 20 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    };

    const ActionIcon = ({ to, title, children, onClick, className }) => {
        const content = (
            <motion.div
                variants={itemVariants}
                className="group relative flex items-center"
            >
                <div className="absolute right-16 w-max bg-primaryDark text-neutral text-xs font-bold rounded-md px-3 py-1.5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-right">
                    {title}
                </div>
                <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-soft cursor-pointer transition-colors ${className}`}
                >
                    {children}
                </motion.div>
            </motion.div>
        );
        return to ? <Link to={to}>{content}</Link> : <button onClick={onClick}>{content}</button>;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="fixed top-20 right-6 flex flex-col items-end gap-4 z-[990]"
            ref={menuRef}
        >
            <FloatingNotificationButton variants={itemVariants} />
            {isAdmin && (
                <ActionIcon to="/admin" title="Admin Panel" className="bg-highlight text-white hover:bg-opacity-90">
                    <FaUserShield size={22} />
                </ActionIcon>
            )}
            <div className="relative">
                <ActionIcon title="My Account" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="bg-primary text-white hover:bg-primaryDark">
                    <FaUserCircle size={24} />
                </ActionIcon>
                <AnimatePresence>
                    {isUserMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-16 right-0 w-60 bg-card rounded-xl shadow-soft py-2 border border-background z-[-1] font-body"
                        >
                            <div className='px-4 py-3 border-b border-background'>
                                <p className='font-bold text-primaryDark truncate'>{user.name}</p>
                                <p className='text-xs text-gray-700'>{user.phone}</p>
                            </div>
                            <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-background hover:text-primaryDark">
                                <FaIdBadge className="text-gray-400" /> My Profile
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-highlight hover:bg-background mt-1 border-t border-background">
                                <FaSignOutAlt className="text-highlight/80" /> Logout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FloatingActionButtons;