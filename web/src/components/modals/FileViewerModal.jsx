import React, { useEffect, useState } from "react";
import { getCookie } from "../../utils/cookies";
import { getConnectedClient } from "../../telegramApi";

export default function FileViewerModal({ msg, onClose }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Safely evaluate media descriptors dynamically handling missing parameters
  const isImage = msg?.media?.photo || (msg?.media?.document?.mimeType || "").startsWith("image/");
  const isVideo = (msg?.media?.document?.mimeType || "").startsWith("video/");
  // Remove suffix to get physical clean string
  const rawFileName = msg?.message ? msg.message.split("_")[0] : "Unnamed_Binary";

  useEffect(() => {
    let active = true;

    const fetchFullFile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        
        // Native GramJS call executing without arbitrary size parameters inherently grabs the absolute full-quality binary buffer!
        const buffer = await client.downloadMedia(msg);
        
        if (active && buffer) {
          let mimeType = "application/octet-stream";
          if (msg.media.document && msg.media.document.mimeType) {
            mimeType = msg.media.document.mimeType;
          } else if (msg.media.photo) {
            mimeType = "image/jpeg";
          }

          // Directly typecast physical memory chunks safely into native DOM Blob strings for perfect isolated rendering
          const blob = new Blob([buffer], { type: mimeType });
          const url = URL.createObjectURL(blob);
          setFileUrl(url);
        } else if (active) {
            setError("Failed to resolve physical binary stream correctly.");
        }
      } catch (err) {
        console.error("Failed to load full file stream", err);
        if (active) setError(err.message || "Unknown Buffer Error.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (msg) {
      fetchFullFile();
    }

    return () => { active = false; };
  }, [msg]);

  if (!msg) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      
      {/* Background Click-to-Close Handler */}
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={onClose} title="Click anywhere to close"></div>

      {/* Top Utility Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
        <div className="text-white font-semibold text-xl drop-shadow-md truncate max-w-2xl px-2 pointer-events-auto">{rawFileName}</div>
        
        {/* Explicitly Labelled Close Action */}
        <button 
          onClick={onClose} 
          className="px-5 py-2.5 bg-[#1a1a1a]/80 hover:bg-red-500 text-gray-300 hover:text-white font-bold rounded-lg transition-all shadow-xl active:scale-95 flex items-center gap-2 pointer-events-auto border border-[#333] hover:border-red-400/50 backdrop-blur-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Close Viewer
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center pt-10">
           <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl"></div>
           <p className="text-yellow-500 font-bold tracking-tight">Downloading Full-Resolution Pipeline...</p>
        </div>
      ) : error ? (
         <div className="text-red-400 bg-red-950/40 p-6 rounded-2xl border border-red-500/20 text-center shadow-2xl max-w-sm">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-semibold text-lg tracking-tight">System Fetch Failed</p>
            <p className="text-xs mt-2 text-red-400/80">{error}</p>
         </div>
      ) : fileUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 mt-12 max-w-6xl max-h-[90vh]">
            {isImage ? (
               <img src={fileUrl} alt={rawFileName} className="max-w-full max-h-full object-contain rounded shadow-2xl aspect-auto" />
            ) : isVideo ? (
               <video src={fileUrl} controls autoPlay className="max-w-full max-h-full rounded shadow-2xl" />
            ) : (
               <div className="flex flex-col items-center justify-center bg-[#1a1a1a] p-12 rounded-3xl border border-[#333] shadow-2xl">
                  <svg className="w-24 h-24 text-gray-500 mb-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="text-gray-100 font-bold text-2xl mb-2 tracking-tight">Non-Visual Payload</p>
                  <p className="text-gray-500 text-sm mb-8">This file requires an external system application to parse safely.</p>
                  <a href={fileUrl} download={rawFileName} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                     Download Raw Binary
                  </a>
               </div>
            )}
          </div>
      ) : null}
    </div>
  );
}
