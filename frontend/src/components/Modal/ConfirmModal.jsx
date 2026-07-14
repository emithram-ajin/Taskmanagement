import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete" }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 z-[998] animate-[logout-backdrop-in_0.2s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 pointer-events-none">
        <div className="w-[420px] max-w-[92vw] pointer-events-auto animate-[logout-toast-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl px-6 py-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
