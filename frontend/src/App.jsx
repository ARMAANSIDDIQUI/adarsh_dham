import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { requestForToken, onMessageListener } from './firebase';

import HomePage from './pages/Home.jsx';
import AboutPage from './pages/About.jsx';
import ContactPage from './pages/Contact.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import BookingPage from './pages/Booking.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import UserNotifications from './components/user/UserNotifications.jsx';
import MyBookings from './components/user/MyBookings.jsx'; 

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
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            requestForToken();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const unsubscribe = onMessageListener()
            .then(payload => {
                toast.info(<div><strong>{payload.notification.title}</strong><br/>{payload.notification.body}</div>);
            })
            .catch(err => console.log('failed to listen for foreground messages', err));
        
        return () => {
            unsubscribe.catch(err => console.log('failed to unsubscribe', err));
        };
    }, []);

    return (
        <Router>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                        <Route path="/calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
                        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                        
                        <Route path="/booking/:eventId" element={<ProtectedRoute component={BookingPage} />} />
                        <Route path="/my-bookings" element={<ProtectedRoute component={MyBookings} />} />
                        
                        <Route path="/notifications" element={<ProtectedRoute component={UserNotifications} />} />
                        <Route path="/admin/*" element={<ProtectedRoute roles={['admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator']} component={Admin} />} />
                        
                        <Route path="*" element={<h1 className="text-center text-4xl mt-10">404 - Page Not Found</h1>} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;