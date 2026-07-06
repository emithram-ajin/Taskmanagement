import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';

const BlockerTracking = () => {
  const [openBlockers, setOpenBlockers] = useState([
    {
      id: 1,
      title: 'Missing database credentials for production migration',
      task: 'Database migration',
      reporter: 'Priya Patel',
      date: 'Apr 9, 2026'
    },
    {
      id: 2,
      title: 'Apple Developer account approval pending',
      task: 'Push notification service',
      reporter: 'James Kim',
      date: 'Apr 8, 2026'
    }
  ]);

  const [resolvedBlockers, setResolvedBlockers] = useState([]);

  const handleResolve = (id) => {
    const blocker = openBlockers.find(b => b.id === id);
    if (blocker) {
      setOpenBlockers(openBlockers.filter(b => b.id !== id));
      
      // Get today's date in a nice format (e.g. Apr 10, 2026)
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      setResolvedBlockers([{ ...blocker, resolvedDate: today }, ...resolvedBlockers]);
    }
  };

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blocker Tracking</h1>
        <p className="text-slate-500 mt-1">Monitor and resolve team blockers</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Open Blockers */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center space-x-3 mb-8 bg-rose-50 border border-rose-100 p-3 rounded-lg w-fit">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-semibold text-rose-900">Open Blockers ({openBlockers.length})</h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {openBlockers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                All clear! No open blockers.
              </div>
            ) : (
              openBlockers.map(blocker => (
                <div key={blocker.id} className="bg-rose-50 border border-rose-100 p-5 rounded-lg flex justify-between items-start group hover:border-rose-200 transition-colors relative">
                  <div>
                    <h3 className="font-semibold text-rose-900 mb-3">{blocker.title}</h3>
                    <div className="space-y-1 text-sm text-rose-700/80">
                      <p>Task: {blocker.task}</p>
                      <p>Reporter: {blocker.reporter}</p>
                      <p>Reported: {blocker.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(blocker.id)}
                    className="text-emerald-500 hover:text-emerald-600 bg-white p-1.5 rounded-full shadow-sm hover:shadow transition-all border border-emerald-100 absolute top-4 right-4 cursor-pointer z-10"
                    title="Mark as resolved"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolved Blockers */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center space-x-3 mb-8 bg-emerald-50 border border-emerald-100 p-3 rounded-lg w-fit">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-emerald-900">Resolved ({resolvedBlockers.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {resolvedBlockers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No resolved blockers yet
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedBlockers.map(blocker => (
                  <div key={blocker.id} className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex justify-between items-start relative opacity-80 transition-opacity hover:opacity-100">
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-3">{blocker.title}</h3>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p>Task: {blocker.task}</p>
                        <p>Reporter: {blocker.reporter}</p>
                        <p className="text-emerald-600 font-medium pt-1">Resolved: {blocker.resolvedDate}</p>
                      </div>
                    </div>
                    <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full border border-emerald-100 absolute top-4 right-4">
                      {/* Changed to a different tick icon as requested */}
                      <Check className="w-5 h-5" strokeWidth={3} /> 
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlockerTracking;
