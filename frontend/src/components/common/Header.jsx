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
    // FaCalendarAlt,
    FaBars,
    FaBookOpen,
    FaTimes,
    FaClipboardList,
    FaComments,
    FaUserShield,
    FaUserCircle,
    FaBell,
    FaSignOutAlt,
    FaGlobe
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice.js';
import { useGetUnreadNotificationCountQuery } from '../../redux/api/apiSlice.js';
import { setLanguage } from '../../redux/slices/uiSlice.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import FloatingActionButtons from './FloatingActionButtons';
import EnableNotificationsButton from './EnableNotificationsButton';

const NotificationIcon = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { data: countResponse } = useGetUnreadNotificationCountQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 300000, // 5 minutes
    });
    const unreadCount = countResponse?.count ?? countResponse ?? 0;

    return (
        <span className="relative">
            <FaBell />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-highlight text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </span>
    );
};

const NavLink = ({ to, icon, text, onClick, end = false }) => (
    <RouterNavLink
        to={to}
        onClick={onClick}
        end={end}
        className={({ isActive }) =>
            `flex items-center whitespace-nowrap space-x-2 px-2 py-2 transition-colors duration-300 rounded-md text-base font-medium ` +
            (isActive
                ? 'bg-primary/20 text-primaryDark'
                : 'text-gray-700 hover:bg-card hover:text-primaryDark')
        }
    >
        {icon}
        <span>{text}</span>
    </RouterNavLink>
);

