import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const COUNTRY_CODES = [
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+1', country: 'CA', flag: '🇨🇦' },
    { code: '+65', country: 'SG', flag: '🇸🇬' },
    // Add more as needed
];

const PhoneInput = ({ value, onChange, error, label = "Phone Number", required = false, disabled = false, placeholder = "Enter mobile number" }) => {
    const [selectedCode, setSelectedCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Parse the initial value to split code and number
    useEffect(() => {
        if (!value) {
            setPhoneNumber('');
            // Keep default selectedCode as +91
            return;
        }

        // Try to find if value starts with any known code
        // We sort by length desc to match +971 before +9 for example (if we had +9)
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
        const matched = sortedCodes.find(c => value.startsWith(c.code));

        if (matched) {
            setSelectedCode(matched.code);
            setPhoneNumber(value.slice(matched.code.length));
        } else {
            // Fallback: If no code matches, assume it's a raw number and use current selected code or default
             // If the value doesn't start with +, maybe it is legacy data (just the number)
             if (!value.startsWith('+')) {
                 setPhoneNumber(value);
                 // We don't change selectedCode here to avoid jumping if user is typing
             } else {
                 // Unknown code? Just put it all in number or handle gracefully?
                 // For now, let's just set it as number
                 setPhoneNumber(value);
             }
        }
    }, [value]);

    const handleCodeSelect = (code) => {
        setSelectedCode(code);
        setIsDropdownOpen(false);
        // Trigger change with new code + existing number
        onChange(code + phoneNumber);
    };

    const handleNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Allow only digits
        setPhoneNumber(val);
        onChange(selectedCode + val);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative flex rounded-lg shadow-sm mt-1">
                {/* Country Code Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        className={`flex items-center justify-between space-x-1 pl-3 pr-2 py-2 border border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors ${error ? 'border-red-500' : 'border-background'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                        disabled={disabled}
                    >
                        <span>{COUNTRY_CODES.find(c => c.code === selectedCode)?.flag} {selectedCode}</span>
                        <FaChevronDown className="text-gray-400 text-xs ml-1" />
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {COUNTRY_CODES.map((c) => (
                                <button
                                    key={`${c.country}-${c.code}`}
                                    type="button"
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                                    onClick={() => handleCodeSelect(c.code)}
                                >
                                    <span>{c.flag}</span>
                                    <span className="font-medium text-gray-700">{c.code}</span>
                                    <span className="text-gray-400 text-xs ml-auto">{c.country}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-grow">
                     {/* We remove the absolute icon because it might clash with the prefix style, or we can keep it inside the input padding */}
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handleNumberChange}
                        disabled={disabled}
                        className={`block w-full pl-4 pr-4 py-2 border rounded-r-lg rounded-l-none shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow ${error ? 'border-red-500' : 'border-background'}`}
                        placeholder={placeholder}
                        inputMode="numeric"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            
            {/* Backdrop for dropdown */}
            {isDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
            )}
        </div>
    );
};

export default PhoneInput;
