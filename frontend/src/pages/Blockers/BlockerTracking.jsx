import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Check, Loader2 } from 'lucide-react';
import apiServices from '../../services/apiServices';

const BlockerTracking = () => {
  const [openBlockers, setOpenBlockers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlockers();
  }, []);

  const fetchBlockers = async () => {
    try {
      setIsLoading(true);
      const data = await apiServices.getAdminBlockedTasks();
      setOpenBlockers(data);
    } catch (error) {
      console.error("Failed to fetch blocked tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blocker Tracking</h1>
        <p className="text-slate-500 mt-1">Monitor open team blockers</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center space-x-3 border-b border-slate-200 p-6 bg-slate-50/50">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-semibold text-slate-900">Active Blockers ({openBlockers.length})</h2>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 min-h-[400px]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading blockers...
            </div>
          ) : openBlockers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 min-h-[400px]">
              All clear! No open blockers.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="font-semibold py-4 px-6">Blocked User</th>
                  <th className="font-semibold py-4 px-6">Priority</th>
                  <th className="font-semibold py-4 px-6">Project</th>
                  <th className="font-semibold py-4 px-6">Blocker Reason</th>
                  <th className="font-semibold py-4 px-6">Depended On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openBlockers.map(blocker => (
                  <tr key={blocker._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-medium">{blocker.assignee?.name || 'Unassigned'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        blocker.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                        blocker.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {blocker.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{blocker.project?.projectName || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <AlertCircle size={16} />
                        </div>
                        <span className="font-medium text-slate-900">
                          {blocker.blockerReason}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {blocker.blockerAssignee ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {blocker.blockerAssignee.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockerTracking;
