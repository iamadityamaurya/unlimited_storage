import React from "react";

// ─── Indigo Folder Icon ───────────────────────────────────────
export const FolderIcon = ({ size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-xl transition-transform duration-300"
  >
    {/* Back tab */}
    <path
      d="M40 12H22L18 6H8C5.8 6 4 7.8 4 10V38C4 40.2 5.8 42 8 42H40C42.2 42 44 40.2 44 38V16C44 13.8 42.2 12 40 12Z"
      fill="#4338ca"
    />
    {/* Front body */}
    <path
      d="M40 15.5H8C6.34315 15.5 5 16.8431 5 18.5V39C5 40.6569 6.34315 42 8 42H40C41.6569 42 43 40.6569 43 39V18.5C43 16.8431 41.6569 15.5 40 15.5Z"
      fill="#6366f1"
    />
    {/* Shine line */}
    <path
      d="M4 18.5V17C4 16.4477 4.44772 16 5 16H43C43.5523 16 44 16.4477 44 17V18.5H4Z"
      fill="#818cf8"
    />
    {/* Subtle inner highlight */}
    <path
      d="M10 26H38"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Generic File Icon ────────────────────────────────────────
export const GenericFileIcon = () => (
  <svg
    className="w-20 h-20 drop-shadow-xl transition-transform duration-300 opacity-80 group-hover:opacity-100"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 8C10 5.79086 11.7909 4 14 4H26.5858C27.6467 4 28.6641 4.42143 29.4142 5.17157L36.8284 12.5858C37.5786 13.3359 38 14.3533 38 15.4142V40C38 42.2091 36.2091 44 34 44H14C11.7909 44 10 42.2091 10 40V8Z"
      fill="#1e293b"
    />
    <path d="M26 4V12C26 14.2091 27.7909 16 30 16H38L26 4Z" fill="#334155" />
    <path d="M16 24H32M16 32H28" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
