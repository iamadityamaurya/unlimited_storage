import { useState, useEffect } from 'react';
import { getCookie } from '../utils/cookies';
import { getConnectedClient } from '../telegramApi';

export function useDriveFiles(selectedChatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchFiles = async () => {
      if (!selectedChatId) return;

      try {
        setLoading(true);
        setError(null);
        
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");

        if (!apiId || !apiHash || !token) {
          throw new Error("Missing MTProto authentication tokens.");
        }

        const client = await getConnectedClient(apiId, apiHash, token);
        let entityStr = selectedChatId;
        
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
            
            // Check the last item to decide if we need more pages
            const lastMsg = batch[batch.length - 1];
            offsetId = lastMsg.id;
            
            // If less than 100 returned, we've hit the end of the history
            if (batch.length < 100) break;
          }
          return allMatches;
        };

        // Also fetch recent messages to catch the instantaneous 5-minute search lag
        const [searchHistory, recentHistory] = await Promise.all([
          fetchAllIndexMessages(),
          client.getMessages(entityStr, { limit: 100 })
        ]);
        
        if (active) {
          // Merge all manifesto blocks handling any duplication delays synchronously
          const allIndexes = [...recentHistory, ...searchHistory].filter(m => m.message && m.message.includes("###_UNLIMITED_STORAGE_INDEX_###"));
          
          if (allIndexes.length > 0) {
             const uniqueLineSet = new Set();
             let newestDate = 0;
             let baseId = 0;

             // Loop through all indexes safely aggregating structural boundaries organically
             allIndexes.forEach(indexMsg => {
                const lines = indexMsg.message.split('\n');
                lines.forEach(line => {
                  const trimmed = line.trim();
                  if (trimmed) uniqueLineSet.add(trimmed);
                });
                if (indexMsg.date > newestDate) {
                    newestDate = indexMsg.date;
                    baseId = indexMsg.id;
                }
             });

             // Safely natively assemble synthetic mapped blocks explicitly extracting unified sets
             const fakeMessages = Array.from(uniqueLineSet)
                .filter(line => line.includes('_File') && line !== "###_UNLIMITED_STORAGE_INDEX_###")
                .map((line, idx) => ({
                   id: baseId * 10000 + idx, // Fake absolute unique metric preventing React key overlaps natively
                   message: line,
                   date: newestDate, // Inherited raw parent boundary timestamps
                }))
                .reverse(); // Reverse strictly sorting the newest instances ascending organically

             setMessages(fakeMessages);
          } else {
             // Safe default fallback natively skipping missing manifesto items
             setMessages([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Hook MTProto Fetch Error:", err);
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchFiles();

    return () => { active = false; };
  }, [selectedChatId]);

  return { messages, setMessages, loading, error };
}
