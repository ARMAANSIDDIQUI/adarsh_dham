import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/api.js';
import { updateUser } from '../../redux/slices/authSlice.js';
import { FaUser, FaSpinner } from 'react-icons/fa';
import ThemedInput from '../common/ThemedInput.jsx';
import { useTranslation } from '../../hooks/useTranslation';
import PhoneInput from '../common/PhoneInput.jsx';

const UpdateProfileForm = () => {
    const dispatch = useDispatch();
    const t = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Determines if the button should be disabled:
    // 1. If loading.
    // 2. If name is empty (trimmed) or email is empty.
    // 3. If neither name nor email has changed.
    const isNameChanged = name.trim() !== user?.name;
    const isEmailChanged = email.trim() !== (user?.email || '');
    const isButtonDisabled = loading || name.trim() === '' || email.trim() === '' || (!isNameChanged && !isEmailChanged);

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Email required");
            return;
        }
        setOtpLoading(true);
        try {
            await api.post('/auth/send-otp', { email: email, type: 'update' });
            setOtpSent(true);
            toast.success("OTP sent to your email!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isButtonDisabled) return;

        // If email changed but OTP not sent/entered
        if (isEmailChanged) {
            if (!otpSent) {
                toast.error("Please verify your new email first.");
                return;
            }
            if (!otp) {
                toast.error("Please enter the OTP sent to your email.");
                return;
            }
        }

        setLoading(true);
        try {
            const payload = { name };
            if (isEmailChanged) {
                payload.email = email;
                payload.otp = otp;
            }

            const res = await api.put(`/users/profile`, payload);

            dispatch(updateUser(res.data));
            toast.success(t.profile.updateForm.success);
            // Reset OTP state
            setOtpSent(false);
            setOtp('');
        } catch (err) {
            console.error("Profile update failed:", err);
            const errorMessage = err.response?.data?.message || t.profile.updateForm.error;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 font-body bg-card p-6 rounded-2xl shadow-soft h-full">
            <h3 className="text-xl font-semibold font-heading mb-4 text-primaryDark border-b border-background pb-2">{t.profile.updateForm.button}</h3>
            <ThemedInput
                label={t.profile.updateForm.name}
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<FaUser />}
            />

            {/* Email Update Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-background`}
                        placeholder="Enter email"
                    />
                    {isEmailChanged && (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading || !email}
                            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryDark disabled:bg-gray-300 text-sm whitespace-nowrap"
                        >
                            {otpLoading ? <FaSpinner className="animate-spin" /> : (otpSent ? "Resend OTP" : "Send OTP")}
                        </button>
                    )}
                </div>
                {isEmailChanged && !otpSent && <p className="text-xs text-orange-500 mt-1">Verification required to change email.</p>}
            </div>

            {/* OTP Field for Email Update */}
            {isEmailChanged && otpSent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <ThemedInput
                        label="Enter OTP"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required={isEmailChanged}
                    />
                    <p className="text-xs text-gray-500 -mt-2">Check your new email for the code.</p>
                </motion.div>
            )}
            <div>
                <PhoneInput
                    label={t.profile.updateForm.phone}
                    value={user?.phone || ''}
                    disabled
                />
            </div>
            <p className="text-xs text-gray-700 -mt-2">{t.profile.updateForm.phoneNotice}</p>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={`w-full text-lg py-3 inline-flex justify-center items-center text-white font-semibold rounded-lg shadow-soft transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/50 
                        ${isButtonDisabled
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-primaryDark hover:bg-highlight'
                        }`}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2 h-5 w-5" /> {t.profile.updateForm.updating}
                        </>
                    ) : (
                        t.profile.updateForm.button
                    )}
                </button>
            </div>
        </form>
    );
};

export default UpdateProfileForm;