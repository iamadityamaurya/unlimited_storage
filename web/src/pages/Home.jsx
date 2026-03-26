import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConnectedClient } from "../telegramApi";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";
import ChatList from "../components/ChatList";
import SelectedChat from "../components/SelectedChat";

export default function Home({ apiCredentials, onGlobalLogout }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [selectedChat, setSelectedChat] = useState(() => {
    const id = getCookie("telegram_selected_chat_id");
    const name = getCookie("telegram_selected_chat_name");
    return id && name ? { id, name: decodeURIComponent(name) } : null;
  });

  useEffect(() => {
    const fetchChats = async () => {
      const { apiId, apiHash, token } = apiCredentials;

      if (!apiId || !apiHash || !token) {
        navigate("/login");
        return;
      }

      try {
        const client = await getConnectedClient(apiId, apiHash, token);
        const dialogs = await client.getDialogs();
        
        const chatList = dialogs.map((dialog) => ({
          id: dialog.id ? dialog.id.toString() : Math.random().toString(),
          name: dialog.name || dialog.title || "Unnamed Chat"
        }));
        setChats(chatList);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to connect to Telegram or fetch chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate, apiCredentials]);

  const handleLogOut = () => {
    deleteCookie("telegram_token");
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    onGlobalLogout();
    navigate("/login");
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setCookie("telegram_selected_chat_id", chat.id);
    setCookie("telegram_selected_chat_name", encodeURIComponent(chat.name));
  };

  const clearSelectedChat = () => {
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    setSelectedChat(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] w-full bg-slate-900 p-6 rounded-2xl relative overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-300 font-medium">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center w-full min-h-screen bg-[#1E1E1E] ${selectedChat ? 'p-0' : 'p-6 rounded-2xl'} relative overflow-hidden transition-all duration-500`}>

      {selectedChat ? (
        <SelectedChat 
          selectedChat={selectedChat} 
          onClearChat={clearSelectedChat} 
          onLogOut={handleLogOut} 
          apiCredentials={apiCredentials}
        />
      ) : (
        <ChatList 
          chats={chats} 
          onSelectChat={handleSelectChat} 
          onLogOut={handleLogOut} 
          errorMsg={errorMsg} 
        />
      )}
    </div>
  );
}
