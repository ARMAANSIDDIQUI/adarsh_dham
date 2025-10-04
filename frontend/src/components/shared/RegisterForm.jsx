import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { FaLock, FaPhoneAlt, FaUser, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'; // Added all necessary icons

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
    
    const navigate = useNavigate();

    // Toggle handlers
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { name, phone, password });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 min-h-screen flex items-center justify-center bg-neutral font-body">
            <div className="bg-card rounded-2xl shadow-soft max-w-md w-full p-6 md:p-8 border border-background">
                <h2 className="text-3xl font-bold font-heading mb-6 text-center text-primaryDark">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name Field with Icon */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative mt-1">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                required
                            />
                        </div>
                    </div>
                    {/* Phone Number Field with Icon */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative mt-1">
                            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="e.g., 9876543210"
                                required
                            />
                        </div>
                    </div>
                    {/* Password Field with Toggle */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                // Dynamic type for show/hide
                                type={showPassword ? "text" : "password"} 
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                // Increased right padding for the toggle icon
                                className="block w-full pl-10 pr-10 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                required
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </span>
                        </div>
                    </div>
                    {/* Confirm Password Field with Toggle */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative mt-1">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                // Dynamic type for show/hide
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                // Increased right padding for the toggle icon
                                className="block w-full pl-10 pr-10 py-2 border border-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                required
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </span>
                        </div>
                    </div>

                    {error && <p className="text-sm text-center py-2 px-3 rounded-lg bg-highlight/10 border border-highlight/20 text-highlight font-medium">{error}</p>}
                    {success && <p className="text-sm text-center py-2 px-3 rounded-lg bg-accent/10 border border-accent/20 text-accent font-medium">{success}</p>}

                    <Button type="submit" className="w-full text-lg py-3 bg-highlight hover:bg-primaryDark" disabled={loading}>
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2 h-5 w-5" /> Registering...
                            </>
                        ) : (
                            'Register'
                        )}
                    </Button>
                    <p className="text-center text-sm text-gray-700 pt-2">
                        Already have an account? 
                        <Link to="/login" className="text-highlight hover:underline font-semibold ml-1 transition-colors">
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </motion.div>
    );
};

export default RegisterForm;
