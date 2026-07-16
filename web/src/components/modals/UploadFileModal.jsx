import React, { useState, useRef } from 'react';

export default function UploadFileModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  uploadProgressText,
  activeFolder,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions]           = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const hasIllegal = (text) => text.includes('###') || text.includes('_');

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const arr = Array.from(e.target.files);
      setSelectedFiles(arr);
      setCaptions(arr.map(f => f.name));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const arr = Array.from(e.dataTransfer.files);
    if (arr.length > 0) { setSelectedFiles(arr); setCaptions(arr.map(f => f.name)); }
  };

  const handleCaptionChange = (i, val) => {
    const next = [...captions]; next[i] = val; setCaptions(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || captions.some(hasIllegal)) return;
    onUpload(selectedFiles, captions);
  };

  // ─── Uploading state ──────────────────────────────────────
  if (isUploading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
        <div className="relative w-full max-w-sm glass-strong rounded-3xl shadow-2xl shadow-black/60 p-10 flex flex-col items-center gap-6 animate-scale-in">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
            <div className="absolute inset-4 rounded-full bg-indigo-500/10 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-100">Uploading…</h3>
            <p className="text-indigo-400 text-sm font-medium mt-1">{uploadProgressText || "Transmitting payload…"}</p>
          </div>
          <p className="text-slate-600 text-xs text-center max-w-[220px]">
            Do not close this window while the transfer is in progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md glass-strong rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Upload Files</h2>
              <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">To folder: <span className="text-indigo-400">{activeFolder || '—'}</span></p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className={`w-full h-36 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
              selectedFiles.length > 0
                ? 'border-indigo-500/60 bg-indigo-500/[0.07]'
                : 'border-white/[0.1] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/[0.04]'
            }`}
          >
            {selectedFiles.length > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-indigo-300 font-semibold text-lg leading-none">{selectedFiles.length}</p>
                <p className="text-indigo-400/70 text-xs text-center max-w-[200px] truncate">
                  {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`}
                </p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-500 text-sm font-medium">Click or drag files here</p>
                <p className="text-slate-700 text-xs mt-0.5">Any file type supported</p>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          {/* Captions */}
          {selectedFiles.length > 0 && (
            <div className="mt-5 flex flex-col gap-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">File names / captions</p>
              {selectedFiles.map((f, i) => {
                const caption = captions[i] || '';
                const invalid = hasIllegal(caption);
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-600 truncate">{f.name}</label>
                    <input
                      type="text"
                      value={caption}
                      onChange={e => handleCaptionChange(i, e.target.value)}
                      placeholder="Auto-filled from filename…"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-600 bg-[#0d0f1c] border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        invalid
                          ? 'border-red-500/40 focus:ring-red-500/20'
                          : 'border-white/[0.08] focus:border-indigo-500 focus:ring-indigo-500/25'
                      }`}
                    />
                    {invalid && (
                      <p className="text-red-400 text-[10px] font-medium">
                        {caption.includes('_') ? 'Underscores are reserved' : '"###" is reserved'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-white/[0.07] flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setSelectedFiles([]); setCaptions([]); onClose(); }}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0 || captions.some(hasIllegal)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-w-[120px] flex justify-center items-center"
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
            ) : (
              `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} files` : 'file'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
