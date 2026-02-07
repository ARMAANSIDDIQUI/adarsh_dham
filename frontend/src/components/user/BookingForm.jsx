import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../common/Button.jsx";
import DynamicDateInput from "../common/DynamicDateInput.jsx";
import {
  FaUserPlus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaUniversity,
  FaUsers,
  FaPen,
  FaUser,
  FaPhoneAlt,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { useTranslation } from "../../hooks/useTranslation";
import PhoneInput, { validatePhoneNumber } from "../common/PhoneInput.jsx";

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
  const t = useTranslation();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [formData, setFormData] = useState({
    numMales: 0,
    numFemales: 0,
    numBoys: 0,
    numGirls: 0,
    people: [],
    hasSameStayDuration: true,
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
      setIsLoading(true);
      setEventError(null);
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/events/${eventId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch event.");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        setEvent(null);
        setEventError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const today = new Date(todayIST);

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const minStayDate = new Date(start);
    minStayDate.setDate(minStayDate.getDate() - 5);
    const maxStayDate = new Date(end);
    maxStayDate.setDate(maxStayDate.getDate() + 5);

    // Ensure minStayDate is not before today if the stay hasn't started yet
    const effectiveMinDate = new Date(Math.max(today, minStayDate)).toISOString().split("T")[0];

    setFormData(prev => ({
      ...prev,
      stayFrom: prev.stayFrom || effectiveMinDate,
      stayTo: prev.stayTo || maxStayDate.toISOString().split("T")[0],
    }));
  }, [event]);

  useEffect(() => {
    if (isEditing) return;
    const genderCounts = {
      male: parseInt(formData.numMales) || 0,
      female: parseInt(formData.numFemales) || 0,
      boy: parseInt(formData.numBoys) || 0,
      girl: parseInt(formData.numGirls) || 0,
    };
    let newPeopleArray = [];
    for (const gender of ["male", "female", "boy", "girl"]) {
      const currentCount = formData.people.filter(p => p.gender === gender).length;
      const targetCount = genderCounts[gender];
      let existingPeople = formData.people.filter(p => p.gender === gender);
      if (targetCount > currentCount) {
        for (let i = 0; i < targetCount - currentCount; i++) {
          existingPeople.push({
            name: "",
            age: "",
            gender,
            stayFrom: formData.stayFrom || "",
            stayTo: formData.stayTo || ""
          });
        }
      } else if (targetCount < currentCount) {
        existingPeople = existingPeople.slice(0, targetCount);
      }
      newPeopleArray = [...newPeopleArray, ...existingPeople];
    }

    // Preserve existing dates if switching back to individual dates, or initializing
    newPeopleArray = newPeopleArray.map((p, i) => {
      const existingPerson = formData.people[i];
      return {
        ...p,
        stayFrom: existingPerson?.stayFrom || formData.stayFrom || "",
        stayTo: existingPerson?.stayTo || formData.stayTo || ""
      };
    });

    setFormData(prev => ({ ...prev, people: newPeopleArray }));
  }, [formData.numMales, formData.numFemales, formData.numBoys, formData.numGirls, isEditing]);

  const handleGroupChange = e => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox for boolean values if needed, though for now using for group counts mostly
    const numValue = parseInt(value, 10);
    setFormData(prev => ({ ...prev, [name]: numValue >= 0 ? numValue : 0 }));
  };

  const handlePersonChange = (e, index) => {
    const { name, value } = e.target;
    const newPeople = [...formData.people];
    newPeople[index] = { ...newPeople[index], [name]: value };

    // Date validation for individual stays
    if (name === "stayFrom") {
      if (!newPeople[index].stayTo || new Date(value) > new Date(newPeople[index].stayTo)) {
        newPeople[index].stayTo = value;
      }
    }

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
    setFormData(newFormData);
  };

  const handlePhoneChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = e => {
    setFormData(prev => ({ ...prev, fillingForOthers: e.target.value === "true" }));
  };

  const renderPersonInputs = gender =>
    formData.people
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.gender === gender)
      .map(({ p, i }, idx) => {
        // Calculate min/max dates similar to main form
        let personMinDate = "";
        let personMaxDate = "";

        if (event) {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          const minD = new Date(start);
          minD.setDate(minD.getDate() - 5);
          const maxD = new Date(end);
          maxD.setDate(maxD.getDate() + 5);
          const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          const today = new Date(todayIST);
          personMinDate = new Date(Math.max(today, minD)).toISOString().split("T")[0];
          personMaxDate = maxD.toISOString().split("T")[0];
        }

        return (
          <div key={i} className="grid grid-cols-2 gap-4 pt-4 border-b-2 border-background pb-4 last:border-b-0">
            <h4 className="col-span-2 font-bold capitalize text-primaryDark">
              {t.booking.genders[gender] || gender} #{idx + 1}
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-600">{t.booking.fields.name}</label>
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
              <label className="block text-xs font-medium text-gray-600">{t.booking.fields.age}</label>
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
            {!formData.hasSameStayDuration && (
              <>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600">Stay From</label>
                  <input
                    type="date"
                    name="stayFrom"
                    value={p.stayFrom || ""}
                    onChange={e => handlePersonChange(e, i)}
                    className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary"
                    required={!formData.hasSameStayDuration}
                    min={personMinDate}
                    max={personMaxDate}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600">Stay To</label>
                  <input
                    type="date"
                    name="stayTo"
                    value={p.stayTo || ""}
                    onChange={e => handlePersonChange(e, i)}
                    className="mt-1 block w-full px-3 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary"
                    required={!formData.hasSameStayDuration}
                    min={p.stayFrom || personMinDate}
                    max={personMaxDate}
                  />
                </div>
              </>
            )}
          </div>
        )
      });

  const handleSubmit = e => {
    e.preventDefault();
    setValidationError(null);
    const total = formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls;
    if (total === 0) {
      const msg = t.booking.errors.addPerson;
      setValidationError(msg);
      toast.error(msg);
      return;
    }
    const invalid = formData.people.find(
      p => (p.gender === "boy" || p.gender === "girl") && parseInt(p.age, 10) > 16
    );
    if (invalid) {
      const msg = t.booking.errors.ageLimit.replace("{name}", invalid.name).replace("{gender}", t.booking.genders[invalid.gender] || invalid.gender);
      setValidationError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.baijiMahatmaJi || !formData.baijiContact) {
      const msg = t.booking.errors.baijiRequired;
      setValidationError(msg);
      toast.error(msg);
      return;
    }
    if (!validatePhoneNumber(formData.contactNumber)) {
      const msg = t.booking.errors.contactLength || "Invalid contact number";
      setValidationError(msg);
      toast.error(msg);
      return;
    }
    if (!validatePhoneNumber(formData.baijiContact)) {
      const msg = t.booking.errors.baijiContactLength || "Invalid Baiji/MahatmaJi contact number";
      setValidationError(msg);
      toast.error(msg);
      return;
    }
    if (formData.hasSameStayDuration) {
      const fromDate = new Date(formData.stayFrom);
      const toDate = new Date(formData.stayTo);
      if (fromDate > toDate) {
        const msg = t.booking.errors.dateOrder;
        setValidationError(msg);
        toast.error(msg);
        return;
      }
    } else {
      // Validation for individual dates
      for (const p of formData.people) {
        if (!p.stayFrom || !p.stayTo) {
          const msg = "Please select stay dates for all members.";
          setValidationError(msg);
          toast.error(msg);
          return;
        }
        if (new Date(p.stayFrom) > new Date(p.stayTo)) {
          const msg = `Invalid date range for ${p.name || 'a member'}.`;
          setValidationError(msg);
          toast.error(msg);
          return;
        }
      }
    }

    // Prepare data for submission
    const submissionData = { ...formData };

    // If different durations, calculate global range for search/indexing purposes
    if (!formData.hasSameStayDuration) {
      const allStartDates = formData.people.map(p => new Date(p.stayFrom)).filter(d => !isNaN(d));
      const allEndDates = formData.people.map(p => new Date(p.stayTo)).filter(d => !isNaN(d));

      if (allStartDates.length > 0) {
        const minStart = new Date(Math.min(...allStartDates));
        submissionData.stayFrom = minStart.toISOString().split('T')[0];
      }
      if (allEndDates.length > 0) {
        const maxEnd = new Date(Math.max(...allEndDates));
        submissionData.stayTo = maxEnd.toISOString().split('T')[0];
      }

      // Ensure individual dates are set (they are already in people array)
    } else {
      // If same duration, we can clear individual dates to avoid confusion, 
      // OR populate them to make backend logic uniform. 
      // Let's populate them for uniformity if Backend expects them from 'people' array as updated in Plan.
      submissionData.people = submissionData.people.map(p => ({
        ...p,
        stayFrom: formData.stayFrom,
        stayTo: formData.stayTo
      }));
    }

    const { numMales, numFemales, numBoys, numGirls, ...data } = submissionData;
    onSubmit(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-primaryDark text-5xl">{t.booking.errors.loadingEvent}</p>
      </div>
    );
  }

  if (eventError) {
    return <p className="text-center text-red-500 mt-10">Error: {eventError}</p>;
  }

  if (!event) {
    return <p className="text-center text-red-500 mt-10">{t.booking.errors.eventNotFound}</p>;
  }


  const minStayDate = new Date(event.startDate);
  minStayDate.setDate(minStayDate.getDate() - 5);
  const maxStayDate = new Date(event.endDate);
  maxStayDate.setDate(maxStayDate.getDate() + 5);

  return (
    <div className="bg-neutral p-4 md:p-8 min-h-screen font-body">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 bg-card rounded-2xl shadow-soft max-w-4xl w-full mx-auto"
      >
        <h2 className="text-3xl font-bold font-heading mb-8 text-center text-primaryDark border-b-2 border-background pb-3">
          {isEditing ? t.booking.editTitle : `${t.booking.title} ${event.name}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Stay Details Section */}
          <div className="bg-background/30 p-6 rounded-xl border border-background shadow-sm">
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-6 flex items-center border-b border-primary/20 pb-2">
              <FaCalendarAlt className="mr-3 text-primary" /> {t.booking.sections.stay}
            </h3>

            <div className="mb-4 bg-white/50 p-3 rounded-lg flex items-center">
              <input
                type="checkbox"
                name="hasSameStayDuration"
                checked={formData.hasSameStayDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, hasSameStayDuration: e.target.checked }))}
                className="w-5 h-5 text-primary rounded focus:ring-primary mr-3 cursor-pointer"
                id="sameDurationCheck"
              />
              <label htmlFor="sameDurationCheck" className="text-gray-700 font-medium cursor-pointer select-none">
                All members have the same stay duration
              </label>
            </div>

            {formData.hasSameStayDuration && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <DynamicDateInput
                  label={t.booking.fields.from}
                  name="stayFrom"
                  value={formData.stayFrom}
                  onChange={handleChange}
                  required
                  icon={<FaCalendarAlt />}
                  min={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}
                  max={maxStayDate.toISOString().split("T")[0]}
                />
                <DynamicDateInput
                  label={t.booking.fields.to}
                  name="stayTo"
                  value={formData.stayTo}
                  onChange={handleChange}
                  required
                  icon={<FaCalendarAlt />}
                  min={formData.stayFrom || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}
                  max={maxStayDate.toISOString().split("T")[0]}
                />
              </div>
            )}

          </div>

          {/* Ashram / Guru Details Section */}
          <div className="bg-background/30 p-6 rounded-xl border border-background shadow-sm">
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-6 flex items-center border-b border-primary/20 pb-2">
              <FaUniversity className="mr-3 text-primary" /> {t.booking.sections.ashram}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label={t.booking.fields.ashramName}
                name="ashramName"
                value={formData.ashramName}
                onChange={handleChange}
                required
                icon={<FaUniversity />}
                colSpan="md:col-span-2"
              />
              <div>
                <ThemedInput
                  label={t.booking.fields.baijiName}
                  name="baijiMahatmaJi"
                  value={formData.baijiMahatmaJi}
                  onChange={handleChange}
                  required
                  icon={<FaUser />}
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">Name of your reference person or spiritual guide.</p>
              </div>
              <PhoneInput
                label={t.booking.fields.baijiContact}
                value={formData.baijiContact}
                onChange={(val) => handlePhoneChange('baijiContact', val)}
                required
                icon={<FaPhoneAlt />}
              />
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="bg-background/30 p-6 rounded-xl border border-background shadow-sm">
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-6 flex items-center border-b border-primary/20 pb-2">
              <FaUser className="mr-3 text-primary" /> {t.booking.sections.personal}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label={t.booking.fields.email}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={<FaEnvelope />}
              />
              <PhoneInput
                label={t.booking.fields.contact}
                value={formData.contactNumber}
                onChange={(val) => handlePhoneChange('contactNumber', val)}
                required
                icon={<FaPhoneAlt />}
              />
              <ThemedInput
                label={t.booking.fields.address}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                icon={<FaMapMarkerAlt />}
                colSpan="md:col-span-2"
              />
              <ThemedInput
                label={t.booking.fields.city}
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                icon={<FaMapMarkerAlt />}
                colSpan="md:col-span-2"
              />
            </div>
          </div>

          {/* Group Details Section */}
          <div className="bg-background/30 p-6 rounded-xl border border-background shadow-sm">
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-6 flex items-center border-b border-primary/20 pb-2">
              <FaUsers className="mr-3 text-primary" /> {t.booking.sections.group}
            </h3>
            <div className="space-y-6">
              {!formData.hasSameStayDuration && (
                <p className="text-sm text-gray-500 italic bg-blue-50 p-2 rounded border border-blue-100">
                  Please specify stay dates for each member below.
                </p>
              )}
              <div className="p-4 bg-white/60 rounded-lg border border-background">
                <label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <FaUsers className="mr-2 text-primary" /> {t.booking.fields.fillingForOthers}
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer hover:bg-background/50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="fillingForOthers"
                      value="true"
                      checked={formData.fillingForOthers === true}
                      onChange={handleRadioChange}
                      className="form-radio h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 font-medium">{t.booking.notices.yes}</span>
                  </label>
                  <label className="flex items-center cursor-pointer hover:bg-background/50 p-2 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="fillingForOthers"
                      value="false"
                      checked={formData.fillingForOthers === false}
                      onChange={handleRadioChange}
                      className="form-radio h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 font-medium">{t.booking.notices.no}</span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <label className="text-base font-semibold text-primaryDark flex items-center mb-4">
                  <FaUserPlus className="mr-2 text-primary" /> {t.booking.fields.memberDetails}
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputGroup label={t.booking.fields.males} name="numMales" value={formData.numMales} onChange={handleGroupChange} />
                  <InputGroup label={t.booking.fields.females} name="numFemales" value={formData.numFemales} onChange={handleGroupChange} />
                  <InputGroup label={t.booking.fields.boys} name="numBoys" value={formData.numBoys} onChange={handleGroupChange} />
                  <InputGroup label={t.booking.fields.girls} name="numGirls" value={formData.numGirls} onChange={handleGroupChange} />
                </div>
              </div>
              {formData.people.length > 0 && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  {renderPersonInputs("male")}
                  {renderPersonInputs("female")}
                  {renderPersonInputs("boy")}
                  {renderPersonInputs("girl")}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-background/30 p-6 rounded-xl border border-background shadow-sm">
            <h3 className="text-xl font-semibold font-heading text-primaryDark mb-6 flex items-center border-b border-primary/20 pb-2">
              <FaPen className="mr-3 text-primary" /> {t.booking.sections.additional}
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                <FaPen className="mr-2 text-primary" /> {t.booking.fields.notes}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-4 py-3 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm transition-shadow placeholder-gray-400"
                placeholder="Any special requests or details..."
              />
            </div>
          </div>

          {validationError && (
            <p className="text-highlight bg-highlight/10 border border-highlight/20 p-4 rounded-xl text-sm text-center font-medium shadow-sm">
              {validationError}
            </p>
          )}
          {error && (
            <p className="text-highlight bg-highlight/10 border border-highlight/20 p-4 rounded-xl text-sm text-center font-medium shadow-sm">
              {error}
            </p>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className={`w-full text-lg py-4 shadow-lg transition-all duration-300 transform rounded-xl font-bold tracking-wide ${!formData.stayFrom ||
                !formData.stayTo ||
                !formData.ashramName.trim() ||
                !formData.baijiMahatmaJi.trim() ||
                formData.baijiContact.replace(/\D/g, '').length < 10 ||
                formData.contactNumber.replace(/\D/g, '').length < 10 ||
                !formData.address.trim() ||
                !formData.city.trim() ||
                (formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls === 0) ||
                !formData.people.every(p => p.name.trim() && p.age && (formData.hasSameStayDuration || (p.stayFrom && p.stayTo))) || loading
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-primaryDark hover:bg-primaryDark/90 hover:scale-[1.01] active:scale-[0.99] text-white"
                }`}
              disabled={
                (formData.hasSameStayDuration && (!formData.stayFrom || !formData.stayTo)) ||
                !formData.ashramName.trim() ||
                !formData.baijiMahatmaJi.trim() ||
                formData.baijiContact.replace(/\D/g, '').length < 10 ||
                formData.contactNumber.replace(/\D/g, '').length < 10 ||
                !formData.address.trim() ||
                !formData.city.trim() ||
                (formData.numMales + formData.numFemales + formData.numBoys + formData.numGirls === 0) ||
                !formData.people.every(p => p.name.trim() && p.age && (formData.hasSameStayDuration || (p.stayFrom && p.stayTo))) ||
                loading
              }
            >
              {loading ? t.booking.submitting : isEditing ? t.booking.updateButton : t.booking.submitButton}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingForm;
