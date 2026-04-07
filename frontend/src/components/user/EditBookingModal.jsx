import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaUserPlus, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaUniversity, FaUsers, FaPen, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../../api/api.js';
import { toast } from 'react-toastify';
import { useTranslation } from '../../hooks/useTranslation';
import { useGetEventByIdQuery } from '../../redux/api/apiSlice';
import PhoneInput from '../common/PhoneInput.jsx';

const ThemedInput = ({ label, name, value, onChange, required, type = "text", icon, min, max, colSpan = "", maxLength, disabled }) => (
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
      className={`mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
      required={required}
      min={min}
      max={max}
      maxLength={maxLength}
      disabled={disabled}
    />
  </div>
);

const InputGroup = ({ label, name, value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
      min="0"
      disabled={disabled}
    />
  </div>
);

const EditBookingModal = ({ booking, onClose, onUpdate }) => {
  const t = useTranslation();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState(null);
  const { data: event } = useGetEventByIdQuery(booking?.eventId, {
    skip: !booking?.eventId,
  });

  const [formData, setFormData] = useState({
    numMales: 0, numFemales: 0, numBoys: 0, numGirls: 0, people: [],
    stayFrom: '', stayTo: '', ashramName: '', email: '', address: '', city: '',
    contactNumber: '', fillingForOthers: false, baijiMahatmaJi: '', baijiContact: '', notes: ''
  });

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
  }, [booking, booking?.formData, booking?._id]);

  const handleGroupChange = e => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    const newCount = numValue >= 0 ? numValue : 0;
    setFormData(prev => {
      const newCounts = { ...prev, [name]: newCount };
      const genderMap = { numMales: 'male', numFemales: 'female', numBoys: 'boy', numGirls: 'girl' };
      const gender = genderMap[name];
      const existing = prev.people.filter(p => p.gender === gender);
      const updated = Array.from({ length: newCount }, (_, i) => existing[i] || { name: '', age: '', gender });
      const others = prev.people.filter(p => p.gender !== gender);
      return { ...newCounts, people: [...others, ...updated] };
    });
  };

  const handlePersonChange = (e, index) => {
    const { name, value } = e.target;
    const newPeople = [...formData.people];
    newPeople[index] = { ...newPeople[index], [name]: value };
    setFormData(prev => ({ ...prev, people: newPeople }));
  };

  const isApproved = booking?.status === 'approved';

  const handleRemovePerson = (index) => {
    const personToRemove = formData.people[index];
    if (!personToRemove) return;

    if (formData.people.length <= 1) {
      toast.error(t.booking.errors.removeLastMember);
      return;
    }

    const remainingPeople = formData.people.filter((_, i) => i !== index);

    // Check if remaining people have kids without adults
    const remainingKids = remainingPeople.filter(p => p.gender === 'boy' || p.gender === 'girl').length;
    const remainingAdults = remainingPeople.filter(p => p.gender === 'male' || p.gender === 'female').length;

    if (remainingKids > 0 && remainingAdults === 0) {
      toast.error(t.booking.errors.kidAdultRatio);
      return;
    }

    const genderMap = { male: 'numMales', female: 'numFemales', boy: 'numBoys', girl: 'numGirls' };
    const fieldToDecrement = genderMap[personToRemove.gender];

    setFormData(prev => ({
      ...prev,
      [fieldToDecrement]: Math.max(0, prev[fieldToDecrement] - 1),
      people: remainingPeople
    }));
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    const newFormData = { ...formData, [name]: newValue };
    if (name === 'stayFrom') {
      if (!newFormData.stayTo || new Date(value) > new Date(newFormData.stayTo)) {
        newFormData.stayTo = value;
      }
    }
    setFormData(newFormData);
  };

  const handlePhoneChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = e => setFormData(prev => ({ ...prev, fillingForOthers: e.target.value === 'true' }));

  const handleUpdateSubmit = async e => {
    e.preventDefault();
    setValidationError(null);
    setError('');

    const total = formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls;
    if (total === 0) {
      const msg = t.booking.errors.addPerson;
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    const invalid = formData.people.find(p => (p.gender === 'boy' || p.gender === 'girl') && parseInt(p.age, 10) > 16);
    if (invalid) {
      const msg = t.booking.errors.ageLimit.replace("{name}", invalid.name).replace("{gender}", t.booking.genders[invalid.gender] || invalid.gender);
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    const fromDate = new Date(formData.stayFrom);
    const toDate = new Date(formData.stayTo);
    if (fromDate > toDate) {
      const msg = t.booking.errors.dateOrder;
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (formData.contactNumber && formData.contactNumber.replace(/\D/g, '').length < 8) {
      const msg = "Please enter a valid contact number.";
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (formData.baijiContact && formData.baijiContact.replace(/\D/g, '').length < 8) {
      const msg = "Please enter a valid Baiji/MahatmaJi contact number.";
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    setSubmitLoading(true);
    try {
      const { numMales, numFemales, numBoys, numGirls, ...submissionData } = formData;
      const response = await api.put(`/bookings/update/${booking._id}`, { formData: submissionData });
      toast.success(t.myBookings.actions.updateSuccess);
      onUpdate(response.data?.booking);
      if (onClose) onClose();
    } catch (err) {
      const msg = err.response?.data?.message || t.booking.submitError;
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderPersonInputs = gender =>
    formData.people
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.gender === gender)
      .map(({ p, i }, idx) => {
        return (
          <div key={i} className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-background pb-4 last:border-b-0 relative group">
            <div className="col-span-2 flex justify-between items-center">
              <h4 className="font-bold capitalize text-primaryDark">{t.booking.genders[gender] || gender} #{idx + 1}</h4>
              {(!isApproved || formData.people.length > 1) && (
                <button
                  type="button"
                  onClick={() => handleRemovePerson(i)}
                  className="text-xs text-highlight hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-highlight/10 transition-colors flex items-center"
                >
                  <FaTimesCircle className="mr-1" /> {t.common?.remove || 'Remove'}
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">{t.booking.fields.name}</label>
              <input type="text" name="name" value={p.name} onChange={e => handlePersonChange(e, i)} disabled={isApproved} className={`mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary ${isApproved ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">{t.booking.fields.age}</label>
              <input type="number" name="age" value={p.age} onChange={e => handlePersonChange(e, i)} disabled={isApproved} className={`mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary ${isApproved ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} required min="1" />
            </div>
          </div>
        )
      });

  if (!booking) return null;

  let minStay = '', maxStay = '';
  if (event) {
    const s = new Date(event.startDate);
    const e = new Date(event.endDate);
    s.setDate(s.getDate() - 5);
    e.setDate(e.getDate() + 5);
    minStay = s.toISOString().split('T')[0];
    maxStay = e.toISOString().split('T')[0];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] p-4 font-body">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-soft">
        <button onClick={onClose} className="absolute top-4 right-4 text-primaryDark hover:text-accent z-10">
          <FaTimesCircle size={24} />
        </button>
        <div className="overflow-y-auto p-6 scrollbar-hide">
          <h2 className="text-3xl font-bold font-heading mb-8 text-center text-primaryDark border-b-2 border-background pb-3">{t.booking.editTitle}</h2>
          <form onSubmit={handleUpdateSubmit} className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">{t.booking.sections.stay}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemedInput label={t.booking.fields.from} name="stayFrom" value={formData.stayFrom} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} min={minStay} max={maxStay} disabled={isApproved} />
                <ThemedInput label={t.booking.fields.to} name="stayTo" value={formData.stayTo} onChange={handleChange} required type="date" icon={<FaCalendarAlt />} min={formData.stayFrom || minStay} max={maxStay} disabled={isApproved} />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">{t.booking.sections.ashram}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemedInput label={t.booking.fields.ashramName} name="ashramName" value={formData.ashramName} onChange={handleChange} required icon={<FaUniversity />} colSpan="md:col-span-2" disabled={isApproved} />
                <ThemedInput label={t.booking.fields.baijiName} name="baijiMahatmaJi" value={formData.baijiMahatmaJi} onChange={handleChange} disabled={isApproved} />
                <div className={isApproved ? "opacity-60 pointer-events-none" : ""}>
                  <PhoneInput
                    label={t.booking.fields.baijiContact}
                    value={formData.baijiContact}
                    onChange={(val) => handlePhoneChange('baijiContact', val)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">{t.booking.sections.personal}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemedInput label={t.booking.fields.email} name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} disabled={isApproved} />
                <div className={isApproved ? "opacity-60 pointer-events-none" : ""}>
                  <PhoneInput
                    label={t.booking.fields.contact}
                    value={formData.contactNumber}
                    onChange={(val) => handlePhoneChange('contactNumber', val)}
                    required
                  />
                </div>
                <ThemedInput label={t.booking.fields.address} name="address" value={formData.address} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" disabled={isApproved} />
                <ThemedInput label={t.booking.fields.city} name="city" value={formData.city} onChange={handleChange} required icon={<FaMapMarkerAlt />} colSpan="md:col-span-2" disabled={isApproved} />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">{t.booking.sections.group}</h3>
              <div className="space-y-6">
                <div className="p-4 border border-background bg-background/50 rounded-lg">
                  <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <FaUsers className="mr-2 text-primary" /> {t.booking.fields.fillingForOthers}
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className={`flex items-center ${isApproved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input type="radio" name="fillingForOthers" value="true" checked={formData.fillingForOthers === true} onChange={handleRadioChange} disabled={isApproved} className="form-radio h-4 w-4 text-primary focus:ring-primary" />
                      <span className="ml-2 text-gray-700">{t.booking.notices.yes}</span>
                    </label>
                    <label className={`flex items-center ${isApproved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input type="radio" name="fillingForOthers" value="false" checked={formData.fillingForOthers === false} onChange={handleRadioChange} disabled={isApproved} className="form-radio h-4 w-4 text-primary focus:ring-primary" />
                      <span className="ml-2 text-gray-700">{t.booking.notices.no}</span>
                    </label>
                  </div>
                </div>
                <div className="p-4 border border-primary/20 bg-primary/10 rounded-lg shadow-inner">
                  <label className="text-base font-semibold text-primaryDark flex items-center mb-3">
                    <FaUserPlus className="mr-2 text-primary" /> {t.booking.fields.memberDetails}
                  </label>
                  {isApproved && (
                    <div className="mb-4 text-xs bg-yellow-100 text-yellow-800 p-2 rounded border border-yellow-200">
                      {t.booking.notices.approvedEditNotice}
                    </div>
                  )}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputGroup label={t.booking.fields.males} name="numMales" value={formData.numMales} onChange={handleGroupChange} disabled={isApproved} />
                    <InputGroup label={t.booking.fields.females} name="numFemales" value={formData.numFemales} onChange={handleGroupChange} disabled={isApproved} />
                    <InputGroup label={t.booking.fields.boys} name="numBoys" value={formData.numBoys} onChange={handleGroupChange} disabled={isApproved} />
                    <InputGroup label={t.booking.fields.girls} name="numGirls" value={formData.numGirls} onChange={handleGroupChange} disabled={isApproved} />
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
              <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4 border-b border-background pb-2">{t.booking.sections.additional}</h3>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                  <FaPen className="mr-2 text-primary" /> {t.booking.fields.notes}
                </label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} disabled={isApproved} rows="3" className={`mt-1 block w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm ${isApproved ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} />
              </div>
            </div>

            {validationError && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{validationError}</p>}
            {error && <p className="text-highlight bg-highlight/10 border border-highlight/20 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}

            <div className="pt-4">
              <Button type="submit" className="w-full text-lg py-3 shadow-soft bg-primaryDark hover:bg-highlight text-white disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={submitLoading}>
                {submitLoading ? <FaSpinner className="inline mr-2 animate-spin" /> : t.booking.updateButton}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditBookingModal;