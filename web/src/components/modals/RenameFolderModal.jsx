import React, { useState, useEffect } from 'react';

export default function RenameFolderModal({
  isOpen,
  onClose,
  onRename,
  isRenaming,
  oldFolder,
  renameProgressText,
}) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen && oldFolder) setNewName(oldFolder.name || '');
  }, [isOpen, oldFolder]);

  if (!isOpen) return null;

  const hasIllegal  = newName.includes('###') || newName.includes('_');
  const unchanged   = newName.trim() === oldFolder?.name;
  const isDisabled  = !newName.trim() || !oldFolder || unchanged || hasIllegal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    onRename(oldFolder, newName.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={!isRenaming ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-strong rounded-3xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Rename Folder</h2>
              <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px]">
                {oldFolder?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {!isRenaming ? (
          <form onSubmit={handleSubmit}>
            <div className="px-7 py-6">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
                New name
              </label>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter new name…"
                className={`w-full px-4 py-3 rounded-xl text-[0.9375rem] font-medium text-slate-100 placeholder:text-slate-600 bg-[#0d0f1c] border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  hasIllegal
                    ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                    : 'border-white/[0.08] focus:border-indigo-500 focus:ring-indigo-500/25'
                }`}
              />
              {hasIllegal && (
                <p className="text-red-400 text-[11px] font-medium mt-2">
                  {newName.includes('_') ? 'Underscores are reserved characters' : '"###" is a reserved sequence'}
                </p>
              )}
            </div>
            <div className="px-7 pb-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDisabled}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-w-[110px] flex justify-center items-center"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="px-7 py-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
            </div>
            <div>
              <p className="text-slate-200 font-semibold">Renaming folder…</p>
              <p className="text-slate-500 text-sm mt-1">{renameProgressText || 'Updating index…'}</p>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Do not close this window</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
