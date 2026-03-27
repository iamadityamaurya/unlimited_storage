import React from 'react';

export default function DashboardHeader({ 
  chatName, 
  activeFolder, 
  onOpenCreateModal,
  onOpenUploadModal,
  onClearChat, 
  onLogOut 
}) {
  return (
    <div className="sticky top-0 z-50 w-full h-16 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-6 lg:px-10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center border border-[#444]">
          <span className="text-white font-bold font-mono text-xs">
            {chatName.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-200 tracking-tight">
          {chatName}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {!activeFolder && (
          <button
            onClick={onOpenCreateModal}
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded transition-colors duration-200 text-xs font-bold border border-yellow-400 shadow-sm flex items-center gap-1 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create File
          </button>
        )}
        <button
          onClick={onClearChat}
          className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 rounded transition-colors duration-200 text-xs font-medium border border-[#444]"
        >
          Switch Drive
        </button>
        <button
          onClick={onLogOut}
          className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded transition-colors duration-200 text-xs font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
