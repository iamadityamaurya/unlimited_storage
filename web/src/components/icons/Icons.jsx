import React from "react";

// A classic OS Folder icon matching Linux/Windows aesthetics. (Yellow folder, Gray body)
export const FolderIcon = () => (
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

// Generic Flat File Icon used as fallback
export const GenericFileIcon = () => (
  <svg className="w-16 h-16 drop-shadow-sm transition-transform duration-200 opacity-80 group-hover:opacity-100" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8C10 5.79086 11.7909 4 14 4H26.5858C27.6467 4 28.6641 4.42143 29.4142 5.17157L36.8284 12.5858C37.5786 13.3359 38 14.3533 38 15.4142V40C38 42.2091 36.2091 44 34 44H14C11.7909 44 10 42.2091 10 40V8Z" fill="#e5e7eb" />
    <path d="M26 4V12C26 14.2091 27.7909 16 30 16H38L26 4Z" fill="#9ca3af" />
    <path d="M16 24H32M16 32H32M16 40H24" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
