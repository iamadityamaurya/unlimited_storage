import React, { useEffect, useState } from "react";
import { getCookie } from "../utils/cookies";
import { getConnectedClient } from "../telegramApi";
import { GenericFileIcon } from "./icons/Icons";

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
        
        // Fetch a sharper mid-resolution thumbnail natively matching layer 1
        let buffer = await client.downloadMedia(msg, { thumb: 1 });
        
        // Fallback to absolute lowest blurry layer if layer 1 doesn't statically exist
        if (!buffer) {
          buffer = await client.downloadMedia(msg, { thumb: 0 });
        }
        
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
