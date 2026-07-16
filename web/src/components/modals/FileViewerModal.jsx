import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "../../utils/cookies";
import { getConnectedClient } from "../../telegramApi";

export default function FileViewerModal({ msg: propMsg, onClose }) {
  const { chatId, messageId } = useParams();
  const [resolvedMsg, setResolvedMsg] = useState(propMsg || null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Sync resolvedMsg if propMsg changes
  useEffect(() => {
    if (propMsg) {
      setResolvedMsg(propMsg);
    }
  }, [propMsg]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const apiId   = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token   = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;
        const client = await getConnectedClient(apiId, apiHash, token);

        let targetMsg = resolvedMsg;
        if (!targetMsg && messageId) {
          const messages = await client.getMessages(chatId, { ids: [parseInt(messageId)] });
          if (messages && messages.length > 0) {
            targetMsg = messages[0];
            if (active) setResolvedMsg(targetMsg);
          }
        }

        if (!targetMsg) {
          if (active) setError("File message not found.");
          return;
        }

        const buffer = await client.downloadMedia(targetMsg);
        if (active && buffer) {
          let mime = "application/octet-stream";
          if (targetMsg.media?.document?.mimeType) mime = targetMsg.media.document.mimeType;
          else if (targetMsg.media?.photo) mime = "image/jpeg";
          const blob = new Blob([buffer], { type: mime });
          setFileUrl(URL.createObjectURL(blob));
        } else if (active) {
          setError("Failed to load the file.");
        }
      } catch (err) {
        if (active) setError(err.message || "Unknown error.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [messageId, chatId, resolvedMsg]);

  const isImage = resolvedMsg?.media?.photo || (resolvedMsg?.media?.document?.mimeType || "").startsWith("image/");
  const isVideo = (resolvedMsg?.media?.document?.mimeType || "").startsWith("video/");
  const rawName = resolvedMsg?.message ? resolvedMsg.message.split("_")[0] : "File";

  if (!resolvedMsg && loading) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Resolving file meta from Telegram...</p>
        </div>
      </div>
    );
  }

  if (!resolvedMsg && error) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-200 font-semibold">Failed to resolve file link</p>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 text-sm font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">

      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-10 pointer-events-none">
        <div className="flex items-center gap-3 min-w-0 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
            {isImage ? (
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <span className="text-slate-300 font-medium text-sm truncate max-w-xs">{rawName}</span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-red-500/20 border border-white/[0.1] hover:border-red-500/30 text-slate-400 hover:text-red-400 text-sm font-medium transition-all duration-200 active:scale-95 pointer-events-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>

      {/* Content area */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pt-16 p-8">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
            </div>
            <p className="text-slate-400 text-sm">Downloading file...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-200 font-semibold">Failed to load</p>
              <p className="text-slate-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : fileUrl ? (
          <div className="max-w-6xl max-h-[85vh] w-full flex items-center justify-center">
            {isImage ? (
              <img
                src={fileUrl}
                alt={rawName}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                onClick={e => e.stopPropagation()}
              />
            ) : isVideo ? (
              <video
                src={fileUrl}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl ring-1 ring-white/10"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div
                className="flex flex-col items-center gap-6 p-12 glass-strong rounded-3xl shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-slate-100 font-semibold text-xl">{rawName}</p>
                  <p className="text-slate-500 text-sm mt-1">This file requires an external app to open.</p>
                </div>
                <a
                  href={fileUrl}
                  download={rawName}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
