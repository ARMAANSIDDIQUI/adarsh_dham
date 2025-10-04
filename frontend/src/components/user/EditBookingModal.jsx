import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaUserPlus, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt, FaEnvelope, FaUniversity, FaUsers, FaPen, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../../api/api.js';

// Replicating the input components here for a self-contained modal
const ThemedInput = ({ label, name, value, onChange, required, type = "text", icon, min, max, colSpan = "" }) => (
    <div className={colSpan}>
        <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            {icon && <span className="mr-2 text-primary">{icon}</span>}
            {label}
            {required && <span className="ml-1 text-highlight">*</span>}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" 
            required={required} 
            min={min} 
            max={max}
        />
    </div>
);

const InputGroup = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type="number" 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" 
            min="0" 
        />
    </div>
);

// The core modal component with integrated form logic
const EditBookingModal = ({ booking, onClose, onUpdate }) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState(null);

    const [formData, setFormData] = useState({
        numMales: 0, numFemales: 0, numBoys: 0, numGirls: 0, people: [],
        stayFrom: '', stayTo: '', ashramName: '', email: '', address: '', city: '',
        contactNumber: '', fillingForOthers: false, baijiMahatmaJi: '', baijiContact: '', notes: ''
    });

    // Initial data sync for the modal
    useEffect(() => {
        if (booking) {
            const people = booking.formData.people || [];
            setFormData({
                ...booking.formData,
                numMales: people.filter(p => p.gender === 'male').length,
                numFemales: people.filter(p => p.gender === 'female').length,
                numBoys: people.filter(p => p.gender === 'boy').length,
                numGirls: people.filter(p => p.gender === 'girl').length,
                people: people,
                stayFrom: booking.formData.stayFrom ? new Date(booking.formData.stayFrom).toISOString().split('T')[0] : '',
                stayTo: booking.formData.stayTo ? new Date(booking.formData.stayTo).toISOString().split('T')[0] : '',
            });
        }
    }, [booking]);

    // Handle changes to member counts and update the people array
    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseInt(value, 10);
        const newCount = numValue >= 0 ? numValue : 0;

        setFormData(prev => {
            const newCounts = { ...prev, [name]: newCount };
            
            const genderMap = {
                'numMales': 'male',
                'numFemales': 'female',
                'numBoys': 'boy',
                'numGirls': 'girl',
            };
            const currentGender = genderMap[name];
            
            const existingPeopleOfGender = prev.people.filter(p => p.gender === currentGender);
            const updatedPeopleOfGender = Array.from({ length: newCount }, (_, i) => existingPeopleOfGender[i] || { name: '', age: '', gender: currentGender });

            const otherPeople = prev.people.filter(p => p.gender !== currentGender);
            const newPeopleArray = [...otherPeople, ...updatedPeopleOfGender];

            return {
                ...newCounts,
                people: newPeopleArray,
            };
        });
    };

    const handlePersonChange = (e, index) => {
        const { name, value } = e.target;
        const newPeople = [...formData.people];
        newPeople[index] = { ...newPeople[index], [name]: value };
        setFormData(prev => ({ ...prev, people: newPeople }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

        if (name === 'stayFrom') {
            if (!newFormData.stayTo || new Date(value) > new Date(newFormData.stayTo)) {
                newFormData.stayTo = value; 
            }
        }
        setFormData(newFormData);
    };

    const handleRadioChange = (e) => {
        setFormData(prev => ({ ...prev, fillingForOthers: e.target.value === 'true' }));
    };
    
    const renderPersonInputs = (gender) => {
        return formData.people
            .map((person, index) => ({ person, originalIndex: index }))
            .filter(({ person }) => person.gender === gender)
            .map(({ person, originalIndex }, genderIndex) => (
                <div key={originalIndex} className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-background pb-4 last:border-b-0">
                    <h4 className="col-span-2 font-bold capitalize text-primaryDark">{gender} #{genderIndex + 1}</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Name</label>
                        <input type="text" name="name" value={person.name} onChange={(e) => handlePersonChange(e, originalIndex)} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Age</label>
                        <input type="number" name="age" value={person.age} onChange={(e) => handlePersonChange(e, originalIndex)} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary" required min="1"/>
                    </div>
                </div>
            ));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setValidationError(null);
        setError('');

        const ageValidationError = formData.people.find(p => (p.gender === 'boy' || p.gender === 'girl') && parseInt(p.age, 10) > 16);
        if (ageValidationError) {
            setValidationError(`Age for ${ageValidationError.name} (${ageValidationError.gender}) is over 16. Please classify as Male or Female.`);
            return;
        }

        setSubmitLoading(true);
        try {
            const { numMales, numFemales, numBoys, numGirls, ...submissionData } = formData;
            await api.put(`/bookings/update/${booking._id}`, { formData: submissionData });
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking.');
        } finally {
            setSubmitLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] p-4 font-body">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-soft"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-primaryDark hover:text-accent z-10">
                    <FaTimesCircle size={24} />
                </button>
                <div className="overflow-y-auto p-6">
                    <h2 className="text-3xl font-bold font-heading mb-8 text-center text-primaryDark border-b-2 border-background pb-3">
                        Edit Your Booking
                    </h2>
                    <form onSubmit={handleUpdateSubmit} className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Period of Stay</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ThemedInput label="From" name="stayFrom" value={formData.stayFrom} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} max={formData.stayTo} />
                                <ThemedInput label="To" name="stayTo" value={formData.stayTo} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} min={formData.stayFrom} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Ashram & Reference Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ThemedInput label="Ashram Name" name="ashramName" value={formData.ashramName} onChange={handleChange} required icon={<FaUniversity />} colSpan="md:col-span-2" />
                                <ThemedInput label="Baiji / Mahatma Ji Name (Optional)" name="baijiMahatmaJi" value={formData.baijiMahatmaJi} onChange={handleChange} />
                                <ThemedInput label="Baiji / Mahatma Ji Contact (Optional)" name="baijiContact" value={formData.baijiContact} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Your Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ThemedInput label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} />
                                <ThemedInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required icon={<FaPhoneAlt />} />
                                <ThemedInput label="Address" name="address" value={formData.address} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
                                <ThemedInput label="City" name="city" value={formData.city} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Group Details</h3>
                            <div className="space-y-6">
                                <div className="p-4 border border-background bg-background/50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                        <FaUsers className="mr-2 text-primary" /> Are you filling this form for others?
                                    </label>
                                    <div className="flex items-center space-x-6">
                                        <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="true" checked={formData.fillingForOthers === true} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary focus:ring-primary" /><span className="ml-2 text-gray-700">Yes</span></label>
                                        <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="false" checked={formData.fillingForOthers === false} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary focus:ring-primary" /><span className="ml-2 text-gray-700">No</span></label>
                                    </div>
                                </div>
                                <div className="p-4 border border-primary/20 bg-primary/10 rounded-lg shadow-inner">
                                    <label className="text-base font-semibold text-primaryDark flex items-center mb-3"><FaUserPlus className="mr-2 text-primary" /> Member Details</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <InputGroup label="Males" name="numMales" value={formData.numMales} onChange={handleGroupChange} />
                                        <InputGroup label="Females" name="numFemales" value={formData.numFemales} onChange={handleGroupChange} />
                                        <InputGroup label="Boys" name="numBoys" value={formData.numBoys} onChange={handleGroupChange} />
                                        <InputGroup label="Girls" name="numGirls" value={formData.numGirls} onChange={handleGroupChange} />
                                    </div>
                                </div>
                                {(formData.numMales > 0 || formData.numFemales > 0 || formData.numBoys > 0 || formData.numGirls > 0) && (
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderPersonInputs('male')}
                                        {renderPersonInputs('female')}
                                        {renderPersonInputs('boy')}
                                        {renderPersonInputs('girl')}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Additional Information</h3>
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center mb-1"><FaPen className="mr-2 text-primary"/> Special Requests / Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" />
                            </div>
                        </div>
                        
                        {validationError && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{validationError}</p>}
                        {error && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}
                        
                        <div className="pt-4">
                            <Button type="submit" className="w-full text-lg py-3 shadow-soft bg-highlight hover:bg-primaryDark" disabled={submitLoading}>
                                {submitLoading ? <FaSpinner className="inline mr-2 animate-spin" /> : 'Update Booking'}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EditBookingModal;