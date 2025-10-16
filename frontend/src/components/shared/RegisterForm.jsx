import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { FaLock, FaPhoneAlt, FaUser, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RegisterForm = () => {
    // Consolidated form data into a single state object
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    
    // Changed error state to an object for field-specific messages
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const navigate = useNavigate();

    // --- NEW: Unified handleChange with input restrictions ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Remove non-digits and limit to 10 characters
            const sanitizedValue = value.replace(/\D/g, '');
            const truncatedValue = sanitizedValue.slice(0, 10);
            setFormData({ ...formData, [name]: truncatedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear the error for the field being edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // --- NEW: Comprehensive validation logic ---
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required.';
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits.';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const { name, phone, password } = formData;
            await api.post('/auth/register', { name, phone, password });
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isFormIncomplete = !formData.name || !formData.phone || !formData.password || !formData.confirmPassword;

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 flex items-center justify-center bg-neutral font-body">
            <div className="bg-card rounded-2xl shadow-soft max-w-md w-full p-6 md:p-8 border border-background">
                <h2 className="text-3xl font-bold font-heading mb-6 text-center text-primaryDark">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative mt-1">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.name ? 'border-red-500' : 'border-background'}`}
                                required
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone Number Field */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative mt-1">
                            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                inputMode="numeric"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.phone ? 'border-red-500' : 'border-background'}`}
                                placeholder="10-digit mobile number"
                                required
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type={showPassword ? "text" : "password"} 
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.password ? 'border-red-500' : 'border-background'}`}
                                required
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative mt-1">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.confirmPassword ? 'border-red-500' : 'border-background'}`}
                                required
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                    
                    <div className="pt-2">
                         <button 
                            type="submit" 
                            disabled={loading || isFormIncomplete} 
                            className={`w-full inline-flex justify-center items-center px-4 py-3 text-white text-lg font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 bg-highlight hover:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2 h-5 w-5" /> Registering...
                                </>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </div>
                    
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