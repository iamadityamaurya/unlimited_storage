import React from 'react';

export default function FolderSidebar({
  folders,
  activeFolder,
  onFolderClick,
  onBack,
  onOpenCreateModal,
  onRenameClick,
}) {
  const [activeMenuIdx, setActiveMenuIdx] = React.useState(null);

  return (
    <div className="hidden md:flex w-72 flex-shrink-0 flex-col bg-[#0d0f1c]/80 backdrop-blur-xl border-r border-white/[0.07] h-[calc(100vh-64px)] sticky top-16 overflow-hidden">

      {/* Top Actions */}
      <div className="p-5 space-y-3 border-b border-white/[0.06]">
        {/* Back to All Files */}
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Files
        </button>

        {/* New Folder */}
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
        {/* Section label */}
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">Folders</span>
          <span className="text-[11px] font-medium text-slate-600 bg-white/[0.04] px-2 py-0.5 rounded-full">
            {folders.length}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {folders.map((f, idx) => {
            const { uid, name } = f;
            const isActive  = activeFolder === uid;
            const menuOpen  = activeMenuIdx === idx;

            return (
              <div key={idx} className="relative group/row">
                <button
                  onClick={() => onFolderClick(uid, name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Folder icon tiny */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-white/15' : 'bg-white/[0.05] group-hover/row:bg-indigo-500/15'
                  }`}>
                    <svg
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="truncate flex-1">{name}</span>
                </button>

                {/* Context menu trigger */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={e => { e.stopPropagation(); setActiveMenuIdx(menuOpen ? null : idx); }}
                    className={`w-6 h-6 flex flex-col items-center justify-center gap-[2px] rounded-md transition-all opacity-0 group-hover/row:opacity-100 focus:opacity-100 ${
                      isActive ? 'hover:bg-white/20' : 'hover:bg-white/[0.08]'
                    }`}
                  >
                    {[0,1,2].map(i => (
                      <div key={i} className={`w-[2.5px] h-[2.5px] rounded-full ${isActive ? 'bg-white/70' : 'bg-slate-500'}`} />
                    ))}
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute top-8 right-0 w-36 bg-[#111320] border border-white/[0.1] shadow-2xl rounded-xl py-2 z-50 animate-scale-in"
                      onMouseLeave={() => setActiveMenuIdx(null)}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); onRenameClick({ uid, name }); setActiveMenuIdx(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
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

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d0f1c] to-transparent pointer-events-none" />

      {/* Close background */}
      {activeMenuIdx !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuIdx(null)} />
      )}
    </div>
  );
}
