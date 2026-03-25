import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import FilePreview from "./FilePreview";
import FileViewerModal from "./modals/FileViewerModal";

const formatBytes = (bytes) => {
  if (!bytes) return "Unknown Size";
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FolderView({ selectedChat, folderName, refreshTrigger, onBack }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // High-Resolution Viewer State Hooks natively isolating modal rendering cleanly
  const [activePreviewMsg, setActivePreviewMsg] = useState(null);

  // Context Menu Actions
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);
  const [downloadingIdx, setDownloadingIdx] = useState(null);

  const handleDownloadFile = async (msg, displayName, idx) => {
    try {
      setActiveMenuIdx(null);
      setDownloadingIdx(idx);
      
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      const client = await getConnectedClient(apiId, apiHash, token);
      
      const buffer = await client.downloadMedia(msg);
      
      if (buffer) {
        let mimeType = "application/octet-stream";
        if (msg.media.document && msg.media.document.mimeType) {
          mimeType = msg.media.document.mimeType;
        } else if (msg.media.photo) {
          mimeType = "image/jpeg";
          // Append extensions safely predicting MTProto mapping omissions
          if (!displayName.toLowerCase().endsWith(".jpg") && !displayName.toLowerCase().endsWith(".jpeg")) {
            displayName = displayName + ".jpg";
          }
        }

        const blob = new Blob([buffer], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        // Native hidden DOM Link structure mapping direct download behaviors universally
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = displayName;
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
           window.URL.revokeObjectURL(url);
           document.body.removeChild(link);
        }, 100);
      }
    } catch (err) {
      console.error("Failed to execute native byte-download cleanly:", err);
      // Failsafe error display eliminating broken execution streams natively
    } finally {
      setDownloadingIdx(null);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        let entityStr = selectedChat.id;
        
        const suffix = `_${folderName}`;
        
        // Query both realtime and asynchronous historic backend layers eliminating 5-minute index delay
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(entityStr, { limit: 100, search: suffix }),
          client.getMessages(entityStr, { limit: 100 })
        ]);
        
        const combinedHistory = [...recentHistory, ...searchHistory];
        const uniqueMap = new Map();
        combinedHistory.forEach(msg => {
           if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });
        const history = Array.from(uniqueMap.values());
        
        if (active) {
          const filtered = history.filter(msg => 
            msg.message && 
            msg.message.trim().endsWith(suffix) && 
            msg.media 
          ).sort((a, b) => b.date - a.date);
          
          setFiles(filtered);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load generic file stream", err);
        if (active) setLoading(false);
      }
    };
    fetchFiles();
    return () => { active = false; };
  }, [selectedChat.id, folderName, refreshTrigger]);

  return (
    <div className="flex-1 w-full flex flex-col pt-2 animate-in fade-in duration-300 relative">
      <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded-lg transition-colors text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-200 tracking-tight">{folderName}</h2>
        <span className="text-sm font-medium text-gray-400 ml-auto bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
            {files.length} Internal Files
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full opacity-70 min-h-[400px]">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-yellow-500 text-sm font-medium">Resolving raw file blocks...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center opacity-70">
          <FilePreview msg={null} />
          <p className="text-gray-300 font-medium text-lg mt-4 mb-1">No Files Found</p>
          <p className="text-gray-500 text-sm">Upload media or documents ending strictly with _{folderName} in Telegram.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 sm:gap-4 pb-20 w-full">
          {files.map((msg, idx) => {
            const displayName = msg.message.split(`_${folderName}`)[0].trim() || "Unnamed File";
            
            // Render physical metrics natively processing buffers locally
            let fileSize = "Unknown Size";
            let typeLabel = "FILE";
            
            if (msg.media) {
               if (msg.media.document && msg.media.document.size) {
                 fileSize = formatBytes(msg.media.document.size);
                 typeLabel = (msg.media.document.mimeType || "").split('/')[1] || "DOC";
               } else if (msg.media.photo) {
                 fileSize = "Image";
                 typeLabel = "JPG";
               }
            }

            return (
              <div 
                key={idx} 
                onClick={() => setActivePreviewMsg(msg)}
                className={`group flex flex-col items-center justify-start p-3 rounded-xl hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors duration-150 cursor-pointer relative ${activeMenuIdx === idx ? 'z-50' : 'z-0'}`}
              >
                {/* Independent Context Menu Layout */}
                <div className="absolute top-1 right-1 z-[60]">
                  {downloadingIdx === idx ? (
                    <div className="w-6 h-6 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm shadow-sm border border-[#444]">
                       <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(idx === activeMenuIdx ? null : idx); }}
                      className="w-6 h-6 flex flex-col items-center justify-center gap-[2px] bg-black/40 hover:bg-black/80 rounded-full transition-all text-white opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-transparent hover:border-[#555]"
                    >
                      <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
                      <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
                      <div className="w-[3px] h-[3px] bg-gray-200 rounded-full"></div>
                    </button>
                  )}

                  {activeMenuIdx === idx && (
                    <div 
                       className="absolute top-8 right-0 bg-[#252525] border border-[#444] shadow-2xl rounded-lg w-36 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                       onMouseLeave={() => setActiveMenuIdx(null)}
                    >
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleDownloadFile(msg, displayName, idx); }}
                         className="w-full text-left px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-yellow-500 transition-colors flex items-center gap-2"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                         Download
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-16 h-16 flex items-center justify-center group-active:scale-95 transition-transform duration-150 relative pointer-events-none">
                   <FilePreview msg={msg} />
                   {/* File formatting physical structural tags natively embedded visually */}
                   <div className="absolute -bottom-1 right-0 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm z-10 uppercase max-w-[44px] truncate shadow-sm">
                      {typeLabel}
                   </div>
                </div>
                <h3 className="text-gray-300 text-xs font-medium text-center leading-tight mt-2 line-clamp-2 px-1 break-all w-full group-hover:text-yellow-500 transition-colors pointer-events-none">
                  {displayName}
                </h3>
                <span className="text-[#888] text-[9px] mt-1 font-mono pointer-events-none">{fileSize}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Background Context Menu Closer mapping cleanly across grid layouts */}
      {activeMenuIdx !== null && (
         <div className="fixed inset-0 z-40 bg-transparent" onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(null); }}></div>
      )}

      <FileViewerModal 
         msg={activePreviewMsg} 
         onClose={() => setActivePreviewMsg(null)} 
      />
    </div>
  );
}
