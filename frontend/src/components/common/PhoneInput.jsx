import React, { useState, useEffect } from 'react';

export const COUNTRY_CODES = [
    { code: '+91', country: 'IN', flag: '🇮🇳', digits: 10 },
    { code: '+1', country: 'US', flag: '🇺🇸', digits: 10 },
    { code: '+44', country: 'UK', flag: '🇬🇧', digits: 10 },
    { code: '+971', country: 'AE', flag: '🇦🇪', digits: 9 },
    { code: '+61', country: 'AU', flag: '🇦🇺', digits: 9 },
    { code: '+1', country: 'CA', flag: '🇨🇦', digits: 10 },
    { code: '+65', country: 'SG', flag: '🇸🇬', digits: 8 },
];

export const validatePhoneNumber = (fullNumber) => {
    if (!fullNumber) return false;

    // Sort by length desc to match longest prefix first
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    const matched = sortedCodes.find(c => fullNumber.startsWith(c.code));

    if (matched) {
        const numberPart = fullNumber.slice(matched.code.length).replace(/\D/g, '');
        return numberPart.length === matched.digits;
    }

    // Fallback if no code matches (shouldn't happen if using the input correctly)
    const digits = fullNumber.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
};

const PhoneInput = ({ value, onChange, error, label = "Phone Number", required = false, disabled = false, placeholder = "Enter mobile number", icon = null }) => {
    // Hardcoded to +91 as requested
    const FIXED_CODE = '+91';
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (!value) {
            setPhoneNumber('');
            return;
        }
        // If value starts with +91, strip it for display. If not, just show value (assuming it's just the number).
        if (value.startsWith(FIXED_CODE)) {
            setPhoneNumber(value.slice(FIXED_CODE.length));
        } else {
            setPhoneNumber(value);
        }
    }, [value]);

    const handleNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Allow only digits
        // Limit to 10 digits for Indian numbers usually, but let's just keep it flexible or enforce 10? 
        // User said "number prefix and number", usually implies 10 digits for India.
        if (val.length > 10) return; // Optional: restrict length to 10

        setPhoneNumber(val);
        onChange(val);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                    {icon && <span className="mr-2 text-primary">{icon}</span>}
                    {label}
                    {required && <span className="ml-1 text-highlight">*</span>}
                </label>
            )}
            <div className="relative flex items-stretch flex-nowrap rounded-lg shadow-sm mt-1 h-12">
                {/* Fixed Prefix Display */}
                <div className="relative">
                    <div className="flex items-center justify-center px-4 h-full border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 font-medium">
                        <span className="mr-2">🇮🇳</span> +91
                    </div>
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-grow h-full">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handleNumberChange}
                        disabled={disabled}
                        className={`block w-full px-4 h-full border rounded-r-lg rounded-l-none shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow placeholder-gray-500 ${error ? 'border-red-500' : 'border-background'}`}
                        placeholder={placeholder}
                        inputMode="numeric"
                        maxLength={10}
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default PhoneInput;
