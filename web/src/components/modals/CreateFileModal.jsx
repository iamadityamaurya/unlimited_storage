import React from 'react';

export default function CreateFileModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
  newFileName,
  setNewFileName,
}) {
  if (!isOpen) return null;

  const hasIllegal = newFileName.includes('###') || newFileName.includes('_');
  const isDisabled = isCreating || !newFileName.trim() || hasIllegal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={!isCreating ? onClose : undefined}
      />

      {/* Modal */}
      <form
        onSubmit={onCreate}
        className="relative w-full max-w-sm glass-strong rounded-3xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Create Folder</h2>
              <p className="text-slate-500 text-xs mt-0.5">Add a new folder to your drive</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
            Folder Name
          </label>
          <input
            type="text"
            autoFocus
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="e.g. Documents"
            className={`w-full px-4 py-3 rounded-xl text-[0.9375rem] font-medium text-slate-100 placeholder:text-slate-600 bg-[#0d0f1c] border transition-all duration-200 focus:outline-none focus:ring-2 ${
              hasIllegal
                ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                : 'border-white/[0.08] focus:border-indigo-500 focus:ring-indigo-500/25'
            }`}
            required
          />
          {hasIllegal && (
            <p className="text-red-400 text-[11px] font-medium mt-2">
              {newFileName.includes('_') ? 'Underscores are reserved characters' : '"###" is a reserved sequence'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-w-[110px] flex justify-center items-center"
          >
            {isCreating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
            ) : "Create Folder"}
          </button>
        </div>
      </form>
    </div>
  );
}
