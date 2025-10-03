import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { login } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';

const Login = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const from = location.state?.from?.pathname || '/';
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(login(formData)).unwrap();
            toast.success('Logged in successfully!');
            // Redirect is handled by the useEffect hook
        } catch (error) {
            toast.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Login to your Account</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone Input */}
                    <div>
                        <label htmlFor="phone-login" className="sr-only">Phone Number</label>
                        <div className="mt-1 relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input id="phone-login" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" placeholder="Phone Number" />
                        </div>
                    </div>
                    {/* Password Input */}
                    <div>
                        <label htmlFor="password-login" className="sr-only">Password</label>
                        <div className="mt-1 relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input id="password-login" name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500" placeholder="Password" />
                        </div>
                    </div>
                    {/* Forgot Password Link */}
                    <div className="text-sm text-right">
                        <Link to="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                            Forgot password?
                        </Link>
                    </div>
                    {/* Submit Button */}
                    <div>
                        <Button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center">
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSignInAlt className="mr-2" />}
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;