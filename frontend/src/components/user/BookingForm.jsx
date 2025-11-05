// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import Button from '../common/Button.jsx';
// import { FaUserPlus, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt, FaEnvelope, FaUniversity, FaUsers, FaPen } from 'react-icons/fa';

// const ThemedInput = ({ label, name, value, onChange, required, type = "text", icon, min, max, colSpan = "", pattern, title, maxLength }) => (
//     <div className={colSpan}>
//         <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
//             {icon && <span className="mr-2 text-primary">{icon}</span>}
//             {label}
//             {required && <span className="ml-1 text-highlight">*</span>}
//         </label>
//         <input 
//             type={type} 
//             name={name} 
//             value={value} 
//             onChange={onChange} 
//             className="mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" 
//             required={required} 
//             min={min} 
//             max={max}
//             pattern={pattern}
//             title={title}
//             maxLength={maxLength}
//         />
//     </div>
// );

// const InputGroup = ({ label, name, value, onChange }) => (
//     <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//         <input 
//             type="number" 
//             name={name} 
//             value={value} 
//             onChange={onChange} 
//             className="w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" 
//             min="0" 
//         />
//     </div>
// );

// const BookingForm = ({ onSubmit, loading, error, initialData = null, isEditing = false }) => {
//     const [formData, setFormData] = useState({
//         numMales: 0, numFemales: 0, numBoys: 0, numGirls: 0, people: [],
//         stayFrom: '', stayTo: '', ashramName: '', email: '', address: '', city: '',
//         contactNumber: '', fillingForOthers: false, baijiMahatmaJi: '', baijiContact: '', notes: ''
//     });
    
//     const [validationError, setValidationError] = useState(null);

//     useEffect(() => {
//         if (initialData) {
//             const people = initialData.people || [];
//             setFormData({
//                 ...initialData,
//                 numMales: people.filter(p => p.gender === 'male').length,
//                 numFemales: people.filter(p => p.gender === 'female').length,
//                 numBoys: people.filter(p => p.gender === 'boy').length,
//                 numGirls: people.filter(p => p.gender === 'girl').length,
//                 stayFrom: initialData.stayFrom ? new Date(initialData.stayFrom).toISOString().split('T')[0] : '',
//                 stayTo: initialData.stayTo ? new Date(initialData.stayTo).toISOString().split('T')[0] : '',
//             });
//         }
//     }, [initialData]);

//     useEffect(() => {
//         if (isEditing) return; 
//         const genderCounts = { 'male': formData.numMales, 'female': formData.numFemales, 'boy': formData.numBoys, 'girl': formData.numGirls };
//         let newPeopleArray = [];
//         for (const gender of ['male', 'female', 'boy', 'girl']) {
//             const currentCount = formData.people.filter(p => p.gender === gender).length;
//             const targetCount = genderCounts[gender];
//             let existingPeopleOfGender = formData.people.filter(p => p.gender === gender);
//             if (targetCount > currentCount) {
//                 for (let i = 0; i < targetCount - currentCount; i++) {
//                     existingPeopleOfGender.push({ name: '', age: '', gender: gender });
//                 }
//             } else if (targetCount < currentCount) {
//                 existingPeopleOfGender = existingPeopleOfGender.slice(0, targetCount);
//             }
//             newPeopleArray = [...newPeopleArray, ...existingPeopleOfGender];
//         }
//         setFormData(prev => ({ ...prev, people: newPeopleArray }));
//     }, [formData.numMales, formData.numFemales, formData.numBoys, formData.numGirls, isEditing]);

//     const handleGroupChange = (e) => {
//         const { name, value } = e.target;
//         const numValue = parseInt(value, 10);
//         setFormData(prev => ({ ...prev, [name]: numValue >= 0 ? numValue : 0 }));
//     };
    
//     const handlePersonChange = (e, index) => {
//         const { name, value } = e.target;
//         const newPeople = [...formData.people];
//         newPeople[index] = { ...newPeople[index], [name]: value };
//         setFormData(prev => ({ ...prev, people: newPeople }));
//     };

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

//         if (name === 'stayFrom') {
//             if (!newFormData.stayTo || new Date(value) > new Date(newFormData.stayTo)) {
//                 newFormData.stayTo = value;
//             }
//         }

