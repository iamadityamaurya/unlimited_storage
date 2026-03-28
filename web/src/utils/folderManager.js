/**
 * Utility for managing the Master Index manifesto and folder creation logic.
 */

export const fetchAllIndexMessages = async (client, entityStr) => {
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

export const createFolderNode = async (client, selectedChatId, folderName) => {
  const sanitisedName = folderName.trim().replace(/###/g, "");
  const finalPayload = sanitisedName + "_File";
  const entityStr = selectedChatId;

  // Pull BOTH the entire Search Index and the most recent 100 items to bypass 5-min indexing lag
  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 })
  ]);
  
  const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
  
  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    const existingLines = indexMsg.message.split('\n');
    if (!existingLines.includes(finalPayload)) {
      const newContent = indexMsg.message + "\n" + finalPayload;
      await client.sendMessage(entityStr, { message: newContent });
      try { await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true }); } catch (e) {}
    }
  } else {
    const initialText = "###_UNLIMITED_STORAGE_INDEX_###\n" + finalPayload;
    await client.sendMessage(entityStr, { message: initialText });
  }

  return { message: finalPayload, date: Math.floor(Date.now() / 1000), id: Math.floor(Math.random() * 9999999) };
};

/**
 * Rename a folder node in the Master Index and update all associated file captions.
 */
export const renameFolderNode = async (client, selectedChatId, oldName, newName, onProgress) => {
  const entityStr = selectedChatId;
  const oldPayload = oldName.trim() + "_File";
  const newPayload = newName.trim().replace(/###/g, "") + "_File";

  if (oldName === newName) return;

  // 1. Update Master Index manifesto
  onProgress && onProgress("Updating Master Index...");
  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 })
  ]);
  
  const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
  
  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    const newContent = indexMsg.message.replace(oldPayload, newPayload);
    
    await client.sendMessage(entityStr, { message: newContent });
    try { await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true }); } catch (e) {}
  }

  // 2. Update File Captions (Suffix change)
  onProgress && onProgress("Scanning child file blocks...");
  let offsetId = 0;
  let filesToUpdate = [];
  const oldSuffix = `_${oldName}`;
  const newSuffix = `_${newName}`;

  // Recursive fetch of all files belonging to this folder
  while (true) {
    const batch = await client.getMessages(entityStr, { 
      search: oldSuffix, 
      limit: 100, 
      offsetId 
    });
    if (batch.length === 0) break;
    // Filter strictly for perfect suffix match to avoid partial name match bugs
    const strictlyMatched = batch.filter(m => m.message && m.message.endsWith(oldSuffix));
    filesToUpdate = [...filesToUpdate, ...strictlyMatched];
    offsetId = batch[batch.length - 1].id;
    if (batch.length < 100) break;
  }

  onProgress && onProgress(`Synchronizing ${filesToUpdate.length} file metadata blocks...`);
  
  // Batch edit captions sequentially to avoid heavy rate limits
  for (let i = 0; i < filesToUpdate.length; i++) {
    const msg = filesToUpdate[i];
    const newCaption = msg.message.replace(oldSuffix, newSuffix);
    try {
      await client.editMessage(entityStr, {
        message: msg.id,
        text: newCaption
      });
      onProgress && onProgress(`Updated ${i + 1}/${filesToUpdate.length} sync points...`);
    } catch (err) {
      console.error(`Failed to sync file ${msg.id}:`, err);
    }
  }

  onProgress && onProgress("Renaming complete.");
};
