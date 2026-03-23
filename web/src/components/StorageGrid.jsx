import React from 'react';

// A classic OS Folder icon matching Linux/Windows aesthetics. (Yellow folder, Gray body)
const FolderIcon = () => (
  <svg 
    className="w-16 h-16 drop-shadow-sm transition-transform duration-200" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dark Back Tab */}
    <path 
      d="M40 12H22L18 6H8C5.8 6 4 7.8 4 10V38C4 40.2 5.8 42 8 42H40C42.2 42 44 40.2 44 38V16C44 13.8 42.2 12 40 12Z" 
      fill="#d4af37" 
    />
    {/* Light Front Body */}
    <path 
      d="M40 15.5H8C6.34315 15.5 5 16.8431 5 18.5V39C5 40.6569 6.34315 42 8 42H40C41.6569 42 43 40.6569 43 39V18.5C43 16.8431 41.6569 15.5 40 15.5Z" 
      fill="#facc15" 
    />
    {/* Subtle Inner Line for depth */}
    <path 
      d="M4 18.5V17C4 16.4477 4.44772 16 5 16H43C43.5523 16 44 16.4477 44 17V18.5H4Z" 
      fill="#eab308" 
    />
  </svg>
);

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
