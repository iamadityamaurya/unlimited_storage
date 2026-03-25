import { useState, useEffect } from 'react';
import { getCookie } from '../utils/cookies';
import { getConnectedClient } from '../telegramApi';

export function useDriveFiles(selectedChatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");

        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        
        let entityStr = selectedChatId;
        
        // Fetch from 5-minute lag-delayed MTProto Search Index AND instantaneous absolute Physical Chat History securely natively mapped!
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(entityStr, { limit: 100, search: "_File" }),
          client.getMessages(entityStr, { limit: 100 }) // Pulls raw real-time unfiltered objects bypassing server indexing entirely
        ]);
        
        // Merge and safely natively deduplicate physical packets based on ID metrics
        const combinedHistory = [...recentHistory, ...searchHistory];
        const uniqueMap = new Map();
        combinedHistory.forEach(msg => {
           if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });
        const history = Array.from(uniqueMap.values());
        
        if (active) {
          const filteredHistory = history.filter(msg => 
            msg.message && 
            msg.message.includes("_File") &&
            !msg.media
          ).sort((a, b) => b.date - a.date); // Sort safely mapping newly minted DOM objects uniformly natively
          setMessages(filteredHistory);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load generic chat stream", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    if (selectedChatId) {
       fetchMessages();
    }
    
    return () => { active = false; };
  }, [selectedChatId]);

  return { messages, setMessages, loading, error };
}
