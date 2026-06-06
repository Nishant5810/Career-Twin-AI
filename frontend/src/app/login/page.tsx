"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Lock, Mail, AlertCircle } from "lucide-react";
import { api } from "../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    const demoEmail = "karthik.r@careertwin.ai";
    const demoPass = "karthik123";

    try {
      // Try logging in. If not exists, register first
      try {
        const data = await api.login(demoEmail, demoPass);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } catch {
        // Register demo user
        await api.register(demoEmail, demoPass, "Karthik R");
        const data = await api.login(demoEmail, demoPass);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Demo authentication failed. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a16] flex flex-col justify-center items-center px-6 selection:bg-indigo-500 selection:text-white">
      <div className="mb-8 flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white">CareerTwin AI</span>
          <span className="block text-[9px] text-slate-400 font-semibold tracking-wider">YOUR FUTURE, PREDICTED SMARTER</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#0c0d24] border border-indigo-950/60 p-8 rounded-2xl shadow-xl shadow-indigo-950/20">
        <h2 className="text-2xl font-bold mb-1 text-white text-center">Welcome back</h2>
        <p className="text-slate-400 text-xs text-center mb-8">Enter your credentials to access your Career Digital Twin.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#151735]/60 border border-indigo-950 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-950/30 transition duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#151735]/60 border border-indigo-950 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-950/30 transition duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-indigo-950/80"></span>
          </div>
          <span className="relative bg-[#0c0d24] px-4 text-slate-500 text-[10px] uppercase font-semibold">Or bypass details</span>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-sm transition"
        >
          Explore in Sandbox Demo Mode
        </button>

        <p className="text-center text-xs text-slate-500 mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
