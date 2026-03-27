import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";

const extensionConfig = {
  pdf: { color: "bg-red-500/10", border: "border-red-500/20", text: "text-red-500", icon: "PDF" },
  zip: { color: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500", icon: "ZIP" },
  rar: { color: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500", icon: "RAR" },
  doc: { color: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500", icon: "DOC" },
  docx: { color: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500", icon: "DOCX" },
  txt: { color: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400", icon: "TXT" },
  exe: { color: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "EXE" },
  apk: { color: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", icon: "APK" },
  mp4: { color: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "MP4" },
  mp3: { color: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400", icon: "MP3" },
  default: { color: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400", icon: "FILE" }
};

export default function FileThumbnail({ msg }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to detect if media is a physical image natively
  const isImage = React.useMemo(() => {
    if (!msg || !msg.media) return false;
    if (msg.media.photo) return true;
    if (msg.media.document) {
      const mime = msg.media.document.mimeType || "";
      return mime.startsWith("image/") && !mime.includes("svg");
    }
    return false;
  }, [msg]);

  const extension = React.useMemo(() => {
    if (!msg || !msg.message) return "default";
    const parts = msg.message.split(".");
    if (parts.length < 2) return "default";
    const ext = parts[parts.length - 1].split("_")[0].toLowerCase();
    return extensionConfig[ext] ? ext : "default";
  }, [msg]);

  const config = extensionConfig[extension];

  useEffect(() => {
    if (!isImage) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const fetchThumb = async () => {
      try {
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        let buffer = await client.downloadMedia(msg, { thumb: 1 });
        if (!buffer) buffer = await client.downloadMedia(msg, { thumb: 0 });
        
        if (active && buffer) {
          const blob = new Blob([buffer], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          setThumbSrc(url);
        }
      } catch (err) {
        console.debug("Thumbnail skip (non-critical):", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchThumb();
    return () => { active = false; };
  }, [msg, isImage]);

  if (isImage && (isLoading || thumbSrc)) {
    return (
      <div className="w-20 h-20 flex items-center justify-center relative bg-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-white/5">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-yellow-500/50 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <img 
            src={thumbSrc} 
            alt="Preview" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`w-20 h-20 flex flex-col items-center justify-center border ${config.border} ${config.color} rounded-2xl relative group-active:scale-95 transition-all shadow-md`}>
       {/* High-Resolution Document Motif */}
       <svg className={`w-10 h-10 ${config.text} drop-shadow-lg`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
       </svg>
       {/* Extension Badge Overlay */}
       <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${config.text} bg-[#1a1a1a] border ${config.border} shadow-xl`}>
          {config.icon}
       </div>
    </div>
  );
}
