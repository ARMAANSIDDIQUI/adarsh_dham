import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
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
    const [otpLoading, setOtpLoading] = useState(false);

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

        if (!otp) newErrors.otp = "OTP is required";
        if (!otpSent) newErrors.otp = "Please verify email first";

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
            toast.success("OTP sent to your email!");
            setErrors({ ...errors, otp: null });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
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

    const isFormIncomplete = !formData.name || !formData.phone || !formData.password || !formData.confirmPassword || !formData.email || !otp;

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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="flex gap-2 mt-1">
                            <div className="relative flex-grow">
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${errors.email ? 'border-red-500' : 'border-background'}`}
                                    required
                                    disabled={otpSent} // Lock email after sending OTP? Or allow user to change and resend? Let's allow change but reset OTP.
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={otpLoading || !formData.email}
                                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryDark disabled:bg-gray-300 text-sm whitespace-nowrap"
                            >
                                {otpLoading ? <FaSpinner className="animate-spin" /> : (otpSent ? "Resend OTP" : "Send OTP")}
                            </button>
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* OTP Field */}
                    {otpSent && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${errors.otp ? 'border-red-500' : 'border-background'}`}
                                placeholder="Enter 6-digit OTP"
                                required
                            />
                            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                            <p className="text-xs text-gray-500 mt-1">Check your email for the code.</p>
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
