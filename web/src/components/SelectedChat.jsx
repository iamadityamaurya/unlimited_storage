import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import StorageGrid from "./StorageGrid";
import FolderView from "./FolderView";

export default function SelectedChat({ selectedChat, onClearChat, onLogOut }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Drill-down State mapping
  const [activeFolder, setActiveFolder] = useState(null);
  
  // File Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");

        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        
        let entityStr = selectedChat.id;
        if (/^-?\d+$/.test(entityStr)) {
          // It's purely numerical, acceptable for GramJS
        }
        
        // Ask Telegram to only send messages matching our storage naming convention
        const history = await client.getMessages(entityStr, { 
          limit: 30,
          search: "_File" 
        });
        
        if (active) {
          // Also explicitly filter out any messages that contain attached media/files/images natively
          const filteredHistory = history.filter(msg => 
            msg.message && 
            msg.message.includes("_File") &&
            !msg.media
          );
          setMessages(filteredHistory);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load generic chat stream", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchMessages();
    return () => { active = false; };
  }, [selectedChat.id]);

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      setIsCreating(true);
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      
      const client = await getConnectedClient(apiId, apiHash, token);
      
      const finalPayload = newFileName.trim() + "_File";
      let entityStr = selectedChat.id;

      // Dispatch payload to MTProto securely
      await client.sendMessage(entityStr, { message: finalPayload });

      // Optimistically push to Grid without waiting for a re-fetch block
      const newMsg = {
        message: finalPayload,
        date: Math.floor(Date.now() / 1000),
        id: Math.floor(Math.random() * 9999999)
      };
      
      setMessages([newMsg, ...messages]);
      setNewFileName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to dispatch file creation string", err);
      alert("API Dispatch Error: Check Console.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent flex flex-col transition-all">
      {/* Sticky Top Navigation Dashboard Header */}
      <div className="sticky top-0 z-50 w-full h-16 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-6 lg:px-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center border border-[#444]">
            <span className="text-white font-bold font-mono text-xs">
              {selectedChat.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-200 tracking-tight">
            {selectedChat.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded transition-colors duration-200 text-xs font-bold border border-yellow-400 shadow-sm flex items-center gap-1 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create File
          </button>
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 rounded transition-colors duration-200 text-xs font-medium border border-[#444]"
          >
            Switch Drive
          </button>
          <button
            onClick={onLogOut}
            className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded transition-colors duration-200 text-xs font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col relative z-0">
        {!activeFolder && (
          <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-300">
            <h1 className="text-xl font-semibold text-gray-200 tracking-tight">My Files</h1>
            <span className="text-sm font-medium text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
              {messages.length} Items Indexed
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full w-full opacity-70 min-h-[400px]">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 text-sm font-medium">Indexing filesystem blocks...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 h-full w-full p-6 text-center min-h-[400px]">
            <p className="text-red-400 font-medium bg-red-900/20 p-5 rounded-lg border border-red-900/50 shadow-sm">
              Fatal error resolving directory linkage mapping entity scope. Please select an alternative storage peer.
            </p>
          </div>
        ) : activeFolder ? (
          <FolderView 
            selectedChat={selectedChat} 
            folderName={activeFolder} 
            onBack={() => setActiveFolder(null)} 
          />
        ) : (
          <StorageGrid messages={messages} onFolderClick={setActiveFolder} />
        )}
      </div>

      {/* Create File Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateFile} 
            className="w-full max-w-sm bg-[#252525] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-1">Create New File</h3>
              <p className="text-gray-400 text-xs mb-5">Instanciate a new datastream node into the active Telegram drive.</p>
              
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Folder or File Array Name"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
                required
              />
            </div>
            
            <div className="bg-[#1e1e1e] px-6 py-4 border-t border-[#333] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newFileName.trim()}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] flex justify-center items-center"
              >
                {isCreating ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Create Node"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
