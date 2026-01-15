import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // FaEye and FaEyeSlash imported
import api from '../../api/api';
import { urlBase64ToUint8Array } from '../../utils/helpers';
import PhoneInput from '../common/PhoneInput';

// Your VAPID Public Key for Web Push notifications
const VAPID_PUBLIC_KEY = "BBtSN3ZjmBjiT-jODQkhdTKl2Sb9F-4F13B1ibE2ENbRIm6_UPgF8r-X-pUN7Hs_F2Bg_cGdCm4pDDmcgktH_Jg";

const LoginForm = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle visibility
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    // Toggle function for password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!phone || !password) {
            setError('Phone and password are required.');
            return;
        }
        // Basic check for length (including country code)
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10) {
            setError('Please enter a valid phone number.');
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
                <h1 className="text-3xl font-extrabold text-primaryDark font-heading">Shri Adarsh Dham</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <PhoneInput
                        label="Phone Number"
                        value={phone}
                        onChange={setPhone}
                        required
                        placeholder="10-digit mobile number"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                        <input
                            // Dynamic type based on state
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // Increased right padding to accommodate the icon
                            className="block w-full pl-10 pr-10 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                        {/* Toggle button using FaEye/FaEyeSlash */}
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="text-right mt-2">
                        <Link to="/forgot-password" className="text-sm font-medium text-highlight hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
                
                {error && <p className="text-highlight text-sm text-center bg-highlight/10 p-3 rounded-lg border border-highlight/20">{error}</p>}
                
                <Button type="submit" className="w-full text-lg py-2.5 bg-primaryDark hover:bg-highlight text-white disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={loading}>
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
