import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button.jsx';
import DynamicDateInput from '../common/DynamicDateInput.jsx';
import PhoneInput from '../common/PhoneInput.jsx';
import api from '../../api/api.js';
import { toast } from 'react-toastify';
import { FaTimes, FaCalendarAlt, FaUser, FaSave } from 'react-icons/fa';

const EditBookingModal = ({ isOpen, booking, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [dateLimits, setDateLimits] = useState({ min: '', max: '' });
    const isApproved = booking?.status === 'approved';

    useEffect(() => {
        if (booking) {
            // Calculate date limits from booking.eventId if available
            if (booking.eventId && booking.eventId.startDate && booking.eventId.endDate) {
                const start = new Date(booking.eventId.startDate);
                const end = new Date(booking.eventId.endDate);
                const minD = new Date(start);
                minD.setDate(minD.getDate() - 5);
                const maxD = new Date(end);
                maxD.setDate(maxD.getDate() + 5);
                setDateLimits({
                    min: minD.toISOString().split('T')[0],
                    max: maxD.toISOString().split('T')[0]
                });
            }

            // Ensure default values to prevent uncontrolled input warnings
            setFormData({
                ...booking.formData,
                stayFrom: booking.formData.stayFrom || '',
                stayTo: booking.formData.stayTo || '',
                contactNumber: booking.formData.contactNumber || '',
                ashramName: booking.formData.ashramName || '',
                hasSameStayDuration: booking.formData.hasSameStayDuration ?? true,
                people: (booking.formData.people || []).map(p => ({
                    ...p,
                    name: p.name || '',
                    age: p.age || '',
                    stayFrom: p.stayFrom || '',
                    stayTo: p.stayTo || ''
                }))
            });
        }
    }, [booking]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRemovePerson = (index) => {
        const updatedPeople = formData.people.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, people: updatedPeople }));
    };

    const handleAddPerson = () => {
        if (isApproved) {
            toast.error("You cannot add new guests to an approved booking.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            people: [...(prev.people || []), { name: '', age: '', gender: 'male', stayFrom: prev.stayFrom || '', stayTo: prev.stayTo || '' }]
        }));
    };

    const handlePersonChange = (index, field, value) => {
        const updatedPeople = [...formData.people];
        updatedPeople[index] = { ...updatedPeople[index], [field]: value };

        // Auto-fix stayTo if stayFrom is after it
        if (field === 'stayFrom' && updatedPeople[index].stayTo) {
            if (new Date(value) > new Date(updatedPeople[index].stayTo)) {
                updatedPeople[index].stayTo = value;
            }
        }

        setFormData(prev => ({ ...prev, people: updatedPeople }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Basic validation
            if (formData.hasSameStayDuration) {
                if (!formData.stayFrom || !formData.stayTo) {
                    toast.error("Please specify global stay dates.");
                    setLoading(false);
                    return;
                }
            } else {
                if (!formData.people.every(p => p.stayFrom && p.stayTo)) {
                    toast.error("Please specify stay dates for all members.");
                    setLoading(false);
                    return;
                }
            }

            // Sync dates if needed
            let payload = { ...formData };
            if (payload.hasSameStayDuration) {
                payload.people = payload.people.map(p => ({
                    ...p,
                    stayFrom: payload.stayFrom,
                    stayTo: payload.stayTo
                }));
            } else {
                // Update global dates for index search
                const allStartDates = payload.people.map(p => new Date(p.stayFrom)).filter(d => !isNaN(d));
                const allEndDates = payload.people.map(p => new Date(p.stayTo)).filter(d => !isNaN(d));
                if (allStartDates.length > 0) payload.stayFrom = new Date(Math.min(...allStartDates)).toISOString().split('T')[0];
                if (allEndDates.length > 0) payload.stayTo = new Date(Math.max(...allEndDates)).toISOString().split('T')[0];
            }


            const res = await api.put(`/bookings/update/${booking._id}`, { formData: payload });
            const wasApproved = booking.status === 'approved';
            const successMsg = wasApproved
                ? 'Booking updated. Status remains Approved — allocations preserved.'
                : 'Booking updated successfully!';
            toast.success(successMsg);
            onUpdate(res.data.booking); // Pass back updated booking
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update booking.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1300] p-4 font-body">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                    >
                        <div className="p-6 border-b border-background flex justify-between items-center sticky top-0 bg-card z-10">
                            <h2 className="text-2xl font-bold font-heading text-primaryDark">Edit Booking #{booking.bookingNumber}</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><FaTimes size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Stay Setup */}
                            <div className="bg-background/50 p-4 rounded-xl border border-background">
                                <h3 className="font-semibold text-lg text-primaryDark mb-4 flex items-center"><FaCalendarAlt className="mr-2" /> Stay Configuration</h3>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="editSameDuration"
                                        name="hasSameStayDuration"
                                        checked={formData.hasSameStayDuration || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary mr-2"
                                    />
                                    <label htmlFor="editSameDuration" className="text-gray-700 font-medium select-none cursor-pointer">All members share the same stay duration</label>
                                </div>

                                {formData.hasSameStayDuration && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                        <DynamicDateInput label="Stay From" name="stayFrom" value={formData.stayFrom || ''} onChange={handleChange} required min={dateLimits.min} max={dateLimits.max} />
                                        <DynamicDateInput label="Stay To" name="stayTo" value={formData.stayTo || ''} onChange={handleChange} required min={formData.stayFrom || dateLimits.min} max={dateLimits.max} />
                                    </div>
                                )}
                            </div>

                            {/* Members Editor */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg text-primaryDark flex items-center"><FaUser className="mr-2" /> Member Details</h3>
                                    {!isApproved && (
                                        <button
                                            type="button"
                                            onClick={handleAddPerson}
                                            className="text-xs font-bold text-primary hover:text-primaryDark flex items-center bg-primary/10 px-3 py-1 rounded-full transition-colors"
                                        >
                                            + Add Member
                                        </button>
                                    )}
                                </div>

                                {isApproved && (
                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
                                        <span className="text-xl">⚠️</span>
                                        <p>
                                            <strong>Booking is Approved:</strong> Adding new guests is not allowed.
                                            You can still edit existing details or remove guests. For new guests, please create a separate booking.
                                        </p>
                                    </div>
                                )}

                                {!formData.hasSameStayDuration && (
                                    <p className="text-xs text-gray-500 italic bg-blue-50 p-2 rounded border border-blue-100 mb-2">
                                        Please specify stay dates for each member below.
                                    </p>
                                )}
                                {formData.people && formData.people.map((person, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs font-mono text-gray-400">#{index + 1}</div>
                                            {!isApproved && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePerson(index)}
                                                    className="text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 flex items-center shadow-sm"
                                                    title="Remove this member"
                                                >
                                                    <FaTimes className="mr-1" size={10} /> <span className="text-[10px]">Remove</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-xs text-gray-500 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={person.name || ''}
                                                    onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-xs text-gray-500 mb-1">Age</label>
                                                <input
                                                    type="number"
                                                    value={person.age || ''}
                                                    onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Gender</label>
                                                <select
                                                    value={person.gender || 'male'}
                                                    onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                                                    className="w-full p-2 border rounded-md text-sm capitalize"
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="boy">Boy</option>
                                                    <option value="girl">Girl</option>
                                                </select>
                                            </div>

                                            {!formData.hasSameStayDuration && (
                                                <>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs text-gray-500 mb-1">Stay From</label>
                                                        <input
                                                            type="date"
                                                            value={person.stayFrom ? person.stayFrom.split('T')[0] : (formData.stayFrom || '')}
                                                            onChange={(e) => handlePersonChange(index, 'stayFrom', e.target.value)}
                                                            className="w-full p-2 border rounded-md text-sm"
                                                            required
                                                            min={dateLimits.min}
                                                            max={dateLimits.max}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs text-gray-500 mb-1">Stay To</label>
                                                        <input
                                                            type="date"
                                                            value={person.stayTo ? person.stayTo.split('T')[0] : (formData.stayTo || '')}
                                                            onChange={(e) => handlePersonChange(index, 'stayTo', e.target.value)}
                                                            className="w-full p-2 border rounded-md text-sm"
                                                            required
                                                            min={person.stayFrom || dateLimits.min}
                                                            max={dateLimits.max}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Info (Simplified) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <PhoneInput
                                        label="Phone"
                                        value={formData.contactNumber || ''}
                                        onChange={(val) => setFormData(prev => ({ ...prev, contactNumber: val }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ashram Name</label>
                                    <input type="text" name="ashramName" value={formData.ashramName || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" required />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-4 border-t border-background mt-6">
                                <Button type="button" onClick={onClose} className="text-gray-600 hover:bg-gray-100">Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-primary text-white hover:bg-primaryDark shadow-lg">
                                    {loading ? 'Saving...' : <><FaSave className="mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditBookingModal;
