import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-[200px] text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Loader;
