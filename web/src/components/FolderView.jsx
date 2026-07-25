import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import FileThumbnail from "./FileThumbnail";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// ─── Sort button ──────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: "date-desc", label: "Newest first",  b: "date", o: "desc" },
  { id: "date-asc",  label: "Oldest first",  b: "date", o: "asc"  },
  { id: "name-asc",  label: "Name A→Z",      b: "name", o: "asc"  },
  { id: "name-desc", label: "Name Z→A",      b: "name", o: "desc" },
  { id: "size-desc", label: "Largest first", b: "size", o: "desc" },
  { id: "size-asc",  label: "Smallest first",b: "size", o: "asc"  },
];

const getFileDisplayName = (msg, folderUID) => {
  if (!msg) return "Unnamed File";
  const text = (msg.message || "").trim();
  
  // If in a specific folder, strip that specific suffix
  if (folderUID && folderUID !== "uncategorised") {
    const suffix = `_${folderUID}`;
    if (text.endsWith(suffix)) {
      return text.substring(0, text.length - suffix.length).trim() || "Unnamed File";
    }
  }

  // General fallback: check if it ends with _<6-digit-number> or any underscore-separated suffix that resembles a folder UID
  const lastUnderscoreIdx = text.lastIndexOf("_");
  if (lastUnderscoreIdx !== -1) {
    const potentialUid = text.substring(lastUnderscoreIdx + 1).trim();
    // Folder UIDs are 6-digit numeric codes
    if (/^\d{6}$/.test(potentialUid)) {
      return text.substring(0, lastUnderscoreIdx).trim() || "Unnamed File";
    }
  }

  // Fallback: check document name attribute if text is empty
  if (!text && msg.media?.document?.attributes) {
    const fileAttr = msg.media.document.attributes.find(
      attr => attr.className === "DocumentAttributeFilename" || attr.fileName
    );
    if (fileAttr && fileAttr.fileName) return fileAttr.fileName;
  }

  return text || "Unnamed File";
};