//         if (name === 'contactNumber' || name === 'baijiContact') {
//             const numericValue = value.replace(/[^0-9]/g, '');
//             newFormData[name] = numericValue;
//         }

//         setFormData(newFormData);
//     };

//     const handleRadioChange = (e) => {
//         setFormData(prev => ({ ...prev, fillingForOthers: e.target.value === 'true' }));
//     };
    
//     const renderPersonInputs = (gender) => {
//         return formData.people
//             .map((person, index) => ({ person, originalIndex: index }))
//             .filter(({ person }) => person.gender === gender)
//             .map(({ person, originalIndex }, genderIndex) => (
//                 <div key={originalIndex} className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-background pb-4 last:border-b-0">
//                     <h4 className="col-span-2 font-bold capitalize text-primaryDark">{gender} #{genderIndex + 1}</h4>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-600">Name</label>
//                         <input type="text" name="name" value={person.name} onChange={(e) => handlePersonChange(e, originalIndex)} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary" required />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-medium text-gray-600">Age</label>
//                         <input type="number" name="age" value={person.age} onChange={(e) => handlePersonChange(e, originalIndex)} className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary" required min="1"/>
//                     </div>
//                 </div>
//             ));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setValidationError(null);

//         const totalPeople = formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls;
//         if (totalPeople === 0) {
//             setValidationError("You must add at least one person to the booking request.");
//             return;
//         }

//         const ageValidationError = formData.people.find(p => (p.gender === 'boy' || p.gender === 'girl') && parseInt(p.age, 10) > 16);
//         if (ageValidationError) {
//             setValidationError(`Age for ${ageValidationError.name} (${ageValidationError.gender}) is over 16. Please classify as Male or Female.`);
//             return;
//         }

//         if (!formData.baijiMahatmaJi || !formData.baijiContact) {
//             setValidationError("Baiji / Mahatma Ji's name and contact are mandatory fields.");
//             return;
//         }
    
//         if (formData.contactNumber.length !== 10) {
//             setValidationError("Please enter a valid 10-digit contact number.");
//             return;
//         }
    
//         if (formData.baijiContact.length !== 10) {
//             setValidationError("Please enter a valid 10-digit contact number for Baiji / Mahatma Ji.");
//             return;
//         }

//         const { numMales, numFemales, numBoys, numGirls, ...submissionData } = formData;
//         onSubmit(submissionData);
//     };

//     return (
//         <div className="bg-neutral p-4 md:p-8 min-h-screen font-body">
//             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 bg-card rounded-2xl shadow-soft max-w-2xl w-full mx-auto">
//                 <h2 className="text-3xl font-bold font-heading mb-8 text-center text-primaryDark border-b-2 border-background pb-3">
//                     {isEditing ? 'Edit Your Booking' : 'Request Accommodation'}
//                 </h2>
                
//                 <form onSubmit={handleSubmit} className="space-y-8">
//                     <div>
//                         <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Period of Stay</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <ThemedInput label="From" name="stayFrom" value={formData.stayFrom} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} max={formData.stayTo} />
//                             <ThemedInput label="To" name="stayTo" value={formData.stayTo} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} min={formData.stayFrom} />
//                         </div>
//                     </div>

