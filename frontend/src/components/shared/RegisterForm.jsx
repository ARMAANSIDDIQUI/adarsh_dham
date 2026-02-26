import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from '../../hooks/useTranslation';
import PhoneInput, { validatePhoneNumber } from '../common/PhoneInput';

const RegisterForm = () => {
    const t = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handlePhoneChange = (newPhone) => {
        setFormData({ ...formData, phone: newPhone });
        if (errors.phone) {
            setErrors({ ...errors, phone: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = t.register.error.nameRequired;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!isEmailVerified) {
            newErrors.email = "Please verify your email address";
        }

        if (!validatePhoneNumber(formData.phone)) {
            newErrors.phone = t.register.error.phoneLength || "Invalid phone number";
        }

        if (formData.password.length < 6) {
            newErrors.password = t.register.error.passwordLength;
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t.register.error.passwordMatch;
        }
        return newErrors;
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setErrors({ ...errors, email: 'Email required for OTP' });
            return;
        }
        setOtpLoading(true);
        try {
            await api.post('/auth/send-otp', { email: formData.email, type: 'register' });
            setOtpSent(true);
            setTimer(60);
            toast.success("OTP sent to your email!");
            setErrors({ ...errors, otp: null });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setErrors({ ...errors, otp: 'OTP is required' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email: formData.email, otp, type: 'register' });
            setIsEmailVerified(true);
            toast.success("Email verified successfully!");
            setErrors({ ...errors, otp: null, email: null });
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
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
            const { name, phone, password, email } = formData;
            await api.post('/auth/register', { name, phone, password, email, otp });
            toast.success(t.register.error.success);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || t.register.error.generic);
        } finally {
            setLoading(false);
        }
    };

    const isFormIncomplete = !formData.name || !formData.phone || !formData.password || !formData.confirmPassword || !formData.email || !isEmailVerified || !otp;

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 flex items-center justify-center bg-neutral font-body">
            <div className="bg-card rounded-2xl shadow-soft max-w-md w-full p-6 md:p-8 border border-background">
                <h2 className="text-3xl font-bold font-heading mb-6 text-center text-primaryDark">{t.register.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.register.nameLabel}</label>
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

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                            {isEmailVerified && (
                                <span className="ml-2 text-green-500 text-xs font-semibold flex items-center inline-flex">
                                    <FaCheckCircle className="mr-1" /> Verified
                                </span>
                            )}
                        </label>
                        <div className="relative mt-1">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.email ? 'border-red-500' : 'border-background'} ${isEmailVerified ? 'bg-gray-100 text-gray-500' : ''}`}
                                required
                                disabled={isEmailVerified}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                        {!isEmailVerified && !otpSent && (
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading || !formData.email || timer > 0}
                                    className="px-4 py-2 bg-primaryDark text-white rounded-lg hover:bg-highlight disabled:bg-gray-300 text-sm whitespace-nowrap shadow-sm transition-colors"
                                >
                                    {otpLoading ? <FaSpinner className="animate-spin" /> : (timer > 0 ? `Resend in ${timer}s` : "Verify Email")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* OTP Field */}
                    {otpSent && !isEmailVerified && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 border border-background rounded-lg bg-gray-50 shadow-inner block">
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={`flex-grow block px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${errors.otp ? 'border-red-500' : 'border-background'}`}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={loading || !otp}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark disabled:bg-gray-300 text-sm font-semibold whitespace-nowrap shadow-sm transition-colors"
                                >
                                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Submit OTP"}
                                </button>
                            </div>
                            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                            <div className="flex justify-between items-center mt-3">
                                <p className="text-xs text-gray-500">Check your email for the code.</p>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading || timer > 0}
                                    className="text-xs text-primary font-medium hover:underline disabled:text-gray-400"
                                >
                                    {otpLoading ? "Sending..." : (timer > 0 ? `Resend (${timer}s)` : "Resend OTP")}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Phone Number Field */}
                    <div>
                        <PhoneInput
                            label={t.register.phoneLabel}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            error={errors.phone}
                            placeholder={t.register.phonePlaceholder}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t.register.passwordLabel}</label>
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
                                autoComplete="new-password"
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
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t.register.confirmPasswordLabel}</label>
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
                                autoComplete="new-password"
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
                            className={`w-full inline-flex justify-center items-center px-4 py-3 text-white text-lg font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 bg-primaryDark hover:bg-highlight disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2 h-5 w-5" /> {t.register.registering}
                                </>
                            ) : (
                                t.register.button
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-700 pt-2">
                        {t.register.alreadyAccount}{' '}
                        <Link to="/login" className="text-highlight hover:underline font-semibold ml-1 transition-colors">
                            {t.register.loginHere}
                        </Link>
                    </p>
                </form>
            </div >
        </motion.div >
    );
};

export default RegisterForm;
