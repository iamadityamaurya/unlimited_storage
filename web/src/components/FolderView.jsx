import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import FilePreview from "./FilePreview";

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
        
        // Fetch up to 100 recent matching payload entities filtered purely by our suffix marker
        const history = await client.getMessages(entityStr, { 
          limit: 100,
          search: suffix
        });
        
        if (active) {
          // Strictly mandate parsing media arrays rejecting empty comments that lack underlying physical drive files natively
          // Accommodations implemented stripping hidden whitespace elements gracefully.
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
    <div className="flex-1 w-full flex flex-col pt-2 animate-in fade-in duration-300">
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
                className="group flex flex-col items-center justify-start p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors duration-150 cursor-pointer"
              >
                <div className="w-16 h-16 flex items-center justify-center group-active:scale-95 transition-transform duration-150 relative">
                   <FilePreview msg={msg} />
                   {/* File formatting physical structural tags natively embedded visually */}
                   <div className="absolute -bottom-1 right-0 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm z-10 uppercase max-w-[44px] truncate shadow-sm">
                      {typeLabel}
                   </div>
                </div>
                <h3 className="text-gray-300 text-xs font-medium text-center leading-tight mt-2 line-clamp-2 px-1 break-all w-full group-hover:text-yellow-500 transition-colors">
                  {displayName}
                </h3>
                <span className="text-[#888] text-[9px] mt-1 font-mono">{fileSize}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
