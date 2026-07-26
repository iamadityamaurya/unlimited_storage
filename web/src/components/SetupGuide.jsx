import React, { useState } from "react";

export default function SetupGuide({ marginClass = "mx-6 mb-5" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${marginClass} border border-white/[0.06] bg-white/[0.01] rounded-2xl overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-300 hover:text-slate-100 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-400">💡</span>
          <span>How to use NexGenStorage (Detailed Setup Guide)</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-6 pt-2 border-t border-white/[0.04] space-y-5 animate-fade-in text-slate-400">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-indigo-400">1</span>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-slate-200">Create a Storage Chat</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Open Telegram and create a new <strong>Private Group</strong> or <strong>Channel</strong> (e.g. <em>"My Cloud Storage"</em>).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-indigo-400">2</span>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-slate-200">Select the Drive</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Return here, refresh your page, and select your private group/channel from the list of drives.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-indigo-400">3</span>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-slate-200">Create Folders</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Use the <strong>"+ New Folder"</strong> button in your drive to create dynamic directories for organizing your files.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-indigo-400">4</span>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-slate-200">Upload & Save Data</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Drag and drop files into folders. They are split and saved securely as messages in your private chat.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2.5 text-xs">
            <span className="text-indigo-400 mt-0.5">💡</span>
            <div className="space-y-1">
              <p className="font-semibold text-slate-300">Why use a private group/channel?</p>
              <p className="text-slate-500 leading-relaxed">
                Using a private group ensures that only your account has access to the uploaded files. Your credentials are never stored on external servers—everything stays local.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
