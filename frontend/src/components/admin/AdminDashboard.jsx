import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUserShield, FaCalendarAlt, FaBuilding, FaDoorOpen, FaBed, FaWifi, FaUsers, FaBell, FaListAlt, FaSitemap, FaComments, FaKey, FaUserCog } from 'react-icons/fa';

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
        { to: "manage-admins", name: "Manage Admins", description: "Modify administrator roles and permissions.", icon: <FaUserCog />, roles: ['super-admin'] },
        { to: "user-management", name: "User Management", description: "View all users and manage their accounts.", icon: <FaUsers />, roles: ['admin', 'super-admin'] },
        { to: "password-requests", name: "Password Requests", description: "View user requests for password resets.", icon: <FaKey />, roles: ['admin', 'super-admin'] },
        { to: "manage-comments", name: "Manage Comments", description: "Approve or reject user-submitted comments.", icon: <FaComments />, roles: ['admin', 'super-admin'] },
        { to: "manage-events", name: "Manage Events", description: "Create, edit, and manage event details.", icon: <FaCalendarAlt />, roles: ['admin'] },
        { to: "manage-buildings", name: "Manage Buildings", description: "Add or remove accommodation buildings.", icon: <FaBuilding />, roles: ['admin'] },
        { to: "manage-rooms", name: "Manage Rooms", description: "Configure rooms and beds within buildings.", icon: <FaDoorOpen />, roles: ['admin'] },
        { to: "manage-beds", name: "Manage Beds", description: "Add individual beds to specific rooms.", icon: <FaBed />, roles: ['admin'] },
        { to: "manage-allocations", name: "Manage Allocations", description: "Allocate bookings to rooms and beds.", icon: <FaUserShield />, roles: ['super-operator', 'operator'] },
        { to: "occupancy-report", name: "Occupancy Report", description: "View and filter all guest stays.", icon: <FaListAlt />, roles: ['admin', 'super-admin', 'operator', 'super-operator'] },
        { to: "structure-view", name: "Live Structure View", description: "Visualize building and room occupancy.", icon: <FaSitemap />, roles: ['admin', 'super-admin', 'operator', 'super-operator'] },
        { to: "manage-satsang", name: "Manage Satsang Links", description: "Update and manage live stream links.", icon: <FaWifi />, roles: ['satsang-operator'] },
        { to: "send-notification", name: "Send Notification", description: "Send notifications to users or groups.", icon: <FaBell />, roles: ['admin', 'super-admin'] },
    ];

    return (
        <div className="p-6 md:p-10 bg-neutral min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center font-heading text-primaryDark">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dashboardLinks.filter(link => link.roles.some(role => hasRole(role))).map((link, index) => (
                    <motion.div key={link.to} variants={linkVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}>
                        <Link to={link.to} className="block p-6 bg-card rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 h-full">
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-background text-3xl text-accent">
                                    {React.cloneElement(link.icon, {
                                        stroke: 'black',
                                        strokeWidth: 15,
                                        strokeLinejoin: 'round',
                                        strokeLinecap: 'round'
                                    })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold font-heading text-primaryDark">{link.name}</h2>
                                    <p className="text-gray-700 mt-1 text-sm font-body">{link.description}</p>
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