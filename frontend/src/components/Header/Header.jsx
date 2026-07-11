import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TopBar = () => {
  const location = useLocation();
  
  const getPageName = (path) => {
    switch (path) {
      case '/': return 'Overview';
      case '/teams': return 'Teams';
      case '/members': return 'Members Directory';
      case '/projects': return 'Projects';
      case '/tasks': return 'Tasks';
      case '/kanban': return 'Kanban Board';
      case '/scrum': return 'Scrum Updates';
      case '/blockers': return 'Blockers';
      case '/dependencies': return 'Dependencies';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
      <div className="flex items-center text-sm text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer">Admin View</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="font-medium text-slate-900">{getPageName(location.pathname)}</span>
      </div>
    </header>
  );
};

export default TopBar;
