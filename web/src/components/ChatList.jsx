import React from "react";

export default function ChatList({ chats, onSelectChat, onLogOut, errorMsg }) {
  return (
    <div className="relative z-10 w-full max-w-2xl bg-[#252525] rounded-xl border border-[#333] shadow-2xl p-8 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-200 tracking-tight">Your Chats</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Select a chat to use as an unmetered block device.</p>
        </div>
        <button
          onClick={onLogOut}
          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333] text-gray-400 hover:text-red-400 border border-[#333] rounded-lg transition-colors duration-200 text-xs font-semibold"
        >
          Disconnect
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {chats.length === 0 && !errorMsg ? (
          <p className="text-gray-600 text-center py-8 font-medium">Scanning for available datastreams...</p>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => onSelectChat(chat)}
              className="group flex items-center p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#555] hover:bg-[#2a2a2a] active:border-yellow-500/50 transition-all duration-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-[#333] border border-[#444] flex items-center justify-center mr-4 group-active:scale-95 transition-transform duration-200 shadow-sm">
                <span className="text-gray-300 font-bold font-mono text-sm">
                  {chat.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 font-medium truncate flex-1 group-hover:text-gray-100 transition-colors">
                {chat.name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
