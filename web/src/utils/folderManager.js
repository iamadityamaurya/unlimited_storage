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
