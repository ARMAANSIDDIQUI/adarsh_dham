import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCommentAlt, FaPaperPlane, FaSpinner, FaLock, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';
import PhoneInput, { validatePhoneNumber } from '../components/common/PhoneInput';
// import ThemedInput from '../components/common/ThemedInput'; // Unused

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP/Admin Choice, 3: Reset Form
    const [method, setMethod] = useState(null); // 'email' or 'admin'

    // Form Data
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(''); // Masked email for display, real email logic handled internally if possible or returned
    const [realEmail, setRealEmail] = useState('');
    const [reason, setReason] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- STEP 1: CHECK RECOVERY METHOD ---
    const handleCheckMethod = async (e) => {
        e.preventDefault();
        if (!validatePhoneNumber(phone)) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/check-recovery-method', { phone });
            setMethod(res.data.method);
            if (res.data.method === 'email') {
                setEmail(res.data.maskedEmail);
                setRealEmail(res.data.email); // In a real secure app we might not return this but for OTP sending we need it
                // Auto send OTP
                await sendOtp(res.data.email);
            }
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "User not found");
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (targetEmail) => {
        try {
            await api.post('/auth/send-otp', { email: targetEmail, type: 'forgot_password' });
            toast.success("OTP sent to your registered email");
        } catch (err) {
            toast.error("Failed to send OTP");
        }
    };

    // --- STEP 2B: SUBMIT ADMIN REQUEST ---
    const handleSubmitAdminRequest = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Reason is required");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/password-requests', { phone, reason });
            toast.success(data.message);
            // Maybe redirect after success
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong.');
            setLoading(false);
        }
    };

    // --- STEP 3: RESET PASSWORD WITH OTP ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) {
            toast.error("All fields required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password-otp', { email: realEmail, otp, newPassword });
            toast.success("Password reset successfully! Login with new password.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Reset failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral flex items-center justify-center p-4 font-body">
            <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-soft"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading text-primaryDark">Recovery</h2>
                    <p className="mt-2 text-gray-700 text-sm">
                        {step === 1 && "Enter your phone number to find your account."}
                        {step === 2 && method === 'email' && `Enter OTP sent to ${email}`}
                        {step === 2 && method === 'admin' && "Email verification not found."}
                    </p>
                </div>

                {/* STEP 1: PHONE INPUT */}
                {step === 1 && (
                    <form onSubmit={handleCheckMethod} className="space-y-6">
                        <PhoneInput
                            label="Phone Number"
                            value={phone}
                            onChange={(val) => setPhone(val)}
                            required
                        />
                        <Button type="submit" disabled={loading} className="w-full bg-primaryDark text-white">
                            {loading ? <FaSpinner className="animate-spin" /> : "Next"}
                        </Button>
                    </form>
                )}

                {/* STEP 2: METHOD EMAIL */}
                {step === 2 && method === 'email' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 mb-4 flex items-start">
                            <FaCheck className="mt-1 mr-2" />
                            <div>
                                Verified email found: <strong>{email}</strong>.<br />
                                An OTP has been sent.
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter 6-digit code"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md pr-10"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-primaryDark text-white">
                            {loading ? <FaSpinner className="animate-spin" /> : "Reset Password"}
                        </Button>

                        <button
                            type="button"
                            onClick={() => sendOtp(realEmail)}
                            className="w-full text-sm text-primary hover:underline mt-2"
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {/* STEP 2: METHOD ADMIN */}
                {step === 2 && method === 'admin' && (
                    <form onSubmit={handleSubmitAdminRequest} className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-800 mb-4 flex items-start border border-amber-200">
                            <FaLock className="mt-1 mr-2 text-amber-600" />
                            <div>
                                <strong>Verified Email Not Found</strong><br />
                                Your account does not have a verified email linked. You cannot reset your password instantly.
                                Please submit a request to the administrators below.
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason / Explanation</label>
                            <div className="mt-1 relative">
                                <FaCommentAlt className="absolute left-3 top-3 text-accent" />
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-background rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="Explain why you lost access..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-primaryDark text-white">
                            {loading ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane className="mr-2" /> Send Admin Request</>}
                        </Button>
                    </form>
                )}

                <div className="text-center pt-4 border-t border-gray-100">
                    <Link to="/login" className="font-medium text-primary hover:text-primaryDark text-sm">
                        Back to Login
                    </Link>
                </div>

            </motion.div>
        </div>
    );
};

export default ForgotPassword;