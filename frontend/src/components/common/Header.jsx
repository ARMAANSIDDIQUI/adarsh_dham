import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaHome, FaInfoCircle, FaPhone, FaCalendarAlt, FaUserShield, FaListAlt, FaBell, FaBars, FaTimes } from 'react-icons/fa';

// NavLink Component for cleaner rendering
const NavLink = ({ to, icon, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-gray-50"
  >
    {icon}
    <span className="text-lg font-medium">{text}</span>
  </Link>
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

  const hasAdminRole = user?.roles?.some(role =>
    ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'].includes(role)
  );

  const commonNavLinks = [
    { to: "/", icon: <FaHome />, text: "Home" },
    { to: "/about", icon: <FaInfoCircle />, text: "About" },
    { to: "/contact", icon: <FaPhone />, text: "Contact" },
    { to: "/calendar", icon: <FaCalendarAlt />, text: "Calendar" },
  ];

  const authenticatedNavLinks = [
    { to: "/my-bookings", icon: <FaListAlt />, text: "My Bookings" },
    { to: "/notifications", icon: <FaBell />, text: "Notifications" },
  ];
  
  const authActionLinks = isAuthenticated 
    ? [
        hasAdminRole && { to: "/admin", icon: <FaUserShield />, text: "Admin" },
      ] 
    : [
        { to: "/login", icon: <FaSignInAlt />, text: "Login" },
        { to: "/register", icon: <FaUser />, text: "Register" }
      ];
      
  // Combine all links for the mobile menu
  const mobileNavLinks = [
    ...commonNavLinks,
    ...(isAuthenticated ? authenticatedNavLinks : []),
    ...authActionLinks.filter(Boolean),
  ];


  return (
    // Changed z-[600] to z-[999] for a higher stacking priority
    <header className="bg-white shadow-lg sticky top-0 z-[999] border-b border-gray-100">
      <nav className="container mx-auto flex items-center justify-between p-4 max-w-7xl">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-pink-600 transition-colors duration-200">
          Adarsh Dham
        </Link>

        {/* Desktop Nav Links (Hidden on mobile) */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Main Nav Links */}
          <div className="flex space-x-4">
            {commonNavLinks.map(link => (
              <Link 
                key={link.text}
                to={link.to}
                className="flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium"
              >
                {link.icon}
                <span className="ml-1">{link.text}</span>
              </Link>
            ))}

            {isAuthenticated && authenticatedNavLinks.map(link => (
              <Link 
                key={link.text}
                to={link.to}
                className="flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium"
              >
                {link.icon}
                <span className="ml-1">{link.text}</span>
              </Link>
            ))}
          </div>
          
          {/* Auth/User Actions */}
          <div className="flex items-center space-x-4 border-l pl-4">
            {authActionLinks.filter(Boolean).map(link => (
              <Link 
                key={link.text}
                to={link.to}
                className="flex items-center text-pink-600 hover:text-pink-700 transition-colors duration-200 font-semibold"
              >
                {link.icon}
                <span className="ml-1">{link.text}</span>
              </Link>
            ))}
            
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <FaUser />
                  <span className="font-medium">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle (Visible on mobile) */}
        <button 
          onClick={handleMenuToggle} 
          className="lg:hidden text-gray-800 hover:text-pink-600 p-2 rounded-lg transition-colors"
        >
          {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </nav>
    
      {/* Mobile Menu Container (Slide-out panel) */}
      <div 
        className={`fixed inset-0 top-[68px] z-[550] lg:hidden transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Backdrop */}
        {isMenuOpen && <div className="absolute inset-0 bg-black opacity-30" onClick={handleMenuToggle}></div>}
        
        {/* Menu Content */}
        <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-2xl space-y-2 overflow-y-auto">
          {mobileNavLinks.map(link => (
            <NavLink 
              key={link.text}
              to={link.to} 
              icon={link.icon} 
              text={link.text}
              onClick={handleMenuToggle}
            />
          ))}

          {isAuthenticated && (
            <>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-gray-700 px-4 py-2">
                  <FaUser />
                  <span className="font-semibold">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-red-600 hover:text-red-700 transition-colors duration-200 p-4 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;