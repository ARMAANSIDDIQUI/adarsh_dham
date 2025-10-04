import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js'; 
import Button from '../common/Button.jsx';
import { FaPaperPlane, FaClock, FaExclamationCircle, FaCalendarAlt } from 'react-icons/fa';

const SendNotification = () => {
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState({ userId: '', role: '', targetGroup: 'allAdmins' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sendOption, setSendOption] = useState('now');
    const [scheduleDelay, setScheduleDelay] = useState({ days: 0, hours: 0, minutes: 5 });
    const [ttl, setTtl] = useState({ days: 1, hours: 0, minutes: 0 });
    const [totalTtlMinutes, setTotalTtlMinutes] = useState(1440);
    const roles = ['user', 'admin', 'super-admin', 'super-operator', 'operator', 'satsang-operator'];

    const calculatedSendTime = useMemo(() => {
        if (sendOption === 'now') return new Date();
        const now = new Date();
        now.setDate(now.getDate() + (parseInt(scheduleDelay.days, 10) || 0));
        now.setHours(now.getHours() + (parseInt(scheduleDelay.hours, 10) || 0));
        now.setMinutes(now.getMinutes() + (parseInt(scheduleDelay.minutes, 10) || 0));
        return now;
    }, [sendOption, scheduleDelay]);

    useEffect(() => {
        const d = ttl.days || 0;
        const h = ttl.hours || 0;
        const m = ttl.minutes || 0;
        const total = (d * 1440) + (h * 60) + m;
        setTotalTtlMinutes(Math.max(1, Math.round(total)));
    }, [ttl]);

    const handleTtlChange = (e) => {
        const { name, value } = e.target;
        setTtl(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };
    
    const handleDelayChange = (e) => {
        const { name, value } = e.target;
        setScheduleDelay(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        let targetGroup;
        if (target.userId) {
            targetGroup = 'user';
        } else if (target.role) {
            targetGroup = 'role';
        } else {
            targetGroup = 'all';
        }
        const payload = {
            message,
            targetGroup,
            userId: target.userId || undefined,
            role: target.role || undefined,
            ttlMinutes: totalTtlMinutes
        };
        if (sendOption === 'schedule') {
             if (calculatedSendTime <= new Date()) {
                setStatus({ type: 'error', message: 'Scheduled time must be in the future.' });
                setLoading(false);
                return;
            }
            payload.sendAt = calculatedSendTime.toISOString();
        }
        try {
            await api.post('/notifications', payload);
            setStatus({ type: 'success', message: sendOption === 'now' ? 'Notification sent successfully!' : 'Notification scheduled successfully!' });
            setMessage('');
            setTarget({ userId: '', role: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to send notification.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen flex justify-center font-body">
            <div className="w-full max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-primaryDark mb-6 border-b-2 border-primary pb-2 text-center">
                    Send Notification
                </h2>
                <div className="bg-card p-6 rounded-2xl shadow-soft">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Message Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Message</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" placeholder="Enter the message content..." required />
                        </div>

                        {/* Scheduling UI */}
                        <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                             <label className="text-base font-semibold text-gray-800 mb-3 flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" /> Sending Options</label>
                             <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                                 <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" value="now" checked={sendOption === 'now'} onChange={(e) => setSendOption(e.target.value)} /><span>Send Now</span></label>
                                 <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" value="schedule" checked={sendOption === 'schedule'} onChange={(e) => setSendOption(e.target.value)} /><span>Schedule for Later</span></label>
                             </div>
                            <AnimatePresence>
                                {sendOption === 'schedule' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2">
                                        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                            <div><label className="block text-xs font-medium text-gray-600">Days</label><input type="number" name="days" min="0" value={scheduleDelay.days} onChange={handleDelayChange} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600">Hours</label><input type="number" name="hours" min="0" max="23" value={scheduleDelay.hours} onChange={handleDelayChange} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600">Minutes</label><input type="number" name="minutes" min="0" max="59" value={scheduleDelay.minutes} onChange={handleDelayChange} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                        </div>
                                        <div className="mt-2 text-xs text-blue-600 text-center">Will be sent on: {calculatedSendTime.toLocaleString('en-GB')}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* TTL Inputs */}
                        <div className="p-4 border border-pink-100 bg-pink-50 rounded-lg">
                            <label className="text-base font-semibold text-gray-800 mb-3 flex items-center"><FaClock className="mr-2 text-pink-500" /> Disappears After (TTL)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><label className="text-xs font-medium text-gray-600 block mb-1">Days</label><input type="number" name="days" value={ttl.days} onChange={handleTtlChange} min="0" className="w-full p-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-xs font-medium text-gray-600 block mb-1">Hours</label><input type="number" name="hours" value={ttl.hours} onChange={handleTtlChange} min="0" className="w-full p-2 border rounded-lg text-sm" /></div>
                                <div><label className="text-xs font-medium text-gray-600 block mb-1">Minutes</label><input type="number" name="minutes" value={ttl.minutes} onChange={handleTtlChange} min="0" className="w-full p-2 border rounded-lg text-sm" /></div>
                            </div>
                        </div>

                        {/* Target Inputs */}
                         <div>
                            <label className="block text-base font-semibold text-primaryDark font-heading mb-2">Target Audience</label>
                            <p className="text-xs text-gray-500 mb-3">Leave both fields blank to send to **all admins** by default.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specific User ID</label>
                                    <input type="text" value={target.userId} onChange={(e) => setTarget({role: '', userId: e.target.value})} className="mt-1 w-full p-2 border rounded-lg" placeholder="User ID (overrides role)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specific Role</label>
                                    <select value={target.role} onChange={(e) => setTarget({userId: '', role: e.target.value})} className="mt-1 w-full p-2 border rounded-lg">
                                        <option value="">Select a Role</option>
                                        {roles.map(role => (<option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>))}
                                    </select>
                                </div>
                            </div>
                         </div>

                        {status && (
                            <div className={`text-center py-3 rounded-lg font-medium shadow-sm flex items-center justify-center space-x-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status.type === 'error' && <FaExclamationCircle />}<span>{status.message}</span>
                            </div>
                        )}
                        
                        <Button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-lg">
                            {loading ? 'Processing...' : <><FaPaperPlane className="inline mr-2" /> {sendOption === 'now' ? 'Send Notification' : 'Schedule Notification'}</>}
                        </Button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default SendNotification;