//                     <div>
//                         <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Ashram & Reference Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <ThemedInput label="Ashram Name" name="ashramName" value={formData.ashramName} onChange={handleChange} required icon={<FaUniversity />} colSpan="md:col-span-2" />
//                             <ThemedInput label="Baiji / Mahatma Ji Name" name="baijiMahatmaJi" value={formData.baijiMahatmaJi} onChange={handleChange} required={true} />
//                             <ThemedInput 
//                                 label="Baiji / Mahatma Ji Contact" 
//                                 name="baijiContact" 
//                                 value={formData.baijiContact} 
//                                 onChange={handleChange} 
//                                 required={true} 
//                                 type="tel"
//                                 pattern="[0-9]{10}"
//                                 title="Please enter a 10-digit mobile number."
//                                 maxLength="10" 
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Your Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <ThemedInput label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} />
//                             <ThemedInput 
//                                 label="Contact Number" 
//                                 name="contactNumber" 
//                                 type="tel" 
//                                 value={formData.contactNumber} 
//                                 onChange={handleChange} 
//                                 required 
//                                 icon={<FaPhoneAlt />} 
//                                 pattern="[0-9]{10}" 
//                                 title="Please enter a 10-digit mobile number."
//                                 maxLength="10" 
//                             />
//                             <ThemedInput label="Address" name="address" value={formData.address} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
//                             <ThemedInput label="City" name="city" value={formData.city} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Group Details</h3>
//                         <div className="space-y-6">
//                             <div className="p-4 border border-background bg-background/50 rounded-lg">
//                                 <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                                     <FaUsers className="mr-2 text-primary" /> Are you filling this form for others?
//                                 </label>
//                                 <div className="flex items-center space-x-6">
//                                     <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="true" checked={formData.fillingForOthers === true} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary focus:ring-primary" /><span className="ml-2 text-gray-700">Yes</span></label>
//                                     <label className="flex items-center cursor-pointer"><input type="radio" name="fillingForOthers" value="false" checked={formData.fillingForOthers === false} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary focus:ring-primary" /><span className="ml-2 text-gray-700">No</span></label>
//                                 </div>
//                             </div>
//                             <div className="p-4 border border-primary/20 bg-primary/10 rounded-lg shadow-inner">
//                                 <label className="text-base font-semibold text-primaryDark flex items-center mb-3"><FaUserPlus className="mr-2 text-primary" /> Member Details</label>
//                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                                     <InputGroup label="Males" name="numMales" value={formData.numMales} onChange={handleGroupChange} />
//                                     <InputGroup label="Females" name="numFemales" value={formData.numFemales} onChange={handleGroupChange} />
//                                     <InputGroup label="Boys" name="numBoys" value={formData.numBoys} onChange={handleGroupChange} />
//                                     <InputGroup label="Girls" name="numGirls" value={formData.numGirls} onChange={handleGroupChange} />
//                                 </div>
//                             </div>
//                             {formData.people.length > 0 && (
//                                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {renderPersonInputs('male')}
//                                     {renderPersonInputs('female')}
//                                     {renderPersonInputs('boy')}
//                                     {renderPersonInputs('girl')}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
                    
//                     <div>
//                         <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">Additional Information</h3>
//                         <div>
//                             <label className="text-sm font-medium text-gray-700 flex items-center mb-1"><FaPen className="mr-2 text-primary"/> Special Requests / Notes</label>
//                             <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm" />
//                         </div>
//                     </div>
                    
//                     {validationError && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{validationError}</p>}
//                     {error && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}
                    
//                     <div className="pt-4">
//                         <Button type="submit" className="w-full text-lg py-3 shadow-soft bg-highlight hover:bg-primaryDark" disabled={loading}>
//                             {loading ? 'Submitting...' : (isEditing ? 'Update Booking' : 'Submit Request')}
//                         </Button>
//                     </div>
//                 </form>
//             </motion.div>
//         </div>
//     );
// };

// export default BookingForm;




import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../common/Button.jsx";
import {
  FaUserPlus,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaUniversity,
  FaUsers,
  FaPen,
} from "react-icons/fa";
import { useParams } from "react-router-dom";

