import { useState } from "react";
import { Eye, EyeOff, Clipboard, Check, Loader2, KeyRound } from "lucide-react";

const API_BASE = "http://localhost:5003/api/auth";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const resetFormState = (newMode) => {
    setMode(newMode);
    setError("");
    setResult(null);
    setShowPassword(false);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/signup" : "/login";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check your details.");
        return;
      }

      if (mode === "login") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("apiKey", data.apiKey);
      }

      setResult(data);
    } catch {
      setError("Network connectivity issue. Please check if the authentication service is online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative subtle background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo/Brand Identity Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 ring-1 ring-white/10">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access secure telemetry data and endpoint tokens
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          {/* Custom Segmented Control (Tabs) */}
          <div className="grid grid-cols-2 bg-slate-950 border border-slate-800/50 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => resetFormState("login")}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "login"
                  ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => resetFormState("signup")}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition duration-150 text-sm"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition duration-150 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : mode === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Feedback States */}
          {error && (
            <div className="mt-5 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl p-3.5 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 animate-fadeIn">
              <p className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {mode === "signup"
                  ? "Account verified and provisioned."
                  : "Session authorized successfully."}
              </p>

              {result.apiKey && (
                <>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Personal API Token
                  </label>

                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 items-center">
                    <code className="flex-1 px-2 text-xs font-mono text-slate-300 truncate select-all">
                      {result.apiKey}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopy(result.apiKey)}
                      className={`px-3 py-1.5 rounded-md font-medium text-xs transition duration-150 flex items-center gap-1.5 ${
                        copied
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                    Include this token payload inside the{" "}
                    <span className="font-mono text-slate-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                      x-api-key
                    </span>{" "}
                    header parameters when targeting external webhooks.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}