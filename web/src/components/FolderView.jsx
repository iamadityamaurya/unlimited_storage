import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import FileThumbnail from "./FileThumbnail";
import FileViewerModal from "./modals/FileViewerModal";

const formatBytes = (bytes) => {
  if (!bytes) return "Unknown Size";
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FolderView({ selectedChat, folderName, refreshTrigger, onBack, onOpenUploadModal }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date"); // date, name, size
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  // High-Resolution Viewer State Hooks natively isolating modal rendering cleanly
  const [activePreviewMsg, setActivePreviewMsg] = useState(null);

  // Dynamic Local sorting engine mapping physical metadata without re-fetching
  const sortedFiles = React.useMemo(() => {
    return [...files].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = (a.message.split(`_${folderName}`)[0] || "").toLowerCase();
        const nameB = (b.message.split(`_${folderName}`)[0] || "").toLowerCase();
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortBy === "date") {
        return sortOrder === "asc" ? a.date - b.date : b.date - a.date;
      }
      if (sortBy === "size") {
        const sizeA = a.media?.document?.size || 0;
        const sizeB = b.media?.document?.size || 0;
        return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
      }
      return 0;
    });
  }, [files, sortBy, sortOrder, folderName]);

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
        // 10000 limit ensures the global Telegram server explicitly returns thousands of deeply buried physical elements
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(entityStr, { limit: 10000, search: suffix }),
          client.getMessages(entityStr, { limit: 300 })
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
          );
          
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
        <h2 className="text-xl font-bold text-gray-100 tracking-tight">{folderName}</h2>
        
        <div className="ml-auto flex items-center gap-3">
           <button 
             onClick={onOpenUploadModal}
             className="flex items-center gap-2.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[13px] font-black text-white transition-all shadow-lg shadow-blue-600/10 border border-blue-400/20 active:scale-95"
           >
             <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
             Upload
           </button>

           {/* Local Sorting Dropdown */}
           <div className="relative">
              <button 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-xl text-[13px] font-bold text-gray-300 hover:text-white hover:border-yellow-500 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'} ({sortOrder === 'asc' ? '↑' : '↓'})
              </button>
              
              {isSortMenuOpen && (
                <div className="absolute top-11 right-0 w-40 bg-[#252525] border border-[#444] rounded-2xl shadow-2xl z-[70] py-2.5 animate-in fade-in zoom-in-95 duration-150">
                   <div className="px-5 py-1.5 text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Sort By</div>
                   {[
                     { id: 'date-desc', label: 'Newest', b: 'date', o: 'desc' },
                     { id: 'date-asc', label: 'Oldest', b: 'date', o: 'asc' },
                     { id: 'name-asc', label: 'Name (A-Z)', b: 'name', o: 'asc' },
                     { id: 'name-desc', label: 'Name (Z-A)', b: 'name', o: 'desc' },
                     { id: 'size-desc', label: 'Largest', b: 'size', o: 'desc' },
                     { id: 'size-asc', label: 'Smallest', b: 'size', o: 'asc' },
                   ].map(opt => (
                     <button
                       key={opt.id}
                       onClick={() => { setSortBy(opt.b); setSortOrder(opt.o); setIsSortMenuOpen(false); }}
                       className={`w-full text-left px-5 py-2.5 text-[13px] font-bold transition-colors ${sortBy === opt.b && sortOrder === opt.o ? 'text-yellow-500 bg-yellow-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              )}
           </div>

           <span className="text-sm font-bold text-gray-300 bg-[#1a1a1a] px-3.5 py-1.5 rounded-full border border-[#333]">
               {files.length} Internal Files
           </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full opacity-70 min-h-[400px]">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-yellow-500 text-sm font-bold">Resolving raw file blocks...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center opacity-70">
          <FileThumbnail msg={null} />
          <p className="text-gray-300 font-bold text-lg mt-5 mb-2">No Files Found</p>
          <p className="text-gray-500 text-sm">Upload media or documents ending strictly with _{folderName} in Telegram.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 pb-20 w-full">
          {sortedFiles.map((msg, idx) => {
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
                onClick={() => {
                   const isImg = msg.media?.photo || (msg.media?.document?.mimeType || "").startsWith("image/");
                   if (isImg) {
                     setActivePreviewMsg(msg);
                   } else {
                     handleDownloadFile(msg, displayName, idx);
                   }
                }}
                className={`group flex flex-col items-center justify-start p-4 rounded-2xl hover:bg-zinc-800/80 active:bg-zinc-800 transition-all duration-300 cursor-pointer relative ${activeMenuIdx === idx ? 'z-50' : 'z-0'}`}
              >
                {/* Independent Context Menu Layout */}
                <div className="absolute top-2 right-2 z-[60]">
                  {downloadingIdx === idx ? (
                    <div className="w-7 h-7 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm shadow-sm border border-[#444]">
                       <div className="w-3.5 h-3.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(idx === activeMenuIdx ? null : idx); }}
                      className="w-7 h-7 flex flex-col items-center justify-center gap-[2px] bg-black/40 hover:bg-black/80 rounded-full transition-all text-white opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-transparent hover:border-[#555]"
                    >
                      <div className="w-[3.5px] h-[3.5px] bg-gray-200 rounded-full"></div>
                      <div className="w-[3.5px] h-[3.5px] bg-gray-200 rounded-full"></div>
                      <div className="w-[3.5px] h-[3.5px] bg-gray-200 rounded-full"></div>
                    </button>
                  )}

                  {activeMenuIdx === idx && (
                    <div 
                       className="absolute top-9 right-0 bg-[#252525] border border-[#444] shadow-2xl rounded-xl w-36 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                       onMouseLeave={() => setActiveMenuIdx(null)}
                    >
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleDownloadFile(msg, displayName, idx); }}
                         className="w-full text-left px-4 py-2.5 text-[13px] font-black text-gray-300 hover:text-white hover:bg-yellow-500 transition-colors flex items-center gap-2.5"
                      >
                         <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                         Download
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-20 h-20 flex items-center justify-center group-active:scale-90 transition-transform duration-300 relative pointer-events-none">
                   <FileThumbnail msg={msg} />
                </div>
                <h3 className="text-gray-100 text-[13px] font-bold text-center leading-tight mt-4 line-clamp-2 px-1 break-all w-full group-hover:text-yellow-500 transition-colors pointer-events-none">
                  {displayName}
                </h3>
                <span className="text-[#888] text-[11px] mt-1.5 font-mono font-bold pointer-events-none">{fileSize}</span>
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
