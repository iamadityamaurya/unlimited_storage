import React, { useState } from 'react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isFolder = false,
  isDeleting = false,
  deleteProgressText = ""
}) {
  const [recursiveDelete, setRecursiveDelete] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(recursiveDelete);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-strong rounded-3xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h2>
              <p className="text-slate-500 text-xs mt-0.5">This action is irreversible</p>
            </div>
          </div>
        </div>

        {/* Body */}
        {!isDeleting ? (
          <div className="px-7 py-6 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              {message}
            </p>

            {isFolder && (
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={recursiveDelete}
                  onChange={(e) => setRecursiveDelete(e.target.checked)}
                  className="mt-0.5 accent-indigo-500 rounded focus:ring-indigo-500/50"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-200">Delete all files in folder</span>
                  <span className="text-[10px] text-slate-500">Recursively delete all file messages from Telegram to free up space.</span>
                </div>
              </label>
            )}
          </div>
        ) : (
          <div className="px-7 py-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-red-950" />
              <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin-smooth" />
            </div>
            <div>
              <p className="text-slate-200 font-semibold">Deleting...</p>
              <p className="text-slate-500 text-sm mt-1">{deleteProgressText || 'Cleaning index...'}</p>
            </div>
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <p className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">Do not close this window</p>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isDeleting && (
          <div className="px-7 pb-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20 transition-all duration-200 active:scale-95"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
