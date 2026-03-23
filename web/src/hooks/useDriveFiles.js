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
        
        const history = await client.getMessages(entityStr, { 
          limit: 30,
          search: "_File" 
        });
        
        if (active) {
          const filteredHistory = history.filter(msg => 
            msg.message && 
            msg.message.includes("_File") &&
            !msg.media
          );
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
