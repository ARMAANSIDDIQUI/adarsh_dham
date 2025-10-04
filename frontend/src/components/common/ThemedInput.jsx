import React from 'react';
import { FaUser } from 'react-icons/fa'; // Example icon

const ThemedInput = ({ label, name, value, onChange, required, type = "text", icon, disabled, min, max, colSpan = "" }) => (
    <div className={`${colSpan} font-body`}>
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
            disabled={disabled}
            min={min} 
            max={max}
        />
    </div>
);

export default ThemedInput;