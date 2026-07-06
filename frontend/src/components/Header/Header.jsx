import React from 'react';
import { ChevronRight } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
      <div className="flex items-center text-sm text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer">Admin View</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="font-medium text-slate-900">Overview</span>
      </div>
    </header>
  );
};

export default TopBar;
