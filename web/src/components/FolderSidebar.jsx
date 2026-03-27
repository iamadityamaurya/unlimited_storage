import React from 'react';

export default function FolderSidebar({ folders, activeFolder, onFolderClick, onBack, onOpenCreateModal }) {
  return (
    <div className="hidden md:flex w-72 flex-shrink-0 flex-col bg-[#161616]/40 backdrop-blur-xl border-r border-[#2a2a2a] h-[calc(100vh-80px)] sticky top-20 overflow-hidden group">
      <div className="p-6 space-y-3">
        <button 
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-tr from-[#252525] to-[#333] hover:from-[#333] hover:to-[#444] text-gray-200 transition-all text-xs font-black uppercase tracking-widest shadow-xl border border-white/5 group-active:scale-95"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Root Directory
        </button>

        <button 
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-yellow-500/10 border border-yellow-400/20 group-active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          New Folder
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Folders</h3>
          <span className="text-[9px] font-bold bg-white/5 text-gray-500 px-2 py-0.5 rounded-full border border-white/5">{folders.length}</span>
        </div>
        
        <div className="space-y-1.5 min-w-0">
          {folders.map((f, idx) => {
            const name = f.message.split('_File')[0];
            const isActive = activeFolder === name;
            return (
              <button
                key={idx}
                onClick={() => onFolderClick(name)}
                className={`w-full group/item text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 relative overflow-hidden ${isActive ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20"></div>
                )}
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-black/10' : 'bg-white/5 group-hover/item:bg-white/10'}`}>
                  <svg className={`w-4 h-4 ${isActive ? 'text-black' : 'text-yellow-500/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                </div>
                
                <span className="truncate flex-1 tracking-tight">{name}</span>
                
                {!isActive && (
                   <svg className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none opacity-60"></div>
    </div>
  );
}
