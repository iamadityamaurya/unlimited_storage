import React from 'react';

export default function FolderSidebar({ folders, activeFolder, onFolderClick, onBack, onOpenCreateModal, onRenameClick }) {
  const [activeMenuIdx, setActiveMenuIdx] = React.useState(null);

  return (
    <div className="hidden md:flex w-76 flex-shrink-0 flex-col bg-[#161616]/40 backdrop-blur-xl border-r border-[#2a2a2a] h-[calc(100vh-72px)] sticky top-[72px] overflow-hidden group">
      {/* ... header buttons unchanged ... */}
      <div className="p-6 space-y-4">
        <button 
          onClick={onBack}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-tr from-[#252525] to-[#333] hover:from-[#333] hover:to-[#444] text-gray-200 transition-all text-sm font-black uppercase tracking-widest shadow-xl border border-white/5 group-active:scale-95"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          All Files
        </button>

        <button 
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-yellow-500/10 border border-yellow-400/20 group-active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          New Folder
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
        <div className="flex items-center justify-between px-4 mb-5">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Folders</h3>
          <span className="text-[11px] font-bold bg-white/5 text-gray-400 px-3 py-0.5 rounded-full border border-white/5">{folders.length}</span>
        </div>
        
        <div className="space-y-2 min-w-0">
          {folders.map((f, idx) => {
            const { uid, name } = f;
            const isActive = activeFolder === uid;
            return (
              <div key={idx} className="relative group/folder">
                <button
                  onClick={() => onFolderClick(uid, name)}
                  className={`w-full group/item text-left px-4 py-3 rounded-2xl text-[13px] font-bold transition-all flex items-center gap-3.5 relative overflow-hidden ${isActive ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {/* ... indicator and icon ... */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-black/10' : 'bg-white/5 group-hover/item:bg-white/10'}`}>
                    <svg className={`w-4.5 h-4.5 ${isActive ? 'text-black' : 'text-yellow-500/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                  </div>
                  
                  <span className="truncate flex-1 tracking-tight pr-4">{name}</span>
                  
                  {!isActive && (
                    <svg className="w-3.5 h-3.5 opacity-0 group-hover/folder:hidden transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  )}
                </button>

                {/* Context Menu Trigger */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(idx === activeMenuIdx ? null : idx); }}
                    className={`w-6 h-6 flex flex-col items-center justify-center gap-[1.5px] rounded-lg transition-all text-white opacity-0 group-hover/folder:opacity-100 focus:opacity-100 ${isActive ? 'bg-black/10 hover:bg-black/20' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className={`w-[2.5px] h-[2.5px] rounded-full ${isActive ? 'bg-black/60' : 'bg-gray-400'}`}></div>
                    <div className={`w-[2.5px] h-[2.5px] rounded-full ${isActive ? 'bg-black/60' : 'bg-gray-400'}`}></div>
                    <div className={`w-[2.5px] h-[2.5px] rounded-full ${isActive ? 'bg-black/60' : 'bg-gray-400'}`}></div>
                  </button>

                  {activeMenuIdx === idx && (
                    <div 
                      className="absolute top-8 right-0 bg-[#252525] border border-[#444] shadow-2xl rounded-xl w-32 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setActiveMenuIdx(null)}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRenameClick({ uid, name }); setActiveMenuIdx(null); }}
                        className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-300 hover:text-white hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Rename
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none opacity-60"></div>
    </div>
  );
}
