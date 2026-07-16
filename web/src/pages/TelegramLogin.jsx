import React, { useState, useRef, useEffect } from "react";
import { initializeTelegramLogin } from "../telegramApi";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

// ─── Step indicator ───────────────────────────────────────────
function StepDot({ active, done }) {
  return (
    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
      done  ? 'bg-indigo-400 scale-110' :
      active ? 'bg-indigo-500 scale-125 ring-2 ring-indigo-500/30' :
               'bg-slate-700'
    }`} />
  );
}

// ─── Shared Input ─────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = `
  w-full px-4 py-3 rounded-xl text-[0.9375rem] font-medium text-slate-100
  placeholder:text-slate-600 bg-[#0d0f1c] border border-white/[0.08]
  focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25
  transition-all duration-200
`.replace(/\s+/g, ' ').trim();

// ─── Primary button ───────────────────────────────────────────
function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      className={`
        w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl font-semibold text-sm
        bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
        text-white shadow-lg shadow-indigo-500/25
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200 active:scale-[0.98]
        ${props.className || ''}
      `}
    >
      {loading ? (
        <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
      ) : children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TelegramLogin({ onLoginSuccess }) {
  const existingToken = getCookie("telegram_token");
  const navigate = useNavigate();

  const [step, setStep] = useState(existingToken ? 5 : 1);
  const [apiId, setApiId]       = useState(getCookie("telegram_apiId") || "");
  const [apiHash, setApiHash]   = useState(getCookie("telegram_apiHash") || "");
  const [phoneNumber, setPhoneNumber] = useState(undefined);
  const [phoneCode, setPhoneCode]   = useState("");
  const [password, setPassword]     = useState("");
  const [sessionToken, setSessionToken] = useState(existingToken || "");
  const [errorMsg, setErrorMsg]     = useState("");

  const phoneCodeResolver = useRef(null);
  const passwordResolver  = useRef(null);

  useEffect(() => {
    if (existingToken) navigate("/");
  }, [existingToken, navigate]);

  const startLogin = async (e) => {
    e.preventDefault();
    if (!apiId || !apiHash || !phoneNumber) {
      setErrorMsg("Please fill out API ID, Hash, and Phone Number.");
      return;
    }
    setErrorMsg("");
    setStep(2);
    try {
      const { client, token } = await initializeTelegramLogin({
        apiId, apiHash, phoneNumber,
        phoneCodeCallback: async () => {
          setStep(3);
          return new Promise(r => { phoneCodeResolver.current = r; });
        },
        passwordCallback: async () => {
          setStep(4);
          return new Promise(r => { passwordResolver.current = r; });
        },
        onErrorCallback: (err) => {
          setErrorMsg(err.message || "An error occurred during login.");
        },
      });
      setSessionToken(token);
      setCookie("telegram_apiId", apiId);
      setCookie("telegram_apiHash", apiHash);
      setCookie("telegram_token", token);
      setStep(5);
      if (onLoginSuccess) onLoginSuccess(client, token);
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Failed to initialize Telegram client.");
      setStep(1);
    }
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (phoneCodeResolver.current) {
      phoneCodeResolver.current(phoneCode);
      setStep(2);
    }
  };

  const submitPassword = (e) => {
    e.preventDefault();
    if (passwordResolver.current) {
      passwordResolver.current(password);
      setStep(2);
    }
  };

  const handleLogout = () => {
    deleteCookie("telegram_token");
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    setSessionToken("");
    setStep(1);
    setPhoneNumber(undefined);
    setPhoneCode(""); setPassword(""); setErrorMsg("");
  };

  const stepCount = 3;
  const currentDot = step === 1 ? 1 : step <= 2 ? 1 : step === 3 ? 2 : 3;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#07080f]">

      {/* Ambient orbs */}
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />

      {/* Grid texture overlay */}
      <div className="fixed inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-black/60">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Unlimited Storage</h1>
            <p className="text-slate-500 text-sm mt-1">Connect your Telegram account</p>

            {/* Step dots */}
            {step !== 5 && (
              <div className="flex items-center gap-2 mt-5">
                {[1, 2, 3].map(i => (
                  <StepDot key={i} active={currentDot === i} done={currentDot > i} />
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm animate-scale-in">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Credentials */}
          {step === 1 && (
            <form onSubmit={startLogin} className="flex flex-col gap-5 animate-fade-up">
              <Field label="API ID">
                <input
                  type="text"
                  value={apiId}
                  onChange={e => setApiId(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 1234567"
                  required
                />
              </Field>
              <Field label="API Hash">
                <input
                  type="password"
                  value={apiHash}
                  onChange={e => setApiHash(e.target.value)}
                  className={inputCls}
                  placeholder="32-character hex string"
                  required
                />
              </Field>
              <Field label="Phone Number">
                <div className="px-4 py-3 rounded-xl bg-[#0d0f1c] border border-white/[0.08] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/25 transition-all duration-200">
                  <PhoneInput
                    international
                    withCountryCallingCode
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    defaultCountry="IN"
                    className="custom-phone-input"
                  />
                </div>
              </Field>
              <PrimaryButton type="submit" className="mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Account
              </PrimaryButton>
              <p className="text-center text-xs text-slate-600 mt-1">
                Get your API credentials at{" "}
                <span className="text-indigo-400 font-medium">my.telegram.org</span>
              </p>
            </form>
          )}

          {/* Step 2: Connecting */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-10 gap-6 animate-fade-in">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
                <div className="absolute inset-2 rounded-full bg-indigo-500/10 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">Connecting to Telegram</p>
                <p className="text-slate-600 text-sm mt-1">Establishing MTProto session…</p>
              </div>
            </div>
          )}

          {/* Step 3: Phone Code */}
          {step === 3 && (
            <form onSubmit={submitCode} className="flex flex-col gap-5 animate-fade-up">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Check your Telegram app for a login code.</p>
              </div>
              <Field label="Login Code">
                <input
                  type="text"
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value)}
                  className={inputCls}
                  placeholder="12345"
                  autoFocus
                  required
                />
              </Field>
              <PrimaryButton type="submit">Verify Code</PrimaryButton>
            </form>
          )}

          {/* Step 4: 2FA Password */}
          {step === 4 && (
            <form onSubmit={submitPassword} className="flex flex-col gap-5 animate-fade-up">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-1">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Enter your 2-step verification password.</p>
              </div>
              <Field label="2FA Password">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="••••••••"
                  autoFocus
                  required
                />
              </Field>
              <PrimaryButton type="submit">Authenticate</PrimaryButton>
            </form>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="flex flex-col items-center gap-5 py-8 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-slate-100 font-semibold text-lg">Connected!</p>
                <p className="text-slate-500 text-sm mt-1">Session saved. Redirecting…</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors mt-2 underline underline-offset-2"
              >
                Disconnect account
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-700 mt-5">
          Your credentials are stored locally in browser cookies only.
        </p>
      </div>
    </div>
  );
}
