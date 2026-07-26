import React, { useState } from 'react';
import { FolderIcon } from './icons/Icons';

// ─── Context menu ─────────────────────────────────────────────
function ContextMenu({ onSelect, onRename, onDelete, onClose, isSelected }) {
  return (
    <div
      className="absolute top-9 right-0 w-36 bg-[#111320] border border-white/[0.1] shadow-2xl rounded-2xl py-2 z-50 animate-scale-in"
    >
      <button
        onClick={e => { e.stopPropagation(); onSelect(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isSelected ? 'Deselect' : 'Select'}
      </button>
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
export default function StorageGrid({
  messages,
  searchQuery,
  onFolderClick,
  onRenameClick,
  onDeleteClick,
  selectedUIDs = new Set(),
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
}) {
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuIdx !== null) {
        if (!event.target.closest('.context-menu-container')) {
          setActiveMenuIdx(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [activeMenuIdx]);

  const filteredFolders = React.useMemo(() => {
    if (!searchQuery) return messages;
    const query = searchQuery.toLowerCase().trim();
    return messages.filter(f => f.name.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  const validFolders = React.useMemo(() => {
    return filteredFolders.filter(f => f.uid !== "uncategorised");
  }, [filteredFolders]);

  const isSelectionMode = selectedUIDs.size > 0;
  const isAllSelected = validFolders.length > 0 && validFolders.every(f => selectedUIDs.has(f.uid));

  if (!messages || messages.length === 0) return <EmptyState isFiltered={false} />;
  if (filteredFolders.length === 0) return <EmptyState isFiltered={true} />;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 pb-24 w-full animate-fade-in">
        {filteredFolders.map((msg, idx) => {
          const { uid, name } = msg;
          const isMenuOpen = activeMenuIdx === idx;
          const isSelected = selectedUIDs.has(uid);

          const handleCardClick = () => {
            if (isSelectionMode && uid !== "uncategorised") {
              onToggleSelect && onToggleSelect(uid);
            } else if (onFolderClick) {
              onFolderClick(uid, name);
            }
          };

          return (
            <div
              key={idx}
              onClick={handleCardClick}
              className={`group relative flex flex-col items-center justify-start p-4 pt-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/15 scale-[1.02] z-10'
                  : isMenuOpen
                  ? 'bg-indigo-500/10 border-indigo-500/30 z-50'
                  : 'bg-white/[0.025] hover:bg-indigo-500/[0.07] border-transparent hover:border-indigo-500/20 z-0'
              }`}
            >
              {/* Selected Badge Indicator (only shown when selected or in selection mode) */}
              {uid !== "uncategorised" && isSelected && (
                <div className="absolute top-2.5 left-2.5 z-30 w-5 h-5 rounded-lg bg-indigo-600 border border-indigo-400 text-white shadow-md shadow-indigo-500/40 flex items-center justify-center animate-scale-in">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Selection Mode Unselected Badge */}
              {uid !== "uncategorised" && isSelectionMode && !isSelected && (
                <div className="absolute top-2.5 left-2.5 z-30 w-5 h-5 rounded-lg bg-white/[0.05] border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500/40" />
                </div>
              )}

              {/* Context menu trigger */}
              {uid !== "uncategorised" && (
                <div 
                  onClick={e => e.stopPropagation()}
                  className={`context-menu-container absolute top-2 right-2 ${isMenuOpen ? 'z-50' : 'z-20'}`}
                >
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
                      isSelected={isSelected}
                      onSelect={() => onToggleSelect && onToggleSelect(uid)}
                      onRename={() => onRenameClick({ uid, name })}
                      onDelete={() => onDeleteClick({ uid, name })}
                      onClose={() => setActiveMenuIdx(null)}
                    />
                  )}
                </div>
              )}

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

      {/* Floating Bulk Action Bar */}
      {selectedUIDs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#111320] border border-white/[0.12] shadow-2xl shadow-black/80 animate-scale-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              {selectedUIDs.size} {selectedUIDs.size === 1 ? 'folder' : 'folders'} selected
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={() => onSelectAll && onSelectAll(validFolders.map(f => f.uid))}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-1"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>

          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-semibold transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>

          <button
            onClick={onClearSelection}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            title="Exit selection mode"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}


    </>
  );
}
