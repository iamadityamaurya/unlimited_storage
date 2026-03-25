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

      // Recursive search logic to traverse the ENTIRE global database without limit caps
      const fetchAllIndexMessages = async () => {
        let allMatches = [];
        let offsetId = 0;
        while (true) {
          const batch = await client.getMessages(entityStr, { 
            search: "###_UNLIMITED_STORAGE_INDEX_###", 
            limit: 100, 
            offsetId 
          });
          if (batch.length === 0) break;
          allMatches = [...allMatches, ...batch];
          offsetId = batch[batch.length - 1].id;
          if (batch.length < 100) break;
        }
        return allMatches;
      };

      // Pull BOTH the entire Search Index and the most recent 100 items to bypass 5-min indexing lag
      const [searchHistory, recentHistory] = await Promise.all([
         fetchAllIndexMessages(),
         client.getMessages(entityStr, { limit: 100 })
      ]);
      
      // Merge and filter all possible instances of the manifesto
      const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
      
      if (allIndexes.length > 0) {
         // Sort to find the absolute most recent physical instance
         allIndexes.sort((a, b) => b.date - a.date);
         const indexMsg = allIndexes[0];
         
         // Extract lines to prevent duplicate folder inserts gracefully
         const existingLines = indexMsg.message.split('\n');
         if (!existingLines.includes(finalPayload)) {
            const newContent = indexMsg.message + "\n" + finalPayload;
            
            // Execute Rolling Index Switch: Send New then Delete Old to ensure zero-downtime manifesto access
            await client.sendMessage(entityStr, { message: newContent });
            
            // Clean up legacy index blocks to keep the chat history pristine
            try {
              await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true });
            } catch (delErr) {
              console.warn("Legacy index cleanup failed (non-critical):", delErr);
            }
         }
      } else {
         const initialText = "###_UNLIMITED_STORAGE_INDEX_###\n" + finalPayload;
         await client.sendMessage(entityStr, { message: initialText });
      }

      const newMsg = {
        message: finalPayload,
        date: Math.floor(Date.now() / 1000),
        id: Math.floor(Math.random() * 9999999)
      };
      
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