const ThemedInput = ({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  icon,
  min,
  max,
  colSpan = "",
  pattern,
  title,
  maxLength,
}) => (
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
      pattern={pattern}
      title={title}
      maxLength={maxLength}
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

const BookingForm = ({ onSubmit, loading, error, initialData = null, isEditing = false }) => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    numMales: 0,
    numFemales: 0,
    numBoys: 0,
    numGirls: 0,
    people: [],
    stayFrom: "",
    stayTo: "",
    ashramName: "",
    email: "",
    address: "",
    city: "",
    contactNumber: "",
    fillingForOthers: false,
    baijiMahatmaJi: "",
    baijiContact: "",
    notes: "",
  });
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        setEvent(null);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (!event) return;
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const minStayDate = new Date(start);
    minStayDate.setDate(minStayDate.getDate() - 5);
    const maxStayDate = new Date(end);
    maxStayDate.setDate(maxStayDate.getDate() + 5);
    setFormData(prev => ({
      ...prev,
      stayFrom: prev.stayFrom || minStayDate.toISOString().split("T")[0],
      stayTo: prev.stayTo || maxStayDate.toISOString().split("T")[0],
    }));
  }, [event]);

  useEffect(() => {
    if (isEditing) return;
    const genderCounts = {
      male: formData.numMales,
      female: formData.numFemales,
      boy: formData.numBoys,
      girl: formData.numGirls,
    };
    let newPeopleArray = [];
    for (const gender of ["male", "female", "boy", "girl"]) {
      const currentCount = formData.people.filter(p => p.gender === gender).length;
      const targetCount = genderCounts[gender];
      let existingPeople = formData.people.filter(p => p.gender === gender);
      if (targetCount > currentCount) {
        for (let i = 0; i < targetCount - currentCount; i++) {
          existingPeople.push({ name: "", age: "", gender });
        }
      } else if (targetCount < currentCount) {
        existingPeople = existingPeople.slice(0, targetCount);
      }
      newPeopleArray = [...newPeopleArray, ...existingPeople];
    }
    setFormData(prev => ({ ...prev, people: newPeopleArray }));
  }, [formData.numMales, formData.numFemales, formData.numBoys, formData.numGirls, isEditing]);

  const handleGroupChange = e => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    setFormData(prev => ({ ...prev, [name]: numValue >= 0 ? numValue : 0 }));
  };

  const handlePersonChange = (e, index) => {
    const { name, value } = e.target;
    const newPeople = [...formData.people];
    newPeople[index] = { ...newPeople[index], [name]: value };
    setFormData(prev => ({ ...prev, people: newPeople }));
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newFormData = { ...formData, [name]: type === "checkbox" ? checked : value };
    if (name === "stayFrom") {
      if (!newFormData.stayTo || new Date(value) > new Date(newFormData.stayTo)) {
        newFormData.stayTo = value;
      }
    }
    if (name === "contactNumber" || name === "baijiContact") {
      const numericValue = value.replace(/[^0-9]/g, "");
      newFormData[name] = numericValue;
    }
    setFormData(newFormData);
  };

  const handleRadioChange = e => {
    setFormData(prev => ({ ...prev, fillingForOthers: e.target.value === "true" }));
  };

  const renderPersonInputs = gender =>
    formData.people
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.gender === gender)
      .map(({ p, i }, idx) => (
        <div key={i} className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-background pb-4 last:border-b-0">
          <h4 className="col-span-2 font-bold capitalize text-primaryDark">
            {gender} #{idx + 1}
          </h4>
          <div>
            <label className="block text-xs font-medium text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              value={p.name}
              onChange={e => handlePersonChange(e, i)}
              className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Age</label>
            <input
              type="number"
              name="age"
              value={p.age}
              onChange={e => handlePersonChange(e, i)}
              className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary"
              required
              min="1"
            />
          </div>
        </div>
      ));

  const handleSubmit = e => {
    e.preventDefault();
    setValidationError(null);
    const total = formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls;
    if (total === 0) return setValidationError("You must add at least one person.");
    const invalid = formData.people.find(
      p => (p.gender === "boy" || p.gender === "girl") && parseInt(p.age, 10) > 16
    );
    if (invalid)
      return setValidationError(`Age for ${invalid.name} (${invalid.gender}) is over 16.`);
    if (!formData.baijiMahatmaJi || !formData.baijiContact)
      return setValidationError("Baiji / Mahatma Ji's name and contact are mandatory.");
    if (formData.contactNumber.length !== 10)
      return setValidationError("Please enter a valid 10-digit contact number.");
    if (formData.baijiContact.length !== 10)
      return setValidationError("Please enter a valid 10-digit Baiji / Mahatma Ji contact number.");
    const fromDate = new Date(formData.stayFrom);
    const toDate = new Date(formData.stayTo);
    if (fromDate > toDate)
      return setValidationError("Stay 'From' date cannot be after 'To' date.");
    const { numMales, numFemales, numBoys, numGirls, ...data } = formData;
    onSubmit(data);
  };

  if (!event) return <p className="text-center text-red-500 mt-10">Event not found.</p>;

  const minStayDate = new Date(event.startDate);
  minStayDate.setDate(minStayDate.getDate() - 5);
  const maxStayDate = new Date(event.endDate);
  maxStayDate.setDate(maxStayDate.getDate() + 5);

  return (
    <div className="bg-neutral p-4 md:p-8 min-h-screen font-body">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 bg-card rounded-2xl shadow-soft max-w-2xl w-full mx-auto"
      >
        <h2 className="text-3xl font-bold font-heading mb-8 text-center text-primaryDark border-b-2 border-background pb-3">
          {isEditing ? "Edit Your Booking" : `Request Accommodation for ${event.name}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">
              Period of Stay
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label="From"
                name="stayFrom"
                value={formData.stayFrom}
                onChange={handleChange}
                required
                type="date"
                icon={<FaCalendarAlt />}
                min={minStayDate.toISOString().split("T")[0]}
                max={maxStayDate.toISOString().split("T")[0]}
              />
              <ThemedInput
                label="To"
                name="stayTo"
                value={formData.stayTo}
                onChange={handleChange}
                required
                type="date"
                icon={<FaCalendarAlt />}
                min={formData.stayFrom || minStayDate.toISOString().split("T")[0]}
                max={maxStayDate.toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">
              Ashram & Reference Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label="Ashram Name"
                name="ashramName"
                value={formData.ashramName}
                onChange={handleChange}
                required
                icon={<FaUniversity />}
                colSpan="md:col-span-2"
              />
              <ThemedInput
                label="Baiji / Mahatma Ji Name"
                name="baijiMahatmaJi"
                value={formData.baijiMahatmaJi}
                onChange={handleChange}
                required
              />
              <ThemedInput
                label="Baiji / Mahatma Ji Contact"
                name="baijiContact"
                value={formData.baijiContact}
                onChange={handleChange}
                required
                type="tel"
                pattern="[0-9]{10}"
                title="Please enter a 10-digit mobile number."
                maxLength="10"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">
              Your Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label="Email (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={<FaEnvelope />}
              />
              <ThemedInput
                label="Contact Number"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                icon={<FaPhoneAlt />}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit mobile number."
                maxLength="10"
              />
              <ThemedInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                icon={<FaMapMarkerAlt />}
                colSpan="md:col-span-2"
              />
              <ThemedInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                icon={<FaMapMarkerAlt />}
                colSpan="md:col-span-2"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">
              Group Details
            </h3>
            <div className="space-y-6">
              <div className="p-4 border border-background bg-background/50 rounded-lg">
                <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <FaUsers className="mr-2 text-primary" /> Are you filling this form for others?
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="fillingForOthers"
                      value="true"
                      checked={formData.fillingForOthers === true}
                      onChange={handleRadioChange}
                      className="form-radio h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="fillingForOthers"
                      value="false"
                      checked={formData.fillingForOthers === false}
                      onChange={handleRadioChange}
                      className="form-radio h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              <div className="p-4 border border-primary/20 bg-primary/10 rounded-lg shadow-inner">
                <label className="text-base font-semibold text-primaryDark flex items-center mb-3">
                  <FaUserPlus className="mr-2 text-primary" /> Member Details
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputGroup label="Males" name="numMales" value={formData.numMales} onChange={handleGroupChange} />
                  <InputGroup label="Females" name="numFemales" value={formData.numFemales} onChange={handleGroupChange} />
                  <InputGroup label="Boys" name="numBoys" value={formData.numBoys} onChange={handleGroupChange} />
                  <InputGroup label="Girls" name="numGirls" value={formData.numGirls} onChange={handleGroupChange} />
                </div>
              </div>
              {formData.people.length > 0 && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderPersonInputs("male")}
                  {renderPersonInputs("female")}
                  {renderPersonInputs("boy")}
                  {renderPersonInputs("girl")}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">
              Additional Information
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FaPen className="mr-2 text-primary" /> Special Requests / Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm"
              />
            </div>
          </div>

          {validationError && (
            <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">
              {validationError}
            </p>
          )}
          {error && (
            <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </p>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full text-lg py-3 shadow-soft bg-highlight hover:bg-primaryDark"
              disabled={loading}
            >
              {loading ? "Submitting..." : isEditing ? "Update Booking" : "Submit Request"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingForm;
