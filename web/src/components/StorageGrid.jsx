import React from 'react';
import { FolderIcon } from './icons/Icons';

export default function StorageGrid({ messages, onFolderClick }) {
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 sm:gap-4 pb-20 w-full">
      {messages.map((msg, idx) => {
        // Extract the name natively breaking out everything after "_File"
        const rawName = msg.message || "";
        const displayName = rawName.split('_File')[0].trim() || "Unknown";

        return (
          <div 
            key={idx} 
            onClick={() => onFolderClick && onFolderClick(displayName)}
            className="group flex flex-col items-center justify-start p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors duration-150 cursor-pointer"
          >
            {/* Raw Icon Frame - No containers or borders */}
            <div className="w-16 h-16 flex items-center justify-center group-active:scale-95 transition-transform duration-150">
               <FolderIcon />
            </div>

            {/* Strict Name Text aligned underneath */}
            <h3 className="text-gray-300 text-xs font-medium text-center leading-tight mt-2 line-clamp-2 px-1 break-all w-full">
              {displayName}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
