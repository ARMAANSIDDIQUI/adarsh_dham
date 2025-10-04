import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Page Imports
import HomePage from './pages/Home.jsx';
import AboutPage from './pages/About.jsx';
import ContactPage from './pages/Contact.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import BookingPage from './pages/Booking.jsx';
import EventsPage from './pages/EventsPage';
import ForgotPassword from './pages/ForgotPassword.jsx';

// User Component Imports
import MyBookings from './components/user/MyBookings.jsx'; 
import UserNotifications from './components/user/UserNotifications.jsx';
import CommentsPage from './components/user/CommentsPage.jsx';
import UserProfile from './components/user/UserProfile.jsx';

// Common Component Imports
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

const PageTransition = ({ children }) => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="flex flex-col min-h-screen bg-neutral font-body">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                        <Route path="/calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
                        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                        <Route path="/events/:date?" element={<EventsPage />} />
                        <Route path="/comments" element={<CommentsPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        
                        {/* Protected User Routes */}
                        <Route path="/booking/:eventId" element={<ProtectedRoute component={BookingPage} />} />
                        <Route path="/my-bookings" element={<ProtectedRoute component={MyBookings} />} />
                        <Route path="/notifications" element={<ProtectedRoute component={UserNotifications} />} />
                        <Route path="/profile" element={<ProtectedRoute component={UserProfile} />} />
                        
                        {/* Protected Admin Route */}
                        <Route 
                            path="/admin/*" 
                            element={<ProtectedRoute roles={['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator']} component={Admin} />} 
                        />
                        
                        {/* 404 Not Found Route */}
                        <Route path="*" element={
                            <div className="text-center p-10 min-h-screen flex flex-col justify-center items-center">
                                <h1 className="text-4xl font-bold font-heading text-primaryDark">404 - Page Not Found</h1>
                                <p className="text-gray-700 mt-2">The page you're looking for does not exist.</p>
                            </div>
                        } />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;