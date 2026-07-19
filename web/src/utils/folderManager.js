/**
 * Utility for managing the Master Index manifesto and UID-based folder logic.
 */

const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();

export const parseFolderLine = (line) => {
  if (!line || !line.includes('_File')) return null;
  const raw = line.split('_File')[0]; // "123456 - My Folder"
  if (raw.includes(' - ')) {
    const parts = raw.split(' - ');
    return { uid: parts[0], name: parts.slice(1).join(' - ') };
  }
  // Fallback for legacy (compatibility with original suffix)
  return { uid: raw, name: raw };
};

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
  const uid = generateUID();
  const finalPayload = `${uid} - ${sanitisedName}_File`;
  const entityStr = selectedChatId;

  // Pull BOTH the entire Search Index and the most recent 100 items
  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 })
  ]);
  
  const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
  
  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    const newContent = indexMsg.message + "\n" + finalPayload;
    
    await client.sendMessage(entityStr, { message: newContent });
    try { await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true }); } catch (e) {}
  } else {
    const initialText = "###_UNLIMITED_STORAGE_INDEX_###\n" + finalPayload;
    await client.sendMessage(entityStr, { message: initialText });
  }

  return { message: finalPayload, date: Math.floor(Date.now() / 1000), id: Math.floor(Math.random() * 9999999) };
};

/**
 * Rename a folder: O(1) Operation. ONLY updates the line in the Master Index.
 * Files remain linked via the immutable UID.
 */
export const renameFolderNode = async (client, selectedChatId, oldFolderObj, newName, onProgress) => {
  const entityStr = selectedChatId;
  const { uid, name: oldName } = oldFolderObj;
  
  const oldPayload = `${uid} - ${oldName}_File`;
  const newPayload = `${uid} - ${newName.trim().replace(/###/g, "")}_File`;

  if (oldName === newName) return;

  onProgress && onProgress("Updating Master Index Manifesto...");
  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 })
  ]);
  
  const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
  
  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    
    // Replace only the specific UID node line natively
    const newContent = indexMsg.message.replace(oldPayload, newPayload);
    
    await client.sendMessage(entityStr, { message: newContent });
    try { await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true }); } catch (e) {}
  }

  onProgress && onProgress("Directory pointer synchronized.");
};

/**
 * Delete a folder node from the Master Index
 */
export const deleteFolderNode = async (client, selectedChatId, folderUID, folderName) => {
  const entityStr = selectedChatId;
  const folderPayload = `${folderUID} - ${folderName}_File`;

  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 })
  ]);
  
  const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
  
  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    
    // Filter out the line of the folder we want to delete
    const lines = indexMsg.message.split("\n");
    const newLines = lines.filter(line => line.trim() !== "" && !line.includes(folderPayload));
    
    let newContent = "";
    if (newLines.length > 1) {
      newContent = newLines.join("\n");
    } else {
      // Just keep header if no folders left
      newContent = "###_UNLIMITED_STORAGE_INDEX_###";
    }
    
    await client.sendMessage(entityStr, { message: newContent });
    try { await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true }); } catch (e) {}
  }
};

/**
 * Recursively deletes all files in the chat matching the folderUID
 */
export const deleteFolderFiles = async (client, selectedChatId, folderUID, onProgress) => {
  const entityStr = selectedChatId;
  const suffix = `_${folderUID}`;
  
  onProgress && onProgress("Searching for child files...");
  
  const [searchHistory, recentHistory] = await Promise.all([
    client.getMessages(entityStr, { limit: 10000, search: suffix }),
    client.getMessages(entityStr, { limit: 300 })
  ]);
  
  const uniqueMap = new Map();
  [...recentHistory, ...searchHistory].forEach(msg => {
    if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
  });
  
  const filesToDelete = Array.from(uniqueMap.values()).filter(
    msg => msg.message && msg.message.trim().endsWith(suffix) && msg.media
  );
  
  if (filesToDelete.length === 0) {
    onProgress && onProgress("No child files found.");
    return;
  }
  
  const ids = filesToDelete.map(msg => msg.id);
  onProgress && onProgress(`Deleting ${ids.length} files...`);
  
  // Delete in chunks of 100 to avoid limits
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    onProgress && onProgress(`Deleting files ${i + 1} to ${Math.min(i + 100, ids.length)} of ${ids.length}...`);
    await client.deleteMessages(entityStr, chunk, { revoke: true });
  }
};