const Header = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.ui);
    const t = useTranslation();
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
    const handleLogout = () => {
        dispatch(logout());
        setIsMenuOpen(false);
    };

    const handleLanguageToggle = () => dispatch(setLanguage(language === 'en' ? 'hi' : 'en'));

    const isAdmin = user?.roles?.some((role) =>
        ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'].includes(role)
    );

    useEffect(() => {
        // Redux Toolkit Query now handles polling automatically in the NotificationIcon component
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => (document.body.style.overflow = 'unset');
    }, [isMenuOpen]);

    return (
        <>
            <header className="bg-background shadow-soft sticky top-0 z-[999] font-body border-b border-card transition-colors duration-300">
                <nav className="flex items-center justify-between px-4 py-3">
                    <Link to="/" className="text-2xl font-bold mr-5 text-primaryDark hover:text-opacity-80 transition-colors duration-200 flex items-center gap-x-1 font-heading">
                        <span className="whitespace-nowrap">Shri Adarsh Dham</span>
                    </Link>

                    {!isMobile && (
                        <div className="flex-1 flex items-center justify-end gap-x-1">
                            <NavLink to="/" icon={<FaHome />} text={t.nav.home} end />
                            <NavLink to="/about" icon={<FaInfoCircle />} text={t.nav.about} />
                            <NavLink to="/events" icon={<FaClipboardList />} text={t.nav.eventList} />
                            <NavLink to="/events" icon={<FaBookOpen />} text={t.nav.requestBooking} />
                            <NavLink to="/comments" icon={<FaComments />} text={t.nav.comments} />
                            <NavLink to="/contact" icon={<FaPhone className="rotate-90" />} text={t.nav.contact} />
                            {isAuthenticated && (
                                <>
                                    <NavLink to="/my-bookings" icon={<FaClipboardList />} text={t.nav.myBookings} />
                                    <NavLink
                                        to="/notifications"
                                        icon={<NotificationIcon />}
                                        text={t.nav.notifications}
                                    />
                                    {/* Language Toggle (Desktop - Logged In) */}
                                    <div className="relative group">
                                        <button onClick={handleLanguageToggle} className="flex items-center gap-1 px-2 py-1 text-primaryDark font-medium hover:bg-black/5 rounded-md transition-colors" aria-label="Toggle Language">
                                            <FaGlobe />
                                            <span>{language.toUpperCase()}</span>
                                        </button>
                                        <div className="absolute right-0 top-full mt-2 w-max hidden group-hover:block z-50">
                                            <div className="bg-card text-primaryDark px-3 py-2 rounded-lg shadow-xl text-sm font-semibold border border-primary/20">
                                                {t.language.toggleTitle}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!isMobile && !isAuthenticated && (
                        <div className="flex items-center gap-x-1 ml-2">
                            <NavLink to="/login" icon={<FaSignInAlt />} text={t.nav.login} />
                            <NavLink to="/register" icon={<FaUser />} text={t.nav.register} />
                            {/* Language Toggle (Desktop - Logged Out) */}
                            <div className="relative group">
                                <button onClick={handleLanguageToggle} className="flex items-center gap-1 px-2 py-1 text-primaryDark font-medium hover:bg-black/5 rounded-md transition-colors" aria-label="Toggle Language">
                                    <FaGlobe />
                                    <span>{language.toUpperCase()}</span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-max hidden group-hover:block z-50">
                                    <div className="bg-card text-primaryDark px-3 py-2 rounded-lg shadow-xl text-sm font-semibold border border-primary/20">
                                        {t.language.toggleTitle}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMobile && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleMenuToggle}
                                className="text-primaryDark p-2 rounded-full hover:bg-card transition-colors duration-200 z-[1000]"
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
                        </div>
                    )}
                </nav>

                <AnimatePresence>
                    {isMobile && isMenuOpen && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
                            className="fixed top-0 right-0 h-full w-4/5 max-w-sm z-[998] bg-card overflow-y-auto shadow-xl"
                        >
                            <div className="flex flex-col h-full p-6 pt-24 text-gray-800">
                                <div className="flex flex-col items-start gap-y-6 text-xl">
                                    <NavLink to="/" icon={<FaHome />} text={t.nav.home} onClick={handleMenuToggle} end />
                                    <NavLink to="/about" icon={<FaInfoCircle />} text={t.nav.about} onClick={handleMenuToggle} />
                                    <NavLink to="/events" icon={<FaClipboardList />} text={t.nav.eventList} onClick={handleMenuToggle} />
                                    <NavLink to="/events" icon={<FaBookOpen />} text={t.nav.requestBooking} />
                                    <NavLink to="/comments" icon={<FaComments />} text={t.nav.comments} onClick={handleMenuToggle} />
                                    <NavLink to="/contact" icon={<FaPhone className="rotate-90" />} text={t.nav.contact} onClick={handleMenuToggle} />

                                    <div className="w-full border-t border-background my-4"></div>

                                    <button onClick={handleLanguageToggle} className="flex items-center space-x-2 px-3 py-2 text-primaryDark font-medium hover:bg-black/5 rounded-md w-full text-left">
                                        <FaGlobe />
                                        <span>{language === 'en' ? t.language.hindi : t.language.english}</span>
                                    </button>

                                    {isAuthenticated ? (
                                        <>
                                            <NavLink to="/profile" icon={<FaUserCircle />} text={t.nav.myProfile} onClick={handleMenuToggle} />
                                            <NavLink to="/my-bookings" icon={<FaClipboardList />} text={t.nav.myBookings} onClick={handleMenuToggle} />
                                            <div className="my-2"><EnableNotificationsButton /></div>
                                            <NavLink
                                                to="/notifications"
                                                icon={<NotificationIcon />}
                                                text={t.nav.notificationsHistory}
                                                onClick={handleMenuToggle}
                                            />
                                            {isAdmin && <NavLink to="/admin" icon={<FaUserShield />} text={t.nav.adminPanel} onClick={handleMenuToggle} />}
                                            <div className="mt-4">
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-lg text-white bg-primaryDark hover:bg-highlight rounded-lg transition-colors">
                                                    <FaSignOutAlt /> {t.nav.logout}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/login" icon={<FaSignInAlt />} text={t.nav.login} onClick={handleMenuToggle} />
                                            <NavLink to="/register" icon={<FaUser />} text={t.nav.register} onClick={handleMenuToggle} />
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