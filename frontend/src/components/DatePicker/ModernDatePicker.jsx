import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ModernDatePicker = ({ value, onChange, placeholder = 'Select Date', required = false, placement = 'bottom', align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Track the current month being viewed
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date();
  });
  
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // For rendering the selected value nicely
  const displayValue = value ? (() => {
      const parts = value.split('-');
      if (parts.length !== 3) return value;
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })() : '';

  // Check if a day is selected
  const isSelected = (day) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length !== 3) return false;
    return parseInt(parts[0]) === viewDate.getFullYear() && 
           parseInt(parts[1]) - 1 === viewDate.getMonth() && 
           parseInt(parts[2]) === day;
  };
  
  // Check if a day is today
  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === viewDate.getFullYear() && 
           today.getMonth() === viewDate.getMonth() && 
           today.getDate() === day;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 bg-white shadow-sm hover:shadow-md ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-300 hover:border-indigo-300'}`}
      >
        <span className={`text-sm truncate ${displayValue ? 'text-slate-700' : 'text-slate-400'}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={16} className={`shrink-0 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
      </div>
      
      {/* Hidden input for HTML5 validation / required prop integration if needed in forms */}
      <input type="text" readOnly className="sr-only" required={required} value={value} />

      {isOpen && (
        <div className={`absolute z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${align === 'right' ? 'right-0' : 'left-0'} w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="font-semibold text-slate-800 text-sm">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="w-8 h-8"></div>
            ))}
            {days.map(d => {
               const selected = isSelected(d);
               const today = isToday(d);
               return (
                 <button
                   key={d}
                   type="button"
                   onClick={() => handleDateSelect(d)}
                   className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                     ${selected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110' : 
                       today ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 
                       'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                   `}
                 >
                   {d}
                 </button>
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;
