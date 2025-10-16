import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import { FaUserShield, FaCalendarAlt, FaBuilding, FaBed, FaWifi, FaUserCog, FaSignOutAlt, FaDoorOpen, FaUsers, FaBell, FaBars, FaTimes, FaListAlt, FaSitemap, FaComments, FaKey } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const CUSTOM_BREAKPOINT = 1792;
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < CUSTOM_BREAKPOINT);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < CUSTOM_BREAKPOINT);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [CUSTOM_BREAKPOINT]);

    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

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
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', to: '/admin', icon: <FaUserCog />, roles: ['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'] },
        { name: 'Manage Admins', to: '/admin/manage-admins', icon: <FaUserShield />, roles: ['super-admin'] },
        { name: 'User Management', to: '/admin/user-management', icon: <FaUsers />, roles: ['admin', 'super-admin'] },
        { name: 'Password Requests', to: '/admin/password-requests', icon: <FaKey />, roles: ['admin', 'super-admin'] },
        { name: 'Manage Comments', to: '/admin/manage-comments', icon: <FaComments />, roles: ['admin', 'super-admin'] },
        { name: 'Manage Events', to: '/admin/manage-events', icon: <FaCalendarAlt />, roles: ['admin'] },
        { name: 'Manage Buildings', to: '/admin/manage-buildings', icon: <FaBuilding />, roles: ['admin'] },
        { name: 'Manage Rooms', to: '/admin/manage-rooms', icon: <FaDoorOpen/>, roles: ['admin'] },
        { name: 'Manage Beds', to: '/admin/manage-beds', icon: <FaBed />, roles: ['admin'] },
        { name: 'Manage Allocations', to: '/admin/manage-allocations', icon: <FaUserShield />, roles: ['super-operator', 'operator'] },
        { name: 'Occupancy Report', to: '/admin/occupancy-report', icon: <FaListAlt />, roles: ['admin', 'super-admin', 'operator', 'super-operator'] },
        { name: 'Live Structure View', to: '/admin/structure-view', icon: <FaSitemap />, roles: ['admin', 'super-admin', 'operator', 'super-operator'] },
        { name: 'Manage Satsang', to: '/admin/manage-satsang', icon: <FaWifi />, roles: ['satsang-operator'] },
        { name: 'Send Notification', to: '/admin/send-notification', icon: <FaBell />, roles: ['admin', 'super-admin'] },
    ];


    const getBreakpointClass = (baseClass) => {

        if (CUSTOM_BREAKPOINT === 640) return `sm:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 768) return `md:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 1024) return `lg:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 1280) return `xl:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 1536) return `2xl:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 1792) return `3xl:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 2048) return `4xl:${baseClass}`;
        if (CUSTOM_BREAKPOINT === 2304) return `5xl:${baseClass}`;
        return `md:${baseClass}`; // Default to md if breakpoint is not a standard one
    };

    return (
        <div className={`flex flex-col ${getBreakpointClass('flex-row')} min-h-screen bg-neutral font-body`}>
            {/* Overlay for mobile view */}
            {isSidebarOpen && (
                <div 
                    className={`fixed inset-0 z-[590] bg-black opacity-50 ${getBreakpointClass('hidden')}`}
                    onClick={handleMenuToggle}
                ></div>
            )}
            
            {/* Sidebar */}
            <aside className={`bg-[#C9788A] text-white w-64 p-4 ${getBreakpointClass('p-6')} shadow-soft fixed ${getBreakpointClass('static')} top-0 bottom-0 left-0 z-[650] flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${getBreakpointClass('translate-x-0')} ${getBreakpointClass('flex')}`}>
                <div className="flex justify-between items-center mb-6 pt-4">
                    <h2 className="text-xl font-bold font-heading">Admin Panel</h2>
                    <button onClick={handleMenuToggle} className={`${getBreakpointClass('hidden')} hover:text-accent p-1`}>
                        <FaTimes className="text-xl" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {navLinks.filter(link => link.roles.some(role => hasRole(role))).map((link) => (
                            <li key={link.name}>
                                <Link to={link.to} onClick={() => isMobile && setIsSidebarOpen(false)} className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-primary/20 hover:text-accent transition-colors duration-200 text-sm font-medium">
                                    <span className="w-6 h-6 flex items-center justify-center text-lg">
                                        {link.icon}
                                    </span>
                                    <span>{link.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-4 pt-4 border-t border-primary/30">
                    <button onClick={handleLogout} className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-lg bg-highlight hover:bg-opacity-80 text-white transition-colors duration-200 font-medium">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                {/* Mobile header */}
                <header className={`bg-card shadow-soft p-4 flex justify-between items-center ${getBreakpointClass('hidden')} z-[500] border-b border-background`}>
                    <button onClick={handleMenuToggle} className="text-gray-800 text-2xl hover:text-accent">
                        <FaBars />
                    </button>
                    <h1 className="text-lg font-bold font-heading text-gray-800">Admin</h1>
                </header>

                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;