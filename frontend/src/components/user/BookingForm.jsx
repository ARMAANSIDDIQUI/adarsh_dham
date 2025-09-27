import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaUserPlus, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt, FaEnvelope, FaUniversity, FaUsers, FaPen } from 'react-icons/fa';

const BookingForm = ({ onSubmit, loading, error, initialData = null, isEditing = false }) => {
    const [formData, setFormData] = useState({
        numMales: 0,
        numFemales: 0,
        numBoys: 0,
        numGirls: 0,
        people: [],
        stayFrom: '',
        stayTo: '',
        ashramName: '',
        email: '',
        address: '',
        city: '',
        contactNumber: '',
        fillingForOthers: false,
        baijiMahatmaJi: '',
        baijiContact: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            const people = initialData.people || [];
            setFormData({
                ...initialData,
                numMales: people.filter(p => p.gender === 'male').length,
                numFemales: people.filter(p => p.gender === 'female').length,
                numBoys: people.filter(p => p.gender === 'boy').length,
                numGirls: people.filter(p => p.gender === 'girl').length,
                stayFrom: initialData.stayFrom ? new Date(initialData.stayFrom).toISOString().split('T')[0] : '',
                stayTo: initialData.stayTo ? new Date(initialData.stayTo).toISOString().split('T')[0] : '',
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (isEditing) return; 

        const genderCounts = {
            'male': formData.numMales,
            'female': formData.numFemales,
            'boy': formData.numBoys,
            'girl': formData.numGirls,
        };

        let newPeopleArray = [];
        for (const gender of ['male', 'female', 'boy', 'girl']) {
            const currentCount = formData.people.filter(p => p.gender === gender).length;
            const targetCount = genderCounts[gender];
            let existingPeopleOfGender = formData.people.filter(p => p.gender === gender);

            if (targetCount > currentCount) {
                for (let i = 0; i < targetCount - currentCount; i++) {
                    existingPeopleOfGender.push({ name: '', age: '', gender: gender });
                }
            } else if (targetCount < currentCount) {
                existingPeopleOfGender = existingPeopleOfGender.slice(0, targetCount);
            }
            newPeopleArray = [...newPeopleArray, ...existingPeopleOfGender];
        }
        setFormData(prev => ({ ...prev, people: newPeopleArray }));

    }, [formData.numMales, formData.numFemales, formData.numBoys, formData.numGirls, isEditing]);

    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseInt(value, 10);
        setFormData(prev => ({
            ...prev,
            [name]: numValue >= 0 ? numValue : 0,
        }));
    };
    
    const handlePersonChange = (e, index) => {
        const { name, value } = e.target;
        const newPeople = [...formData.people];
        newPeople[index] = { ...newPeople[index], [name]: value };
        setFormData(prev => ({ ...prev, people: newPeople }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRadioChange = (e) => {
        setFormData(prev => ({
            ...prev,
            fillingForOthers: e.target.value === 'true'
        }));
    };
    
    const renderPersonInputs = (gender) => {
        return formData.people
            .map((person, index) => ({ person, originalIndex: index }))
            .filter(({ person }) => person.gender === gender)
            .map(({ person, originalIndex }, genderIndex) => (
                <div 
                    key={originalIndex} 
                    className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-pink-100 pb-4 last:border-b-0"
                >
                    <h4 className="col-span-2 font-bold capitalize text-gray-700">{gender} #{genderIndex + 1}</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={person.name}
                            onChange={(e) => handlePersonChange(e, originalIndex)} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Age</label>
                        <input 
                            type="number" 
                            name="age" 
                            value={person.age}
                            onChange={(e) => handlePersonChange(e, originalIndex)} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm" 
                            required 
                            min="1"
                        />
                    </div>
                </div>
            ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { numMales, numFemales, numBoys, numGirls, ...submissionData } = formData;
        onSubmit(submissionData);
    };

    return (
        <div className="bg-gray-100 p-4 md:p-8 min-h-screen">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-6 md:p-8 bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto"
            >
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b-2 border-pink-400 pb-3">
                    {isEditing ? 'Edit Your Booking' : 'Request Accommodation'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Period of Stay</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ThemedInput label="From" name="stayFrom" value={formData.stayFrom} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} />
                            <ThemedInput label="To" name="stayTo" value={formData.stayTo} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Ashram & Reference Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ThemedInput label="Ashram Name" name="ashramName" value={formData.ashramName} onChange={handleChange} required icon={<FaUniversity />} colSpan="md:col-span-2" />
                            <ThemedInput label="Baiji / Mahatma Ji Name (Optional)" name="baijiMahatmaJi" value={formData.baijiMahatmaJi} onChange={handleChange} />
                            <ThemedInput label="Baiji / Mahatma Ji Contact (Optional)" name="baijiContact" value={formData.baijiContact} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Your Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ThemedInput label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} />
                            <ThemedInput label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required icon={<FaPhoneAlt />} />
                            <ThemedInput label="Address" name="address" value={formData.address} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
                            <ThemedInput label="City" name="city" value={formData.city} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Group Details</h3>
                        <div className="space-y-6">
                            <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                                <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                    <FaUsers className="mr-2 text-pink-500" /> Are you filling this form for others?
                                </label>
                                <div className="flex items-center space-x-6">
                                    <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="true" checked={formData.fillingForOthers === true} onChange={handleRadioChange} className="form-radio h-4 w-4 text-pink-600" /><span className="ml-2 text-gray-700">Yes</span></label>
                                    <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="false" checked={formData.fillingForOthers === false} onChange={handleRadioChange} className="form-radio h-4 w-4 text-pink-600" /><span className="ml-2 text-gray-700">No</span></label>
                                </div>
                            </div>
                            <div className="p-4 border border-pink-100 bg-pink-50 rounded-lg shadow-inner">
                                <label className="text-base font-semibold text-gray-800 flex items-center mb-3"><FaUserPlus className="mr-2 text-pink-500" /> Member Details</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InputGroup label="Males" name="numMales" value={formData.numMales} onChange={handleGroupChange} />
                                    <InputGroup label="Females" name="numFemales" value={formData.numFemales} onChange={handleGroupChange} />
                                    <InputGroup label="Boys" name="numBoys" value={formData.numBoys} onChange={handleGroupChange} />
                                    <InputGroup label="Girls" name="numGirls" value={formData.numGirls} onChange={handleGroupChange} />
                                </div>
                            </div>
                            {formData.people.length > 0 && (
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
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Additional Information</h3>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center mb-1"><FaPen className="mr-2 text-pink-500"/> Special Requests / Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm" />
                        </div>
                    </div>

                    {error && <p className="text-red-700 bg-red-100/50 border border-red-400 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}
                    
                    <div className="pt-4">
                        <Button type="submit" className="w-full text-lg py-3 shadow-md" disabled={loading}>
                            {loading ? 'Submitting...' : (isEditing ? 'Update Booking' : 'Submit Request')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const InputGroup = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type="number" name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm" min="0" />
    </div>
);

const ThemedInput = ({ label, name, value, onChange, required, type = "text", icon, min, colSpan = "" }) => (
    <div className={colSpan}>
        <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            {icon && <span className="mr-2 text-pink-500">{icon}</span>}
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input type={type} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 shadow-sm" required={required} min={min} />
    </div>
);

export default BookingForm;