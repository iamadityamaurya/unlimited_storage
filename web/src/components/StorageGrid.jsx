import React, { useState } from 'react';
import { FolderIcon } from './icons/Icons';

// ─── Context menu ─────────────────────────────────────────────
function ContextMenu({ onRename, onDelete, onClose }) {
  return (
    <div
      className="absolute top-9 right-0 w-36 bg-[#111320] border border-white/[0.1] shadow-2xl rounded-2xl py-2 z-50 animate-scale-in"
      onMouseLeave={onClose}
    >
      <button
        onClick={e => { e.stopPropagation(); onRename(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Rename
      </button>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyState({ isFiltered }) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24 gap-5 text-center">
      <div className="opacity-40">
        <FolderIcon size={64} />
      </div>
      <div>
        <p className="text-slate-300 font-semibold text-lg">
          {isFiltered ? "No matching folders" : "No folders yet"}
        </p>
        <p className="text-slate-600 text-sm mt-1 max-w-xs mx-auto">
          {isFiltered 
            ? "Try adjusting your search terms to locate folders." 
            : "Create your first folder using the \"New Folder\" button above."}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function StorageGrid({ messages, searchQuery, onFolderClick, onRenameClick, onDeleteClick }) {
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  const filteredFolders = React.useMemo(() => {
    if (!searchQuery) return messages;
    const query = searchQuery.toLowerCase().trim();
    return messages.filter(f => f.name.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  if (!messages || messages.length === 0) return <EmptyState isFiltered={false} />;
  if (filteredFolders.length === 0) return <EmptyState isFiltered={true} />;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 pb-20 w-full animate-fade-in">
        {filteredFolders.map((msg, idx) => {
          const { uid, name } = msg;
          const isMenuOpen = activeMenuIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => onFolderClick && onFolderClick(uid, name)}
              className={`group relative flex flex-col items-center justify-start p-4 pt-5 rounded-2xl cursor-pointer transition-all duration-250 border ${
                isMenuOpen
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-white/[0.025] hover:bg-indigo-500/[0.07] border-transparent hover:border-indigo-500/20'
              }`}
            >
              {/* Context menu trigger */}
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={e => { e.stopPropagation(); setActiveMenuIdx(isMenuOpen ? null : idx); }}
                  className="w-7 h-7 flex flex-col items-center justify-center gap-[2.5px] rounded-lg bg-transparent hover:bg-white/[0.08] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  {[0,1,2].map(i => (
                    <div key={i} className="w-[3px] h-[3px] bg-slate-400 rounded-full" />
                  ))}
                </button>
                {isMenuOpen && (
                  <ContextMenu
                    onRename={() => onRenameClick({ uid, name })}
                    onDelete={() => onDeleteClick({ uid, name })}
                    onClose={() => setActiveMenuIdx(null)}
                  />
                )}
              </div>

              {/* Folder icon */}
              <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FolderIcon size={72} />
              </div>

              {/* Name */}
              <h3 className="text-slate-300 group-hover:text-slate-100 text-[13px] font-medium text-center leading-tight mt-3.5 line-clamp-2 px-1 break-all w-full transition-colors">
                {name}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Background click-to-close context menus */}
      {activeMenuIdx !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenuIdx(null)}
        />
      )}
    </>
  );
}
