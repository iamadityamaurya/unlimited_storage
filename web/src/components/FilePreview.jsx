import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";

// Generic Flat File Icon used as fallback
const GenericFileIcon = () => (
  <svg className="w-16 h-16 drop-shadow-sm transition-transform duration-200 opacity-80 group-hover:opacity-100" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8C10 5.79086 11.7909 4 14 4H26.5858C27.6467 4 28.6641 4.42143 29.4142 5.17157L36.8284 12.5858C37.5786 13.3359 38 14.3533 38 15.4142V40C38 42.2091 36.2091 44 34 44H14C11.7909 44 10 42.2091 10 40V8Z" fill="#e5e7eb" />
    <path d="M26 4V12C26 14.2091 27.7909 16 30 16H38L26 4Z" fill="#9ca3af" />
    <path d="M16 24H32M16 32H32M16 40H24" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function FilePreview({ msg }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchThumb = async () => {
      if (!msg || !msg.media) {
        if (active) setIsLoading(false);
        return;
      }
      
      try {
        const apiId = getCookie("telegram_apiId");
        const apiHash = getCookie("telegram_apiHash");
        const token = getCookie("telegram_token");
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        
        // Fetch a low-resolution thumbnail natively mapping thumb layer 0
        const buffer = await client.downloadMedia(msg, { thumb: 0 });
        
        if (active && buffer) {
          // Natively parse the buffered raw output securely converting into a DOM usable payload blob
          const blob = new Blob([buffer], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          setThumbSrc(url);
        }
      } catch (err) {
        // Graceful failure fallback matching files missing strict MTProto image signatures natively
        console.debug("Ignorable thumbnail failure:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchThumb();

    return () => { active = false; };
  }, [msg]);

  // If loading, you can return a spinner or just standard file icon placeholder safely
  if (thumbSrc) {
    return (
      <img 
        src={thumbSrc} 
        alt="Preview Thumbnail" 
        className="w-14 h-14 object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-200 border border-[#333]"
      />
    );
  }

  return <GenericFileIcon />;
}
