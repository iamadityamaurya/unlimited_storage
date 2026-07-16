import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";

const extensionConfig = {
  pdf:  { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    label: "PDF"  },
  zip:  { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", label: "ZIP"  },
  rar:  { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", label: "RAR"  },
  doc:  { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   label: "DOC"  },
  docx: { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   label: "DOCX" },
  xls:  { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  label: "XLS"  },
  xlsx: { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  label: "XLSX" },
  txt:  { bg: "bg-slate-500/10",  border: "border-slate-500/20",  text: "text-slate-400",  label: "TXT"  },
  exe:  { bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",label: "EXE"  },
  apk:  { bg: "bg-teal-500/10",   border: "border-teal-500/20",   text: "text-teal-400",   label: "APK"  },
  mp4:  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", label: "MP4"  },
  mkv:  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", label: "MKV"  },
  mp3:  { bg: "bg-pink-500/10",   border: "border-pink-500/20",   text: "text-pink-400",   label: "MP3"  },
  wav:  { bg: "bg-pink-500/10",   border: "border-pink-500/20",   text: "text-pink-400",   label: "WAV"  },
  default: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", label: "FILE" },
};

export default function FileThumbnail({ msg }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = React.useMemo(() => {
    if (!msg?.media) return false;
    if (msg.media.photo) return true;
    const mime = msg.media.document?.mimeType || "";
    return mime.startsWith("image/") && !mime.includes("svg");
  }, [msg]);

  const extension = React.useMemo(() => {
    if (!msg?.message) return "default";
    const parts = msg.message.split(".");
    if (parts.length < 2) return "default";
    const ext = parts[parts.length - 1].split("_")[0].toLowerCase();
    return extensionConfig[ext] ? ext : "default";
  }, [msg]);

  const cfg = extensionConfig[extension];

  useEffect(() => {
    if (!isImage) { setIsLoading(false); return; }
    let active = true;
    const fetchThumb = async () => {
      try {
        const apiId   = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token   = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;
        const client = await getConnectedClient(apiId, apiHash, token);
        let buffer = await client.downloadMedia(msg, { thumb: 1 });
        if (!buffer) buffer = await client.downloadMedia(msg, { thumb: 0 });
        if (active && buffer) {
          const blob = new Blob([buffer], { type: "image/jpeg" });
          setThumbSrc(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.debug("Thumbnail skip:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchThumb();
    return () => { active = false; };
  }, [msg, isImage]);

  // Image thumbnail
  if (isImage && (isLoading || thumbSrc)) {
    return (
      <div className="w-20 h-20 flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden border border-white/[0.07] shadow-lg">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full animate-spin-smooth" />
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

  // File type icon
  return (
    <div className={`w-20 h-20 flex flex-col items-center justify-center relative rounded-2xl border ${cfg.bg} ${cfg.border} shadow-md`}>
      <svg className={`w-9 h-9 ${cfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      {/* Extension badge */}
      <div className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${cfg.text} bg-[#0d0f1c] border ${cfg.border} shadow-md`}>
        {cfg.label}
      </div>
    </div>
  );
}
