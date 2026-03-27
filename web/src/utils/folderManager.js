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

  return {
    message: finalPayload,
    date: Math.floor(Date.now() / 1000),
    id: Math.floor(Math.random() * 9999999)
  };
};
