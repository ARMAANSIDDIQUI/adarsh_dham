import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { FaLock, FaPhoneAlt } from 'react-icons/fa';
import api from '../../api/api';

// Your VAPID Public Key for Web Push notifications
const VAPID_PUBLIC_KEY = "BBtSN3ZjmBjiT-jODQkhdTKl2Sb9F-4F13B1ibE2ENbRIm6_UPgF8r-X-pUN7Hs_F2Bg_cGdCm4pDDmcgktH_Jg";

const LoginForm = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    // This function handles the push notification subscription process
    const subscribeToPushNotifications = async () => {
        if (!('serviceWorker' in navigator && 'PushManager' in window)) {
            console.log('Push notifications are not supported by this browser.');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (!existingSubscription) {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: VAPID_PUBLIC_KEY,
                });
                await api.post('/notifications/subscribe', subscription);
                console.log('User subscribed to push notifications.');
            } else {
                console.log('User is already subscribed.');
            }
        } catch (err) {
            if (Notification.permission === 'denied') {
                console.warn('Notification permission was denied by the user.');
            } else {
                console.error('Failed to subscribe to push notifications:', err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!phone || !password) {
            setError('Phone and password are required.');
            return;
        }
        setLoading(true);
        try {
            await dispatch(login({ phone, password })).unwrap();
            await subscribeToPushNotifications();
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="p-8 md:p-10 bg-card rounded-2xl shadow-soft max-w-sm w-full font-body"
        >
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-700 font-heading">Welcome to</h2>
                <h1 className="text-3xl font-extrabold text-primaryDark font-heading">Adarsh Dham</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="10-digit mobile number"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="text-right mt-2">
                        <Link to="/forgot-password" className="text-sm font-medium text-highlight hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
                
                {error && <p className="text-highlight text-sm text-center bg-highlight/10 p-3 rounded-lg border border-highlight/20">{error}</p>}
                
                <Button type="submit" className="w-full text-lg py-2.5 bg-highlight hover:bg-primaryDark" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-700">
                    Don't have an account? <Link to="/register" className="text-highlight hover:underline font-semibold">Register here</Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginForm;