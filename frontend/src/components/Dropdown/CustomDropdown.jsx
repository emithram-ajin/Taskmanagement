import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  className = "",
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    // Mock the event object to seamlessly replace standard <select onChange={e => ...}>
    if (onChange) {
      onChange({ target: { value: option.value } });
    }
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Hidden input to handle HTML 'required' form validation natively */}
      {required && (
        <input 
          type="text" 
          required 
          value={value || ''} 
          onChange={() => {}} 
          className="absolute opacity-0 -z-10 h-full w-full pointer-events-none" 
          tabIndex={-1} 
        />
      )}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400 ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"
        } ${isOpen ? "ring-2 ring-indigo-500 border-indigo-500" : ""}`}
      >
        <span className={`block truncate ${!selectedOption ? "text-slate-400" : "text-slate-700"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu with Tailwind transition classes */}
      <div 
        className={`absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto transform origin-top transition-all duration-200 ease-out ${
          isOpen ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"
        }`}
      >
        <div className="py-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500 italic text-center">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                    isSelected ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;
