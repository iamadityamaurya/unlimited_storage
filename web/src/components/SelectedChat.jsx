import React, { useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import { Api } from "telegram";
import StorageGrid from "./StorageGrid";
import FolderView from "./FolderView";
import DashboardHeader from "./layout/DashboardHeader";
import CreateFileModal from "./modals/CreateFileModal";
import UploadFileModal from "./modals/UploadFileModal";
import { useDriveFiles } from "../hooks/useDriveFiles";

export default function SelectedChat({ selectedChat, onClearChat, onLogOut }) {
  const { messages, setMessages, loading, error } = useDriveFiles(selectedChat?.id);
  
  const [activeFolder, setActiveFolder] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Binary Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [folderRefreshTrigger, setFolderRefreshTrigger] = useState(0);

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      setIsCreating(true);
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      
      const client = await getConnectedClient(apiId, apiHash, token);
      
      const finalPayload = newFileName.trim() + "_File";
      let entityStr = selectedChat.id;

      await client.sendMessage(entityStr, { message: finalPayload });

      const newMsg = {
        message: finalPayload,
        date: Math.floor(Date.now() / 1000),
        id: Math.floor(Math.random() * 9999999)
      };
      
      setMessages([newMsg, ...messages]);
      setNewFileName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to dispatch file creation string", err);
      alert("API Dispatch Error: Check Console.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadFile = async (filesArray, captionsArray) => {
    try {
      setIsUploading(true);
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      
      const client = await getConnectedClient(apiId, apiHash, token);
      let entityStr = selectedChat.id;

      // Map through all physical selected files iterating sequential uploads securely
      for (let i = 0; i < filesArray.length; i++) {
        setUploadProgressText(`Uploading file ${i + 1} of ${filesArray.length}...`);
        const fileObj = filesArray[i];
        
        // Grab the precise string matched dynamically inside the mapped form structure
        let customCaption = captionsArray[i] ? captionsArray[i].trim() : "";
        
        let finalName = customCaption;
        if (!finalName) {
           const date = new Date();
           // Adding i safely limits absolute matching failures over instantaneous loops
           finalName = `File_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${Math.floor(Math.random() * 10000) + i}`;
        }
        
        const finalPayloadText = finalName + "_" + activeFolder;

        // Completely sidestep DOM typecasting bugs by extracting raw Blob arrays directly bypassing GramJS JS strict File typing validators
        const arrayBuffer = await fileObj.arrayBuffer();
        const physicalBuffer = Buffer.from(arrayBuffer);

        // MTProto dispatch executing forceDocument sequentially utilizing secure Buffer payloads natively
        // Appending explicit DocumentAttributeFilename guarantees Telegram preserves the exact file format (PDF, DOCX) bypassing CustomFile inference!
        await client.sendFile(entityStr, { 
          file: physicalBuffer, 
          caption: finalPayloadText,
          forceDocument: true,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: fileObj.name || "unnamed_document.bin" })
          ]
        });
      }

      setFolderRefreshTrigger(prev => prev + 1);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error("Failed to upload binary file payload:", err);
      alert(`GramJS Execution Error:\n\n${err.message || String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent flex flex-col transition-all">
      <DashboardHeader 
        chatName={selectedChat.name}
        activeFolder={activeFolder}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onClearChat={onClearChat}
        onLogOut={onLogOut}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col relative z-0">
        {!activeFolder && (
          <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-300">
            <h1 className="text-xl font-semibold text-gray-200 tracking-tight">My Files</h1>
            <span className="text-sm font-medium text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
              {messages.length} Items Indexed
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full w-full opacity-70 min-h-[400px]">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 text-sm font-medium">Indexing filesystem blocks...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 h-full w-full p-6 text-center min-h-[400px]">
            <p className="text-red-400 font-medium bg-red-900/20 p-5 rounded-lg border border-red-900/50 shadow-sm">
              Fatal error resolving directory linkage mapping entity scope. Please select an alternative storage peer.
            </p>
          </div>
        ) : activeFolder ? (
          <FolderView 
            selectedChat={selectedChat} 
            folderName={activeFolder} 
            refreshTrigger={folderRefreshTrigger}
            onBack={() => setActiveFolder(null)} 
          />
        ) : (
          <StorageGrid messages={messages} onFolderClick={setActiveFolder} />
        )}
      </div>

      <CreateFileModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateFile}
        isCreating={isCreating}
        newFileName={newFileName}
        setNewFileName={setNewFileName}
      />

      <UploadFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        isUploading={isUploading}
        uploadProgressText={uploadProgressText}
        activeFolder={activeFolder}
      />
    </div>
  );
}
