import React, { useState } from 'react';
import { FolderIcon } from './icons/Icons';

export default function StorageGrid({ messages, onFolderClick, onRenameClick }) {
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-24 text-center">
        <div className="p-8 max-w-md opacity-70">
          <FolderIcon />
          <p className="text-gray-300 font-medium text-lg mt-4 mb-1">Folder is Empty</p>
          <p className="text-gray-500 text-sm">Add files with the suffix matching _File directly inside Telegram to index here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 pb-20 w-full">
      {messages.map((msg, idx) => {
        // Extract the name natively breaking out everything after "_File"
        const rawName = msg.message || "";
        const displayName = rawName.split('_File')[0].trim() || "Unknown";

        return (
          <div 
            key={idx} 
            onClick={() => onFolderClick && onFolderClick(displayName)}
            className="group flex flex-col items-center justify-start p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all duration-300 cursor-pointer relative"
          >
            {/* Context Menu Trigger */}
            <div className="absolute top-2 right-2 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(idx === activeMenuIdx ? null : idx); }}
                className="w-7 h-7 flex flex-col items-center justify-center gap-[2px] bg-black/40 hover:bg-black/80 rounded-full transition-all text-white opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-transparent hover:border-[#555]"
              >
                <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
              </button>

              {activeMenuIdx === idx && (
                <div 
                  className="absolute top-9 right-0 bg-[#252525] border border-[#444] shadow-2xl rounded-xl w-32 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setActiveMenuIdx(null)}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRenameClick(displayName); setActiveMenuIdx(null); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-bold text-gray-300 hover:text-white hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Rename
                  </button>
                </div>
              )}
            </div>

            {/* Raw Icon Frame - No containers or borders */}
            <div className="w-20 h-20 flex items-center justify-center group-active:scale-90 transition-transform duration-300">
               <FolderIcon />
            </div>

            {/* Strict Name Text aligned underneath */}
            <h3 className="text-gray-200 text-[13px] font-bold text-center leading-tight mt-3 line-clamp-2 px-1 break-all w-full group-hover:text-yellow-500 transition-colors">
              {displayName}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
