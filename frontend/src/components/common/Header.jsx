import React, { useState, useEffect } from 'react';
import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../redux/slices/authSlice.js';
import {
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaCalendarAlt,
  FaBell,
  FaBars,
  FaTimes,
  FaClipboardList,
} from 'react-icons/fa';
import EnableNotificationsButton from '../common/EnableNotificationsButton.jsx';

// Custom NavLink
const NavLink = ({ to, icon, text, onClick, end = false }) => (
  <RouterNavLink
    to={to}
    onClick={onClick}
    end={end}
    className={({ isActive }) =>
      `flex items-center space-x-2 px-3 py-2 transition-colors duration-300 rounded-md text-base font-medium ` +
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1240);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const isAdmin = user?.roles?.some((role) =>
    ['admin', 'super-admin', 'super-operator', 'operator'].includes(role)
  );

  // Clicking on role redirects admin to admin panel
  const handleRoleClick = () => {
    if (isAdmin) navigate('/admin');
  };

  const handleResize = () => setIsMobile(window.innerWidth < 1240);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-[9999]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3 max-w-7xl">
        <Link
          to="/"
          className="text-2xl font-bold mr-5 text-gray-800 hover:text-pink-600 transition-colors duration-200"
        >
          Adarsh Dham
        </Link>

        {!isMobile && (
          <div className="flex items-center gap-x-3">
            <NavLink to="/" icon={<FaHome />} text="Home" end />
            <NavLink to="/about" icon={<FaInfoCircle />} text="About" />
            <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" />
            <NavLink to="/events" icon={<FaClipboardList />} text="Event List" />
            <NavLink to="/contact" icon={<FaPhone />} text="Contact" />
            {isAuthenticated && (
              <>
                <NavLink to="/my-bookings" icon={<FaClipboardList />} text="My Bookings" />
                <NavLink to="/notifications" icon={<FaBell />} text="Notifications" />
              </>
            )}
          </div>
        )}

        {!isMobile && (
          <div className="flex items-center gap-x-3">
            {isAuthenticated ? (
              <>
                <EnableNotificationsButton />
                <div
                  onClick={handleRoleClick}
                  className={`flex items-center gap-x-1 text-gray-700 cursor-pointer ${
                    isAdmin ? 'hover:text-pink-600' : ''
                  }`}
                >
                  <FaUser />
                  <span className="font-medium">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-1 text-red-600 hover:text-red-700 font-semibold p-2 rounded-md hover:bg-red-50 transition-colors"
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
        )}

        {isMobile && (
          <button
            onClick={handleMenuToggle}
            className="text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-white"
          >
            <div className="flex flex-col h-full justify-between p-6 pt-24">
              <div className="flex flex-col items-center gap-y-4 text-2xl">
                <NavLink to="/" icon={<FaHome />} text="Home" onClick={handleMenuToggle} end />
                <NavLink to="/about" icon={<FaInfoCircle />} text="About" onClick={handleMenuToggle} />
                <NavLink to="/calendar" icon={<FaCalendarAlt />} text="Calendar" onClick={handleMenuToggle} />
                <NavLink to="/events" icon={<FaClipboardList />} text="Event List" onClick={handleMenuToggle} />
                <NavLink to="/contact" icon={<FaPhone />} text="Contact" onClick={handleMenuToggle} />
              </div>

              <div className="flex flex-col items-center gap-y-4 pb-8 mt-6 border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <NavLink to="/my-bookings" icon={<FaClipboardList />} text="My Bookings" onClick={handleMenuToggle} />
                    <NavLink to="/notifications" icon={<FaBell />} text="Notifications" onClick={handleMenuToggle} />
                    <div
                      onClick={() => {
                        handleRoleClick();
                        handleMenuToggle();
                      }}
                      className={`flex items-center gap-x-1 text-gray-700 cursor-pointer text-xl ${
                        isAdmin ? 'hover:text-pink-600' : ''
                      }`}
                    >
                      <FaUser />
                      <span className="font-medium">{user?.name || 'User'}</span>
                    </div>
                    <EnableNotificationsButton />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-x-3 p-3 rounded-md bg-red-50 text-red-600 font-semibold hover:bg-red-100"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
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
  );
};

export default Header;
