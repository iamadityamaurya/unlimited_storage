import React from 'react';

export default function CreateFileModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  isCreating, 
  newFileName, 
  setNewFileName 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form 
        onSubmit={onCreate} 
        className="w-full max-w-sm bg-[#252525] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-1">Create New File</h3>
          <p className="text-gray-400 text-xs mb-5">Instanciate a new datastream node into the active Telegram drive.</p>
          
          <input
            type="text"
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Folder or File Array Name"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
            required
          />
        </div>
        
        <div className="bg-[#1e1e1e] px-6 py-4 border-t border-[#333] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || !newFileName.trim()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] flex justify-center items-center"
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Node"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
