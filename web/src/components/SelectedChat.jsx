import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import { Api } from "telegram";
import { CustomFile } from "telegram/client/uploads";
import StorageGrid from "./StorageGrid";
import FolderView from "./FolderView";
import DashboardHeader from "./layout/DashboardHeader";
import CreateFileModal from "./modals/CreateFileModal";
import UploadFileModal from "./modals/UploadFileModal";
import RenameFolderModal from "./modals/RenameFolderModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import StorageAnalyticsModal from "./modals/StorageAnalyticsModal";
import FolderSidebar from "./FolderSidebar";
import FileViewerModal from "./modals/FileViewerModal";
import { useDriveFiles } from "../hooks/useDriveFiles";
import { createFolderNode, renameFolderNode, deleteFolderNode, deleteFolderFiles } from "../utils/folderManager";

export default function SelectedChat({ selectedChat, onClearChat, onLogOut }) {
  const navigate = useNavigate();
  const { chatId, folderId, messageId } = useParams();
  const { messages, setMessages, loading, error, refresh } = useDriveFiles(selectedChat?.id);
  
  const activeFolder = folderId || null;
  const currentFolder = messages.find(f => f.uid === folderId);
  const activeFolderName = currentFolder ? currentFolder.name : "Loading Folder...";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Rename States
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null); // { uid, name }
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameProgressText, setRenameProgressText] = useState("");

  // Delete States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'folder'|'file', obj: folderObj | fileMsg }
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgressText, setDeleteProgressText] = useState("");

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
      await createFolderNode(client, selectedChat.id, newFileName);
      
      // Full refresh to catch everything
      await refresh();
      setNewFileName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to execute structural Master Index append natively:", err);
      alert("Master Index Update Error. Trace console logs.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameFolder = async (oldFolder, newName) => {
    try {
      setIsRenaming(true);
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      
      const client = await getConnectedClient(apiId, apiHash, token);
      await renameFolderNode(client, selectedChat.id, oldFolder, newName, (progress) => {
        setRenameProgressText(progress);
      });
      
      await refresh();
      setIsRenameModalOpen(false);
      setFolderToRename(null);
    } catch (err) {
      console.error("Renaming failed:", err);
      alert(`Structural Rename Error:\n\n${err.message || String(err)}`);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenDeleteFolder = (folder) => {
    setDeleteTarget({ type: 'folder', obj: folder });
    setIsDeleteModalOpen(true);
  };

  const handleOpenFileDelete = (msg) => {
    setDeleteTarget({ type: 'file', obj: msg });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (recursive) => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const apiId = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token = getCookie("telegram_token");
      
      const client = await getConnectedClient(apiId, apiHash, token);
      
      if (deleteTarget.type === 'folder') {
        setDeleteProgressText("Updating directory index...");
        await deleteFolderNode(client, selectedChat.id, deleteTarget.obj.uid, deleteTarget.obj.name);
        
        if (recursive) {
          setDeleteProgressText("Scanning and deleting nested files...");
          await deleteFolderFiles(client, selectedChat.id, deleteTarget.obj.uid, (prog) => {
            setDeleteProgressText(prog);
          });
        }
        await refresh();
      } else if (deleteTarget.type === 'file') {
        setDeleteProgressText("Removing file block from Telegram...");
        await client.deleteMessages(selectedChat.id, [deleteTarget.obj.id], { revoke: true });
        setFolderRefreshTrigger(prev => prev + 1);
      }
      
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Deletion failed:", err);
      alert(`Structural Deletion Error:\n\n${err.message || String(err)}`);
    } finally {
      setIsDeleting(false);
      setDeleteProgressText("");
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
        // SUFFIX IS NOW THE IMMUTABLE UID
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

  const handleCloseViewer = () => {
    if (folderId) {
      navigate(`/drive/${chatId}/folder/${folderId}`);
    } else {
      navigate(`/drive/${chatId}`);
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-[#07080f]">
      <DashboardHeader 
        chatName={selectedChat.name}
        activeFolder={activeFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onClearChat={onClearChat}
        onLogOut={onLogOut}
      />

      <div className="flex-1 w-full overflow-hidden flex flex-row relative z-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full w-full gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
            </div>
            <p className="text-slate-500 text-sm">Loading folders…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full w-full p-6 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm font-medium max-w-xs">Failed to load files. Please try switching to a different drive.</p>
          </div>
        ) : activeFolder ? (
          <>
            <FolderSidebar 
              folders={messages} 
              activeFolder={activeFolder} 
              onFolderClick={(uid) => { navigate(`/drive/${chatId}/folder/${uid}`); setSearchQuery(""); }} 
              onBack={() => { navigate(`/drive/${chatId}`); setSearchQuery(""); }} 
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onRenameClick={(folder) => { setFolderToRename(folder); setIsRenameModalOpen(true); }}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 lg:px-16 py-8">
              <FolderView 
                selectedChat={selectedChat} 
                folderName={activeFolderName} 
                folderUID={activeFolder}
                refreshTrigger={folderRefreshTrigger}
                searchQuery={searchQuery}
                onBack={() => { navigate(`/drive/${chatId}`); setSearchQuery(""); }} 
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenFileDelete={handleOpenFileDelete}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 lg:px-16 py-8">
            <div className="flex items-center justify-between mb-7 animate-fade-up">
              <h1 className="text-lg font-semibold text-slate-200 tracking-tight">My Folders</h1>
              <span className="text-xs font-medium text-slate-500 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full">
                {messages.length} {messages.length === 1 ? 'folder' : 'folders'}
              </span>
            </div>
            <StorageGrid 
              messages={messages} 
              searchQuery={searchQuery}
              onFolderClick={(uid) => { navigate(`/drive/${chatId}/folder/${uid}`); setSearchQuery(""); }} 
              onRenameClick={(folder) => { setFolderToRename(folder); setIsRenameModalOpen(true); }}
              onDeleteClick={handleOpenDeleteFolder}
            />
          </div>
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

      <RenameFolderModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameFolder}
        isRenaming={isRenaming}
        oldFolder={folderToRename}
        renameProgressText={renameProgressText}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === 'folder' ? "Delete Folder" : "Delete File"}
        message={
          deleteTarget?.type === 'folder' 
            ? `Are you sure you want to delete the folder "${deleteTarget.obj.name}"?`
            : "Are you sure you want to delete this file from Telegram?"
        }
        isFolder={deleteTarget?.type === 'folder'}
        isDeleting={isDeleting}
        deleteProgressText={deleteProgressText}
      />

      <StorageAnalyticsModal 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        selectedChat={selectedChat}
        foldersCount={messages.length}
      />

      <UploadFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        isUploading={isUploading}
        uploadProgressText={uploadProgressText}
        activeFolder={activeFolder}
      />

      {/* Render FileViewerModal at SelectedChat level based on routes */}
      {messageId && (
        <FileViewerModal onClose={handleCloseViewer} />
      )}
    </div>
  );
}
