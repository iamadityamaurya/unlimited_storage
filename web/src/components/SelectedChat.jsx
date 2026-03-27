import React, { useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import { Api } from "telegram";
import { CustomFile } from "telegram/client/uploads";
import StorageGrid from "./StorageGrid";
import FolderView from "./FolderView";
import DashboardHeader from "./layout/DashboardHeader";
import CreateFileModal from "./modals/CreateFileModal";
import UploadFileModal from "./modals/UploadFileModal";
import FolderSidebar from "./FolderSidebar";
import { useDriveFiles } from "../hooks/useDriveFiles";
import { createFolderNode } from "../utils/folderManager";

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
      const newMsg = await createFolderNode(client, selectedChat.id, newFileName);
      
      setMessages([newMsg, ...messages]);
      setNewFileName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to execute structural Master Index append natively:", err);
      alert("Master Index Update Error. Trace console logs.");
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
        
        // Use user-defined caption if provided, otherwise default to the original native filename
        const baseName = captionsArray[i]?.trim() || fileObj.name;
        const finalPayloadText = `${baseName}_${activeFolder}`;

        // Completely sidestep DOM typecasting bugs by extracting raw Blob arrays directly bypassing GramJS JS strict File typing validators
        const arrayBuffer = await fileObj.arrayBuffer();
        const physicalBuffer = Buffer.from(arrayBuffer);
        
        // Use the official CustomFile class for the browser-based Buffer upload directly!
        const toUpload = new CustomFile(fileObj.name, fileObj.size, "", physicalBuffer);

        // MTProto dispatch executing forceDocument sequentially utilizing secure Proxy wrappers natively
        await client.sendFile(entityStr, { 
          file: toUpload, 
          caption: finalPayloadText,
          forceDocument: true,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: fileObj.name || "document.bin" })
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

      <div className="flex-1 w-full px-12 lg:px-24 py-8 flex flex-col relative z-0">
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
          <div className="flex flex-1 w-full gap-8 relative">
            <FolderSidebar 
              folders={messages} 
              activeFolder={activeFolder} 
              onFolderClick={setActiveFolder} 
              onBack={() => setActiveFolder(null)} 
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
            <div className="flex-1 min-w-0">
              <FolderView 
                selectedChat={selectedChat} 
                folderName={activeFolder} 
                refreshTrigger={folderRefreshTrigger}
                onBack={() => setActiveFolder(null)} 
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-300">
              <h1 className="text-xl font-semibold text-gray-200 tracking-tight">My Files</h1>
              <span className="text-sm font-medium text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
                {messages.length} Items Indexed
              </span>
            </div>
            <StorageGrid messages={messages} onFolderClick={setActiveFolder} />
          </>
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
