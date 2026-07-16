import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getConnectedClient } from "../telegramApi";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";
import ChatList from "../components/ChatList";
import SelectedChat from "../components/SelectedChat";

export default function Home() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      const apiId   = getCookie("telegram_apiId");
      const apiHash = getCookie("telegram_apiHash");
      const token   = getCookie("telegram_token");

      if (!apiId || !apiHash || !token) {
        navigate("/login");
        return;
      }

      try {
        const client  = await getConnectedClient(apiId, apiHash, token);
        const dialogs = await client.getDialogs();
        setChats(dialogs.map(d => ({
          id:   d.id ? d.id.toString() : Math.random().toString(),
          name: d.name || d.title || "Unnamed Chat",
        })));
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to connect to Telegram or fetch chats.");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [navigate]);

  useEffect(() => {
    // If visiting root "/" directly, redirect based on last selected drive
    if (window.location.pathname === "/") {
      const lastId = getCookie("telegram_selected_chat_id");
      if (lastId) {
        navigate(`/drive/${lastId}`, { replace: true });
      } else {
        navigate("/drives", { replace: true });
      }
    }
  }, [navigate, chatId]);

  const handleLogOut = () => {
    deleteCookie("telegram_token");
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    navigate("/login");
  };

  const handleSelectChat = (chat) => {
    setCookie("telegram_selected_chat_id", chat.id);
    setCookie("telegram_selected_chat_name", encodeURIComponent(chat.name));
    navigate(`/drive/${chat.id}`);
  };

  const selectedChat = chatId 
    ? (chats.find(c => c.id === chatId) || { id: chatId, name: "Loading Drive..." })
    : null;

  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#07080f]">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="relative z-10 flex flex-col items-center gap-5 animate-fade-in">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-semibold">Loading your drives</p>
            <p className="text-slate-600 text-sm mt-1">Fetching Telegram dialogues…</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <SelectedChat
        selectedChat={selectedChat}
        onClearChat={() => navigate("/drives")}
        onLogOut={handleLogOut}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#07080f]">
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />
      {/* grid texture */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="relative z-10 w-full max-w-2xl animate-fade-up">
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          onLogOut={handleLogOut}
          errorMsg={errorMsg}
        />
      </div>
    </div>
  );
}
