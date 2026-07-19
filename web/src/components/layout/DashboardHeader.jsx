import React from 'react';

export default function DashboardHeader({
  chatName,
  activeFolder,
  searchQuery,
  onSearchChange,
  onOpenAnalytics,
  onOpenCreateModal,
  onOpenUploadModal,
  onClearChat,
  onLogOut,
}) {
  return (
    <div className="sticky top-0 z-50 w-full h-16 glass border-b border-white/[0.07] flex items-center justify-between px-6 lg:px-8 shadow-lg shadow-black/30">

      {/* Left: Brand + Chat name */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Drive</p>
          <h2 className="text-sm font-semibold text-slate-200 tracking-tight truncate max-w-[120px] md:max-w-[200px] lg:max-w-sm">
            {chatName}
          </h2>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-xs mx-4 hidden sm:block">
        <div className="relative">
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={activeFolder ? "Search files..." : "Search folders..."}
            className="w-full px-3.5 py-1.5 pl-8 text-xs bg-[#0d0f1c] hover:bg-white/[0.04] focus:bg-[#0d0f1c] border border-white/[0.08] hover:border-white/[0.12] focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
          />
          <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all duration-200 active:scale-95"
          title="Analyze unmetered storage usage"
        >
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <span className="hidden md:inline">Analytics</span>
        </button>

        {!activeFolder ? (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Folder
          </button>
        ) : (
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
        )}

        <button
          onClick={onClearChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all duration-200 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="hidden lg:inline">Switch Drive</span>
        </button>
        <button
          onClick={onLogOut}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all duration-200 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden lg:inline">Disconnect</span>
        </button>
      </div>
    </div>
  );
}
