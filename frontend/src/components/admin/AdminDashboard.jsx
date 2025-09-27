import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUserShield, FaCalendarAlt, FaBuilding, FaBed, FaWifi, FaFileExport, FaUsers, FaBell } from 'react-icons/fa';
import { FaListAlt } from 'react-icons/fa';

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return null;
  }

  const userRoles = user.roles;
  const hasRole = (role) => userRoles?.includes(role);

  const dashboardLinks = [
    { to: "manage-admins", name: "Manage Admins", description: "Add, remove, or modify administrator roles and permissions.", icon: <FaUsers />, roles: ['super-admin'] },
    { to: "user-management", name: "User Management", description: "View all users and manage their accounts and passwords.", icon: <FaUsers />, roles: ['admin', 'super-admin'] },
    { to: "manage-events", name: "Manage Events", description: "Create, edit, and manage event details.", icon: <FaCalendarAlt />, roles: ['admin'] },
    { to: "manage-buildings", name: "Manage Buildings", description: "Add or remove accommodation buildings.", icon: <FaBuilding />, roles: ['admin'] },
    { to: "manage-rooms", name: "Manage Rooms", description: "Configure rooms and their capacities within buildings.", icon: <FaBed />, roles: ['admin'] },
    { to: "manage-beds", name: "Manage Beds", description: "Add, edit, and delete individual beds within rooms.", icon: <FaBed />, roles: ['admin'] },
    { to: "manage-allocations", name: "Manage Allocations", description: "View and allocate bookings to specific rooms and beds.", icon: <FaUserShield />, roles: ['super-operator', 'operator'] },
    { to: "manage-satsang", name: "Manage Satsang Links", description: "Update and manage live stream links for satsang.", icon: <FaWifi />, roles: ['satsang-operator'] },
    { to: "export-data", name: "Export Data", description: "Export booking requests and other data to an XLSX file.", icon: <FaFileExport />, roles: ['admin'] },
    { to: "send-notification", name: "Send Notification", description: "Send push notifications to individual users or groups.", icon: <FaBell />, roles: ['admin', 'super-admin'] },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardLinks.filter(link => link.roles.some(role => hasRole(role))).map((link, index) => (
          <motion.div key={link.to} variants={linkVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}>
            <Link to={link.to} className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4 mb-2">
                <div className="text-3xl text-pink-500 bg-pink-100 p-3 rounded-full">
                  {link.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{link.name}</h2>
                  <p className="text-gray-500 mt-1 text-sm">{link.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;