export default function FolderView({
  selectedChat,
  folderName,
  folderUID,
  folders,
  refreshTrigger,
  searchQuery,
  onBack,
  onOpenUploadModal,
  onOpenFileDelete,
}) {
  const navigate = useNavigate();
  const [files, setFiles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sortBy, setSortBy]         = useState("date");
  const [sortOrder, setSortOrder]   = useState("desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [activeMenuIdx, setActiveMenuIdx]       = useState(null);
  const [downloadingIdx, setDownloadingIdx]     = useState(null);

  // Filter first, then sort
  const processedFiles = React.useMemo(() => {
    let result = [...files];

    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(f => {
        const displayName = getFileDisplayName(f, folderUID).toLowerCase();
        return displayName.includes(query);
      });
    }

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "name") {
        const na = getFileDisplayName(a, folderUID).toLowerCase();
        const nb = getFileDisplayName(b, folderUID).toLowerCase();
        return sortOrder === "asc" ? na.localeCompare(nb) : nb.localeCompare(na);
      }
      if (sortBy === "date") {
        return sortOrder === "asc" ? a.date - b.date : b.date - a.date;
      }
      if (sortBy === "size") {
        const sa = a.media?.document?.size || 0;
        const sb = b.media?.document?.size || 0;
        return sortOrder === "asc" ? sa - sb : sb - sa;
      }
      return 0;
    });
  }, [files, searchQuery, sortBy, sortOrder, folderUID]);

  const activeSortLabel = SORT_OPTIONS.find(o => o.b === sortBy && o.o === sortOrder)?.label || "Sort";

  const handleDownloadFile = async (msg, displayName, idx) => {
    try {
      setActiveMenuIdx(null);
      setDownloadingIdx(idx);
      const apiId   = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token   = getCookie("telegram_token");
      const client  = await getConnectedClient(apiId, apiHash, token);
      const buffer  = await client.downloadMedia(msg);
      if (buffer) {
        let mimeType = "application/octet-stream";
        if (msg.media.document?.mimeType) mimeType = msg.media.document.mimeType;
        else if (msg.media.photo) {
          mimeType = "image/jpeg";
          if (!displayName.toLowerCase().match(/\.(jpg|jpeg)$/)) displayName += ".jpg";
        }
        const blob = new Blob([buffer], { type: mimeType });
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = displayName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(link); }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingIdx(null);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const apiId   = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token   = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;
        const client    = await getConnectedClient(apiId, apiHash, token);
        const entityStr = selectedChat.id;

        let allMessages = [];
        if (folderUID === "uncategorised") {
          // Fetch the recent history. For uncategorised, we fetch up to 1000 messages
          // to make sure we cover a good window of files in the chat.
          allMessages = await client.getMessages(entityStr, { limit: 1000 });
        } else {
          const suffix    = `_${folderUID}`;
          const [searchHistory, recentHistory] = await Promise.all([
            client.getMessages(entityStr, { limit: 10000, search: suffix }),
            client.getMessages(entityStr, { limit: 300 }),
          ]);
          allMessages = [...recentHistory, ...searchHistory];
        }

        const uniqueMap = new Map();
        allMessages.forEach(msg => {
          if (msg && !uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });

        if (active) {
          let filtered = [];
          if (folderUID === "uncategorised") {
            // Get all active folder UIDs from folders prop
            const folderUids = new Set(
              (folders || [])
                .map(f => f.uid)
                .filter(uid => uid && uid !== "uncategorised")
            );

            filtered = Array.from(uniqueMap.values()).filter(msg => {
              if (!msg.media) return false;
              if (msg.message && msg.message.includes("###_UNLIMITED_STORAGE_INDEX_###")) return false;
              
              const text = (msg.message || "").trim();
              const lastUnderscoreIdx = text.lastIndexOf("_");
              if (lastUnderscoreIdx !== -1) {
                const potentialUid = text.substring(lastUnderscoreIdx + 1).trim();
                // If the suffix is an existing folder's UID, it belongs to that folder (not uncategorised)
                if (folderUids.has(potentialUid)) {
                  return false;
                }
              }
              return true;
            });
          } else {
            const suffix = `_${folderUID}`;
            filtered = Array.from(uniqueMap.values()).filter(
              msg => msg.message && msg.message.trim().endsWith(suffix) && msg.media
            );
          }
          setFiles(filtered);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };
    fetchFiles();
    return () => { active = false; };
  }, [selectedChat.id, folderUID, folders, refreshTrigger]);

  return (
    <div className="flex-1 w-full flex flex-col pt-2 animate-fade-in relative">

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
        {/* Back */}
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-400 hover:text-slate-200 transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Folder name */}
        <h2 className="text-lg font-semibold text-slate-100 tracking-tight truncate flex-1">
          {folderName}
        </h2>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Upload */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {activeSortLabel}
            </button>
            {sortMenuOpen && (
              <div className="absolute top-11 right-0 w-44 bg-[#111320] border border-white/[0.1] shadow-2xl rounded-2xl py-2.5 z-[70] animate-scale-in">
                <div className="px-4 pb-2 mb-1 border-b border-white/[0.06]">
                  <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest">Sort by</span>
                </div>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.b); setSortOrder(opt.o); setSortMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      sortBy === opt.b && sortOrder === opt.o
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Count badge */}
          <span className="text-xs font-medium text-slate-500 bg-white/[0.04] border border-white/[0.07] px-3 py-2 rounded-xl">
            {files.length} files
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
          </div>
          <p className="text-slate-500 text-sm">Loading files…</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-slate-300 font-semibold">No files here yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Upload files into this folder to get started.
            </p>
          </div>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 mt-2 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Files
          </button>
        </div>
      ) : processedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-300 font-semibold">No matching files</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your search query.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 pb-20 w-full">
          {processedFiles.map((msg, idx) => {
            const displayName = getFileDisplayName(msg, folderUID);
            let fileSize = "—";
            if (msg.media?.document?.size) fileSize = formatBytes(msg.media.document.size);
            else if (msg.media?.photo) fileSize = "Image";
            const isImg = msg.media?.photo || (msg.media?.document?.mimeType || "").startsWith("image/");
            const isMenuOpen = activeMenuIdx === idx;

            return (
              <div
                key={idx}
                onClick={() => { isImg ? navigate(`/drive/${selectedChat.id}/folder/${folderUID}/file/${msg.id}`) : handleDownloadFile(msg, displayName, idx); }}
                className={`group relative flex flex-col items-center justify-start p-4 pt-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isMenuOpen
                    ? 'bg-indigo-500/10 border-indigo-500/30 z-50'
                    : 'bg-white/[0.025] hover:bg-indigo-500/[0.07] border-transparent hover:border-indigo-500/20 z-0'
                }`}
              >
                {/* Context menu area */}
                <div className={`absolute top-2 right-2 ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                  {downloadingIdx === idx ? (
                    <div className="w-7 h-7 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin-smooth" />
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setActiveMenuIdx(isMenuOpen ? null : idx); }}
                      className="w-7 h-7 flex flex-col items-center justify-center gap-[2.5px] rounded-lg bg-transparent hover:bg-white/[0.08] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      {[0,1,2].map(i => (
                        <div key={i} className="w-[3px] h-[3px] bg-slate-400 rounded-full" />
                      ))}
                    </button>
                  )}

                  {isMenuOpen && (
                    <div
                      className="absolute top-9 right-0 w-36 bg-[#111320] border border-white/[0.1] shadow-2xl rounded-xl py-2 z-50 animate-scale-in"
                      onMouseLeave={() => setActiveMenuIdx(null)}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); handleDownloadFile(msg, displayName, idx); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onOpenFileDelete(msg); setActiveMenuIdx(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                  <FileThumbnail msg={msg} />
                </div>

                {/* Name */}
                <h3 className="text-slate-300 group-hover:text-slate-100 text-[13px] font-medium text-center leading-tight mt-3.5 line-clamp-2 px-1 break-all w-full transition-colors pointer-events-none">
                  {displayName}
                </h3>
                <span className="text-slate-600 text-[11px] mt-1.5 font-mono pointer-events-none">{fileSize}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Background closer */}
      {(activeMenuIdx !== null || sortMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setActiveMenuIdx(null); setSortMenuOpen(false); }}
        />
      )}
    </div>
  );
}
