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
        } catch (error) {
            toast.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen w-full bg-neutral flex items-center justify-center p-4 font-body">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-soft"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading text-primaryDark">Login to your Account</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone-login" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="mt-1 relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input id="phone-login" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-background rounded-md focus:ring-primary focus:border-primary" placeholder="Phone Number" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="mt-1 relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input id="password-login" name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-background rounded-md focus:ring-primary focus:border-primary" placeholder="Password" />
                        </div>
                    </div>
                    <div className="text-sm text-right">
                        <Link to="/forgot-password" className="font-medium text-highlight hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div>
                        <Button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center bg-highlight hover:bg-primaryDark text-white">
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSignInAlt className="mr-2" />}
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-700">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-highlight hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;