import React, { useState, useRef, useEffect } from "react";
import { initializeTelegramLogin } from "../telegramApi";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

// ─── Step label ───────────────────────────────────────────────
const STEP_LABELS = ["Credentials", "Connecting", "Verify Code", "2FA Password", "Done"];

function StepBar({ step }) {
  if (step >= 5) return null;
  const displayStep = step <= 2 ? 1 : step === 3 ? 2 : 3;
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-1 rounded-full transition-all duration-500 ${
            i < displayStep ? 'w-8 bg-indigo-500' :
            i === displayStep ? 'w-8 bg-indigo-500' :
            'w-8 bg-white/[0.06]'
          }`} />
        </div>
      ))}
    </div>
  );
}

// ─── Input wrapper ────────────────────────────────────────────
function InputField({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {hint && <span className="text-[11px] text-slate-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = `
  w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-100
  placeholder:text-slate-600 bg-white/[0.03] border border-white/[0.08]
  focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.05]
  transition-all duration-200
`.replace(/\s+/g, ' ').trim();

// ─── Feature pill for the left panel ──────────────────────────
function FeaturePill({ icon, text, delay }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-[13px] font-medium text-slate-400">{text}</span>
    </div>
  );
}

// ─── API Guide (collapsible) ──────────────────────────────────
function GuideStep({ number, title, description }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[11px] font-bold text-indigo-400">{number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-300 leading-snug">{title}</p>
        <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ApiGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-slate-500 hover:text-indigo-400 transition-colors py-2 group"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {open ? "Hide guide" : "How do I get API ID & Hash?"}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4 animate-fade-up">
          <GuideStep
            number="1"
            title="Open my.telegram.org"
            description="Go to my.telegram.org in your browser and log in with your phone number."
          />
          <GuideStep
            number="2"
            title='Click "API development tools"'
            description="After logging in, you'll see a link to API development tools. Click it."
          />
          <GuideStep
            number="3"
            title="Create an application"
            description='Fill in any App title (e.g. "NexGenStorage"), short name, and select Web as the platform.'
          />
          <GuideStep
            number="4"
            title="Copy your credentials"
            description="You'll see your App api_id (a number) and App api_hash (a 32-character string). Paste them above."
          />

          <a
            href="https://my.telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-[12px] font-semibold transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open my.telegram.org
          </a>
        </div>
      )}
    </div>
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
      setErrorMsg("Please fill out all fields.");
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

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#07080f]">

      {/* ─── Left Panel: Brand Hero ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden">

        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#07080f] to-violet-950/30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/[0.06] rounded-full blur-[100px]" />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">NexGenStorage</span>
          </div>
        </div>

        {/* Center: Hero text + features */}
        <div className="relative z-10 -mt-8">
          <h1 className="text-[2.75rem] font-extrabold text-slate-100 leading-tight tracking-tight mb-4">
            Your Telegram,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              your drive.
            </span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-sm mb-10">
            Turn any Telegram chat into organized, unlimited cloud storage. No servers, no limits, completely free.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2.5">
            <FeaturePill icon="📂" text="Folder system" delay={0} />
            <FeaturePill icon="🔍" text="Search & sort" delay={80} />
            <FeaturePill icon="📤" text="Direct uploads" delay={160} />
            <FeaturePill icon="🔒" text="Client-side only" delay={240} />
            <FeaturePill icon="📊" text="Storage analytics" delay={320} />
          </div>
        </div>

        {/* Bottom: Trust note */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Powered by Telegram's MTProto API. Your credentials never leave your browser.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Form ───────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm animate-fade-up">

          {/* Mobile-only brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">NexGenStorage</span>
          </div>

          {/* Step progress bar */}
          <StepBar step={step} />

          {/* Error toast */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/15 text-red-400 p-3.5 rounded-xl mb-6 text-[13px] animate-scale-in">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ───── Step 1: Credentials ───── */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-1">Connect your account</h2>
              <p className="text-sm text-slate-500 mb-7">
                Enter your Telegram API credentials to get started.
              </p>

              <form onSubmit={startLogin} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="API ID">
                    <input
                      type="text"
                      value={apiId}
                      onChange={e => setApiId(e.target.value)}
                      className={inputCls}
                      placeholder="1234567"
                      required
                    />
                  </InputField>
                  <InputField label="API Hash">
                    <input
                      type="password"
                      value={apiHash}
                      onChange={e => setApiHash(e.target.value)}
                      className={inputCls}
                      placeholder="••••••••"
                      required
                    />
                  </InputField>
                </div>

                <InputField label="Phone number">
                  <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus-within:border-indigo-500/60 focus-within:bg-white/[0.05] transition-all duration-200">
                    <PhoneInput
                      international
                      withCountryCallingCode
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      defaultCountry="IN"
                      className="custom-phone-input"
                    />
                  </div>
                </InputField>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all duration-200 active:scale-[0.98] mt-2 shadow-lg shadow-indigo-600/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect
                </button>
              </form>

              {/* ── How to get credentials guide ── */}
              <ApiGuide />
            </div>
          )}

          {/* ───── Step 2: Connecting ───── */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fade-in">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin-smooth" />
              </div>
              <div className="text-center">
                <p className="text-slate-200 font-semibold">Connecting…</p>
                <p className="text-slate-600 text-sm mt-1">Establishing secure session</p>
              </div>
            </div>
          )}

          {/* ───── Step 3: Phone Code ───── */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-1">Verification code</h2>
              <p className="text-sm text-slate-500 mb-7">
                Check your Telegram app for a login code.
              </p>
              <form onSubmit={submitCode} className="flex flex-col gap-4">
                <InputField label="Login Code" hint="5 digits">
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={e => setPhoneCode(e.target.value)}
                    className={inputCls + " text-center tracking-[0.3em] text-lg"}
                    placeholder="• • • • •"
                    autoFocus
                    required
                    maxLength={5}
                  />
                </InputField>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 active:scale-[0.98] mt-1 shadow-lg shadow-indigo-600/20"
                >
                  Verify
                </button>
              </form>
            </div>
          )}

          {/* ───── Step 4: 2FA Password ───── */}
          {step === 4 && (
            <div className="animate-fade-up">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-1">Two-factor auth</h2>
              <p className="text-sm text-slate-500 mb-7">
                Enter your 2-step verification password.
              </p>
              <form onSubmit={submitPassword} className="flex flex-col gap-4">
                <InputField label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                </InputField>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 active:scale-[0.98] mt-1 shadow-lg shadow-indigo-600/20"
                >
                  Authenticate
                </button>
              </form>
            </div>
          )}

          {/* ───── Step 5: Success ───── */}
          {step === 5 && (
            <div className="flex flex-col items-center gap-5 py-12 animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-slate-100 font-semibold text-lg">Connected</p>
                <p className="text-slate-500 text-sm mt-1">Redirecting to your drives…</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors mt-2"
              >
                Disconnect account
              </button>
            </div>
          )}

          {/* Bottom trust badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-slate-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Stored locally in browser cookies only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
