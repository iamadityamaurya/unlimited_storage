import React, { useState, useRef } from 'react';

export default function UploadFileModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading,
  uploadProgressText,
  activeFolder
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      // Map an individual empty string caption explicitly for every selected file object 
      setCaptions(new Array(filesArray.length).fill(""));
    }
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    onUpload(selectedFiles, captions);
  };

  if (isUploading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[#252525] border border-[#333] rounded-2xl shadow-2xl overflow-hidden p-10 flex flex-col items-center justify-center relative">
           {/* Beautiful Nested Spinner */}
           <div className="relative w-24 h-24 flex items-center justify-center mb-8">
             <div className="absolute inset-0 border-4 border-[#333] rounded-full"></div>
             <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
             <svg className="w-10 h-10 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
           </div>
           
           <h3 className="text-2xl font-bold text-gray-100 mb-3 tracking-tight">Transmitting Payload</h3>
           <p className="text-yellow-500 text-sm font-bold text-center w-full bg-yellow-500/10 py-2 rounded-lg mb-4 border border-yellow-500/20 shadow-sm">
              {uploadProgressText || "Securing MTProto channels..."}
           </p>
           <p className="text-gray-400 text-xs font-medium text-center px-4 leading-relaxed">
             Please do not close this window or refresh the browser while the stream is locked.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-sm bg-[#252525] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <h3 className="text-lg font-bold text-gray-100 mb-1">Upload File to {activeFolder}</h3>
          <p className="text-gray-400 text-xs mb-5">Select local binaries to dispatch directly to the MTProto cluster securely.</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-32 flex-shrink-0 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedFiles.length > 0 ? 'border-yellow-500 bg-yellow-500/10' : 'border-[#444] bg-[#1a1a1a] hover:border-[#666]'}`}
          >
            {selectedFiles.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <p className="text-yellow-500 font-bold text-2xl mb-1">{selectedFiles.length}</p>
                <p className="text-yellow-500/80 font-medium text-xs text-center px-4 break-all line-clamp-2">
                  {selectedFiles.length === 1 ? selectedFiles[0].name : "Files Selected"}
                </p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <span className="text-gray-400 text-xs font-medium">Click to select files</span>
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

          <div className="mt-5 space-y-4">
            {selectedFiles.length > 0 ? (
              selectedFiles.map((f, idx) => (
                <div key={idx} className="space-y-1 relative group">
                  <label className="text-[10px] font-semibold text-yellow-500/80 uppercase truncate w-full block" title={f.name}>
                    CAPTION FOR "{f.name}"
                  </label>
                  <input
                    type="text"
                    value={captions[idx] || ""}
                    onChange={(e) => handleCaptionChange(idx, e.target.value)}
                    placeholder="Auto-generates if left blank..."
                    className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
                  />
                </div>
              ))
            ) : (
                <div className="space-y-1 opacity-50 pointer-events-none">
                  <label className="text-[10px] font-semibold text-gray-400">FILE CAPTION</label>
                  <input type="text" disabled placeholder="Select files first..." className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
            )}
          </div>
        </div>
        
        <div className="bg-[#1e1e1e] px-6 py-4 border-t border-[#333] flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedFiles([]);
              setCaptions([]);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] flex justify-center items-center"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Upload ${selectedFiles.length > 1 ? selectedFiles.length + ' Files' : 'Binary'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
