"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Lock, Mail, User, AlertCircle } from "lucide-react";
import { api } from "../utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register(email, password, fullName);
      // Automatically log them in after registration
      const loginData = await api.login(email, password);
      localStorage.setItem("token", loginData.access_token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Try a different email.");
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
        <h2 className="text-2xl font-bold mb-1 text-white text-center">Create account</h2>
        <p className="text-slate-400 text-xs text-center mb-8">Begin simulating future career paths today.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Karthik R"
                className="w-full pl-10 pr-4 py-3 bg-[#151735]/60 border border-indigo-950 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-950/30 transition duration-150"
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-[#151735]/60 border border-indigo-950 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-950/30 transition duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#4f46e5] hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
