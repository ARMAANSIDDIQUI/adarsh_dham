import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import { FaUserShield, FaCalendarAlt, FaBuilding, FaBed, FaWifi, FaSignOutAlt, FaFileExport, FaUsers, FaBell, FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile menu toggle

  if (!user) {
    return null;
  }
  
  const handleMenuToggle = () => {
      setIsSidebarOpen(!isSidebarOpen);
  };

  const userRoles = user.roles;
  const hasRole = (role) => userRoles?.includes(role);

  const handleLogout = () => {
    dispatch(logout());
    // Close the sidebar when logging out on mobile
    if (isSidebarOpen) {
        setIsSidebarOpen(false);
    }
    navigate('/login');
  };

  const navLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: <FaUserShield />, roles: ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'] },
    { name: 'Manage Admins', path: '/admin/manage-admins', icon: <FaUsers />, roles: ['super-admin'] },
    { name: 'Manage Events', path: '/admin/manage-events', icon: <FaCalendarAlt />, roles: ['admin'] },
    { name: 'Manage Buildings', path: '/admin/manage-buildings', icon: <FaBuilding />, roles: ['admin'] },
    { name: 'Manage Rooms', path: '/admin/manage-rooms', icon: <FaBed />, roles: ['admin'] },
    { name: 'Manage Beds', path: '/admin/manage-beds', icon: <FaBed />, roles: ['admin'] },
    { name: 'Manage Allocations', path: '/admin/manage-allocations', icon: <FaUserShield />, roles: ['super-operator', 'operator'] },
    { name: 'Manage Satsang', path: '/admin/manage-satsang', icon: <FaWifi />, roles: ['satsang-operator'] },
    { name: 'Export Data', path: '/admin/export-data', icon: <FaFileExport />, roles: ['admin'] },
    { name: 'Send Notification', path: '/admin/send-notification', icon: <FaBell />, roles: ['admin', 'super-admin'] },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      
      {/* 1. Mobile Overlay/Backdrop when menu is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[590] bg-black opacity-50 md:hidden"
          onClick={handleMenuToggle}
        ></div>
      )}
      
      {/* 2. Sidebar (Responsive, Sliding Menu) */}
      <aside className={`
          bg-gray-800 text-white w-64 p-4 md:p-6 shadow-2xl 
          fixed md:static top-0 bottom-0 left-0 z-[650] transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:flex md:flex-col
      `}>
        {/* Adjusted sidebar content to ensure the "Admin Panel" title and close button are visible */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          {/* Close Button for mobile */}
          <button onClick={handleMenuToggle} className="md:hidden text-white hover:text-red-400 p-1">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navLinks.filter(link => link.roles.some(role => userRoles?.includes(role))).map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={handleMenuToggle} // Close menu on link click
                  className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-700 hover:text-pink-300 transition-colors duration-200 text-sm font-medium"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
            {/* LOGOUT BUTTON MOVED INSIDE NAV FOR SCROLLING */}
            <li className="mt-4 pt-2 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 font-medium"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto pt-2 md:pt-0">
        
        <header className="bg-white shadow-lg p-4 flex justify-between items-center md:hidden z-[700] transform">
            <button onClick={handleMenuToggle} className="text-gray-800 text-2xl hover:text-pink-500">
                <FaBars />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Admin</h1>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-lg">
                <FaSignOutAlt />
            </button>
        </header>
        
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
