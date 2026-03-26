import React, { useState, useRef, useEffect } from "react";
import { initializeTelegramLogin } from "../telegramApi";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

export default function TelegramLogin({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Start from zero every time natively
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(undefined); // undefined allows defaultCountry to work properly
  
  // Redirect logic removed to ensure "Enter Every Time" security strictly enforced natively
  const [sessionToken, setSessionToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const startLogin = async (e) => {
    e.preventDefault();
    if (!apiId || !apiHash || !phoneNumber) {
      setErrorMsg("Please fill out API ID, Hash, and Phone Number.");
      return;
    }

    setErrorMsg("");
    setStep(2); // Connecting...

    try {
      const { client, token } = await initializeTelegramLogin({
        apiId,
        apiHash,
        phoneNumber,
        phoneCodeCallback: async () => {
          setStep(3); // Prompt for Code
          return new Promise((resolve) => {
            phoneCodeResolver.current = resolve;
          });
        },
        passwordCallback: async () => {
          setStep(4); // Prompt for 2FA Password
          return new Promise((resolve) => {
            passwordResolver.current = resolve;
          });
        },
        onErrorCallback: (err) => {
          console.error(err);
          setErrorMsg(err.message || "An error occurred during login.");
        },
      });

      setSessionToken(token);

      setStep(5); // Done

      if (onLoginSuccess) {
        onLoginSuccess({ apiId, apiHash, token });
      }
      navigate("/"); // Navigate to home
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to initialize Telegram client.");
      setStep(1);
    }
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (phoneCodeResolver.current) {
      phoneCodeResolver.current(phoneCode);
      setStep(2); // Set back to connecting state while validating
    }
  };

  const submitPassword = (e) => {
    e.preventDefault();
    if (passwordResolver.current) {
      passwordResolver.current(password);
      setStep(2); // Set back to connecting state while validating
    }
  };

  const handleLogout = () => {
    deleteCookie("telegram_token");
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    setSessionToken("");
    setStep(1);
    setPhoneNumber(undefined);
    setPhoneCode("");
    setPassword("");
    setErrorMsg("");
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] h-screen w-full bg-[#1E1E1E] p-6 relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#252525] rounded-xl border border-[#333] shadow-2xl transition-all duration-300">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#333] border border-[#444] rounded-2xl flex items-center justify-center shadow-lg mb-5 transform transition-transform hover:scale-105 duration-200">
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-200 tracking-tight">Telegram Setup</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Configure network storage node</p>
        </div>
        
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={startLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">API ID</label>
              <input
                type="text"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500 focus:outline-none transition-all duration-200"
                placeholder="1234567"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">API Hash</label>
              <input
                type="password"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500 focus:outline-none transition-all duration-200"
                placeholder="01234..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <PhoneInput
                international
                withCountryCallingCode
                placeholder="e.g. +1 234 567 8900"
                value={phoneNumber}
                onChange={setPhoneNumber}
                defaultCountry="IN"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-200 focus-within:ring-1 focus-within:ring-yellow-500/50 focus-within:border-yellow-500 transition-all duration-200 custom-phone-input"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-[#facc15] hover:bg-[#eab308] text-[#1a1a1a] font-bold py-3 px-4 rounded-lg shadow-sm hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
            >
              Initialize Node
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-300">
            <div className="relative w-12 h-12 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#333]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-yellow-500/80 font-medium text-sm animate-pulse">Establishing socket...</p>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={submitCode} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full mb-3 border border-yellow-500/20">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-gray-400 text-sm">We've sent an authorization code to your Telegram app.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Login Code</label>
              <input
                type="text"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                maxLength="5"
                pattern="\d{5}"
                className="w-full text-center tracking-[0.5em] font-mono text-xl px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-yellow-500 placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all duration-200"
                placeholder="12345"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#1a1a1a] font-bold py-3 px-4 rounded-lg shadow-sm hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
            >
              Verify Identity
            </button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={submitPassword} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full mb-3 border border-yellow-500/20">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <p className="text-gray-400 text-sm">Input your two-step verification key.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#1a1a1a] font-bold py-3 px-4 rounded-lg shadow-sm hover:shadow-yellow-500/20 active:scale-95 transition-all duration-200"
            >
              Decrypt & Auth
            </button>
          </form>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#333]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-yellow-500 font-medium text-sm">Authenticated node. Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
