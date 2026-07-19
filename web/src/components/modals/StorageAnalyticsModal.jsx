import React, { useEffect, useState } from "react";
import { getCookie } from "../../utils/cookies";
import { getConnectedClient } from "../../telegramApi";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const categoryConfig = {
  images:    { label: "Images",    color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/20" },
  videos:    { label: "Videos",    color: "bg-violet-500",  text: "text-violet-400",  border: "border-violet-500/20" },
  audio:     { label: "Audio",     color: "bg-pink-500",    text: "text-pink-400",    border: "border-pink-500/20" },
  documents: { label: "Documents", color: "bg-blue-500",    text: "text-blue-400",    border: "border-blue-500/20" },
  archives:  { label: "Archives",  color: "bg-orange-500",  text: "text-orange-400",  border: "border-orange-500/20" },
  others:    { label: "Others",    color: "bg-slate-500",   text: "text-slate-400",   border: "border-slate-500/20" },
};

export default function StorageAnalyticsModal({ isOpen, onClose, selectedChat, foldersCount }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats]     = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const scan = async () => {
      try {
        setLoading(true); setError(null);
        const apiId   = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token   = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        const entityStr = selectedChat.id;

        // Scan chat for files. We fetch up to 1500 messages containing suffix format "_UID"
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(entityStr, { limit: 1000, search: "_" }),
          client.getMessages(entityStr, { limit: 500 })
        ]);

        if (!active) return;

        const uniqueMap = new Map();
        [...recentHistory, ...searchHistory].forEach(msg => {
          if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });

        // Filter messages belonging to our app (message text ends with _<6-digit-uid>)
        const appFiles = Array.from(uniqueMap.values()).filter(msg => {
          if (!msg.media) return false;
          const text = (msg.message || "").trim();
          return /_\d{6}$/.test(text);
        });

        // Stats aggregation
        let totalSize = 0;
        const categories = {
          images:    { count: 0, size: 0 },
          videos:    { count: 0, size: 0 },
          audio:     { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          archives:  { count: 0, size: 0 },
          others:    { count: 0, size: 0 },
        };

        const parsedFiles = appFiles.map(msg => {
          let size = 0;
          let mime = "";
          let ext  = "";

          if (msg.media.document) {
            size = msg.media.document.size || 0;
            mime = msg.media.document.mimeType || "";
          } else if (msg.media.photo) {
            mime = "image/jpeg";
            if (msg.media.photo.sizes) {
              const largest = msg.media.photo.sizes[msg.media.photo.sizes.length - 1];
              size = largest.size || (largest.w * largest.h * 0.15) || 300000;
            }
          }

          const rawName = msg.message ? msg.message.split("_")[0] : "Unnamed";
          const parts = rawName.split(".");
          if (parts.length > 1) {
            ext = parts[parts.length - 1].toLowerCase();
          }

          // Category classification
          let cat = "others";
          if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
            cat = "images";
          } else if (mime.startsWith("video/") || ["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) {
            cat = "videos";
          } else if (mime.startsWith("audio/") || ["mp3", "wav", "flac", "ogg", "m4a"].includes(ext)) {
            cat = "audio";
          } else if (
            mime.includes("pdf") ||
            mime.includes("text") ||
            mime.includes("document") ||
            mime.includes("sheet") ||
            ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx", "csv"].includes(ext)
          ) {
            cat = "documents";
          } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
            cat = "archives";
          }

          categories[cat].count += 1;
          categories[cat].size  += size;
          totalSize += size;

          return { name: rawName, size, date: msg.date, category: cat };
        });

        // Get largest files (top 5)
        const largestFiles = [...parsedFiles]
          .sort((a, b) => b.size - a.size)
          .slice(0, 5);

        setStats({
          totalFiles: parsedFiles.length,
          totalSize,
          categories,
          largestFiles,
        });
      } catch (err) {
        console.error("Analytics failure:", err);
        setError(err.message || "Failed to parse drive details.");
      } finally {
        setLoading(false);
      }
    };

    scan();

    return () => { active = false; };
  }, [isOpen, selectedChat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg glass-strong rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07] flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Drive Analytics</h2>
              <p className="text-slate-500 text-xs mt-0.5">Overview of unmetered storage node</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="px-7 py-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Scanning index blocks and history...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-200 font-semibold">Scanning failed</p>
                <p className="text-slate-500 text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Used Space</p>
                  <p className="text-lg font-bold text-slate-200 mt-1 truncate">{formatBytes(stats.totalSize)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Folders</p>
                  <p className="text-lg font-bold text-slate-200 mt-1">{foldersCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Files</p>
                  <p className="text-lg font-bold text-slate-200 mt-1">{stats.totalFiles}</p>
                </div>
              </div>

              {/* Progress Bar Distribution */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Distribution</h3>
                
                {/* Unified Progress Bar */}
                <div className="w-full h-3 rounded-full bg-white/[0.05] overflow-hidden flex">
                  {Object.entries(stats.categories).map(([key, cat]) => {
                    const pct = stats.totalSize > 0 ? (cat.size / stats.totalSize) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={key}
                        style={{ width: `${pct}%` }}
                        className={`h-full ${categoryConfig[key].color}`}
                        title={`${categoryConfig[key].label}: ${formatBytes(cat.size)}`}
                      />
                    );
                  })}
                </div>

                {/* Category Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {Object.entries(stats.categories).map(([key, cat]) => {
                    const cfg = categoryConfig[key];
                    return (
                      <div key={key} className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border ${cfg.border}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${cfg.color} flex-shrink-0`} />
                          <span className="text-xs font-semibold text-slate-300 truncate">{cfg.label}</span>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                          <p className="text-xs font-bold text-slate-200">{formatBytes(cat.size)}</p>
                          <p className="text-[9px] font-medium text-slate-500 mt-0.5">{cat.count} files</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Largest Files List */}
              {stats.largestFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Largest Files</h3>
                  <div className="flex flex-col gap-1.5">
                    {stats.largestFiles.map((file, i) => {
                      const cfg = categoryConfig[file.category];
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg ${cfg.bg || "bg-indigo-500/10"} flex items-center justify-center flex-shrink-0`}>
                              <svg className={`w-4.5 h-4.5 ${cfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-400 font-mono flex-shrink-0">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-10 text-sm">No analysis data loaded.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-white/[0.07] bg-[#0c0d18] flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-500/20 active:scale-95"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
