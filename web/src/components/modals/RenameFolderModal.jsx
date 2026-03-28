import React, { useState, useEffect } from 'react';

export default function RenameFolderModal({ isOpen, onClose, onRename, isRenaming, oldName, renameProgressText }) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewName(oldName || '');
    }
  }, [isOpen, oldName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === oldName) return;
    onRename(oldName, newName.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={!isRenaming ? onClose : undefined}
      ></div>
      
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Rename Folder</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Metata synchronization</p>
            </div>
          </div>

          {!isRenaming ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Folder Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name..."
                  className="w-full bg-[#252525] border border-[#444] rounded-2xl px-5 py-4 text-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-[#252525] hover:bg-[#333] text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-[#444]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || newName.trim() === oldName}
                  className="flex-[2] px-6 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Syncing Metadata...</h3>
              <p className="text-gray-400 text-sm max-w-[240px] leading-relaxed font-medium">
                {renameProgressText || 'Updating Master Index and child file blocks...'}
              </p>
              
              <div className="mt-8 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Do not close this window</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
