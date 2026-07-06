import React from 'react';

const ScrumUpdates = () => {
  const updates = [
    {
      id: 1,
      user: 'Sarah Chen',
      initials: 'S',
      color: 'bg-indigo-600',
      date: 'Friday, April 10, 2026',
      yesterday: 'Completed dashboard wireframes, started on chart implementation',
      today: 'Continue working on analytics charts, integrate with backend API',
      blockers: 'None',
      hasBlockers: false
    },
    {
      id: 2,
      user: 'Priya Patel',
      initials: 'P',
      color: 'bg-indigo-600',
      date: 'Friday, April 10, 2026',
      yesterday: 'Optimized 3 API endpoints, reduced response time by 40%',
      today: 'Continue API optimization, start database migration planning',
      blockers: 'Missing database credentials for production migration',
      hasBlockers: true
    }
  ];

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Scrum Updates</h1>
        <p className="text-slate-500 mt-1">View team scrum updates</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Team Updates</h2>
        
        <div className="space-y-10">
          {updates.map((update, index) => (
            <div key={update.id} className={index !== updates.length - 1 ? 'border-b border-slate-100 pb-10' : ''}>
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${update.color}`}>
                  {update.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{update.user}</h3>
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {update.date}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pl-14">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Yesterday</h4>
                  <p className="text-sm text-slate-600">{update.yesterday}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Today</h4>
                  <p className="text-sm text-slate-600">{update.today}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Blockers</h4>
                  <p className={`text-sm font-medium ${update.hasBlockers ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {update.blockers}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrumUpdates;
