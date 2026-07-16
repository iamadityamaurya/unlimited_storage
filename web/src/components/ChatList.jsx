import React from "react";

export default function ChatList({ chats, onSelectChat, onLogOut, errorMsg }) {
  return (
    <div className="glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/[0.07]">
        <div className="flex items-start justify-between">
          <div>
            {/* Brandmark */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-indigo-400 tracking-widest uppercase">Unlimited Storage</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Select a Drive</h1>
            <p className="text-slate-500 text-sm mt-1">Choose a chat or channel to use as cloud storage.</p>
          </div>
          <button
            onClick={onLogOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all duration-200 active:scale-95 mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mx-8 mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-scale-in">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Chat list */}
      <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {chats.length === 0 && !errorMsg ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
            </div>
            <p className="text-slate-500 text-sm">Scanning dialogues…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all duration-200 text-left active:scale-[0.99]"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/50 to-violet-600/50 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-600 group-hover:to-violet-600 transition-all duration-200">
                  <span className="text-white font-bold text-sm leading-none">
                    {chat.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                {/* Name */}
                <span className="text-slate-300 font-medium text-[0.9375rem] truncate flex-1 group-hover:text-slate-100 transition-colors">
                  {chat.name}
                </span>
                {/* Arrow */}
                <svg className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-white/[0.05]">
        <p className="text-xs text-slate-700 text-center">
          {chats.length} {chats.length === 1 ? 'dialogue' : 'dialogues'} loaded
        </p>
      </div>
    </div>
  );
}
