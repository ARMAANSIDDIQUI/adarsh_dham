import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaUser, FaPhoneAlt, FaLock, FaSignInAlt, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { useTranslation } from '../hooks/useTranslation';

const Login = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const t = useTranslation();
    const [formData, setFormData] = useState({ phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const from = location.state?.from?.pathname || '/';
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const sanitizedValue = value.replace(/\D/g, '');
            const truncatedValue = sanitizedValue.slice(0, 10);
            
            setFormData({ ...formData, [name]: truncatedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = t.login.error.phoneLength;
        }
        if (!formData.password) {
            newErrors.password = t.login.error.required;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await dispatch(login(formData)).unwrap();
            toast.success(t.login.error.success);
        } catch (error) {
            toast.error(error.message || t.login.error.generic);
        } finally {
            setLoading(false);
        }
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isFormIncomplete = formData.phone.trim() === '' || formData.password.trim() === '';

    return (
        <div className="min-h-screen w-full bg-neutral flex items-center justify-center p-4 font-body">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-soft"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading text-primaryDark">{t.login.title}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone-login" className="block text-sm font-medium text-gray-700 mb-1">{t.login.phoneLabel}</label>
                        <div className="mt-1 relative">
                            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent rotate-90" />
                            <input 
                                id="phone-login" 
                                name="phone" 
                                type="tel" 
                                inputMode="numeric" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                required 
                                autoComplete="username"
                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.phone ? 'border-red-500' : 'border-background'}`} 
                                placeholder={t.login.phonePlaceholder} 
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">{t.login.passwordLabel}</label>
                        <div className="mt-1 relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                id="password-login"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : 'border-background'}`}
                                placeholder={t.login.passwordPlaceholder}
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div className="text-sm text-right">
                        <Link to="/forgot-password" className="font-medium text-highlight hover:underline">
                            {t.login.forgotPassword}
                        </Link>
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={loading || isFormIncomplete} 
                            className={`w-full inline-flex justify-center items-center px-4 py-3 text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 bg-primaryDark hover:bg-highlight disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSignInAlt className="mr-2" />}
                            {loading ? t.login.loggingIn : t.login.button}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-700">
                        {t.login.noAccount}{' '}
                        <Link to="/register" className="font-medium text-highlight hover:underline">
                            {t.login.registerHere}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
