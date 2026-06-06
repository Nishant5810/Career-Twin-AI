"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Brain, Briefcase, ChevronRight, Award, Compass, LineChart, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#090a16] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0b0c20]/85 backdrop-blur-md border-b border-indigo-900/30 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                CareerTwin AI
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                YOUR FUTURE, PREDICTED SMARTER
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#twin" className="hover:text-white transition">Digital Twin</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-indigo-500 to-purple-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-indigo-800"
            >
              <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-[#090a16] rounded-xl group-hover:bg-opacity-0">
                Get Started Free
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-semibold tracking-wide mb-8 animate-float">
            <span>🚀 Introducing AI-Powered Career Digital Twins</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-8 max-w-4xl mx-auto">
            Build your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Digital Career Twin
            </span>{" "}
            and simulate outcomes
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume to instantly audit skill gaps, predict role fit percentages, forecast salary trajectories, and interact with your predictive digital twin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 group w-full sm:w-auto"
            >
              Simulate Your Career Now
              <ArrowRight className="h-5 w-5 ml-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-300 font-semibold rounded-xl transition duration-200 w-full sm:w-auto"
            >
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-[#060714]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete career intelligence suite
            </h2>
            <p className="text-slate-400">
              Powered by customized XGBoost models and structured NLP parsing algorithms to audit and optimize your professional trajectory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0c0d24] border border-indigo-950/40 hover:border-indigo-800/40 transition duration-300">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl inline-block mb-6">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resume & ATS Analyzer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Scan your PDF/DOCX resume. Extract structured schemas (skills, work history, certifications) and calculate direct ATS compatibility match metrics.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0c0d24] border border-indigo-950/40 hover:border-indigo-800/40 transition duration-300">
              <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl inline-block mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Role Probability Predictor</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Evaluate fit percentages across multiple career tracks (ML Engineer, Cloud Architect, DevOps) matching current skills with live trends.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0c0d24] border border-indigo-950/40 hover:border-indigo-800/40 transition duration-300">
              <div className="p-3 bg-pink-600/10 text-pink-400 rounded-xl inline-block mb-6">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Salary growth curves</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyze your current potential and forecast income curves over 1, 3, and 5 years. Directly compare your predictions to local benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Digital Twin Section */}
      <section id="twin" className="py-24 relative overflow-hidden bg-[#090a16] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-semibold tracking-wide mb-6">
              <span>✨ Flagship Feature</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Virtual Career Twin Simulation
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              What if you spent the next three months mastering AWS cloud architecture or built five machine learning projects? Simulate credentials, skill advancements, and project portfolio completions to dynamically redraw your future salary curves and hiring probabilities.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-slate-300 text-sm">
                <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Simulate AWS/Azure cloud certification impact</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300 text-sm">
                <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Instantly map changes to salary growth timelines</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300 text-sm">
                <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Discover highly custom technical roadmaps</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#0c0d24] border border-indigo-950/40 relative shadow-2xl shadow-indigo-950/30">
            <div className="flex items-center justify-between border-b border-indigo-950/80 pb-6 mb-6">
              <div>
                <span className="text-xs text-indigo-400 uppercase font-semibold">Career Digital Twin</span>
                <h4 className="font-bold text-lg">Simulation Workspace</h4>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AWS Simulation Active</span>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-950/50">
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Scenario Description</p>
                <p className="text-sm font-semibold">"If I learn AWS in 3 months"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-950/50">
                  <p className="text-xs text-slate-400 uppercase font-medium mb-1">Potential Salary</p>
                  <p className="text-2xl font-bold text-indigo-400">₹16.5 LPA</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-950/50">
                  <p className="text-xs text-slate-400 uppercase font-medium mb-1">Probability Increase</p>
                  <p className="text-2xl font-bold text-emerald-400">+24%</p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/register" className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition">
                  Run New Custom Simulations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 bg-[#060714]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-400">
              Unlock access to your virtual predictive twins and customized analytics dashboards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-[#090a1c] border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">Basic analytics for career testing.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-slate-400 text-sm"> / forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>1 Resume Upload & Parse</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Basic Skill Extraction</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Role Predictions list</span>
                  </li>
                </ul>
              </div>
              <Link href="/register" className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-xl text-sm font-semibold transition">
                Start Free
              </Link>
            </div>

            {/* Premium */}
            <div className="p-8 rounded-2xl bg-[#0e0f2b] border border-indigo-500/30 flex flex-col justify-between relative shadow-xl shadow-indigo-950/20">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Premium Pro</h3>
                <p className="text-slate-400 text-sm mb-6">Complete career acceleration package.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹999</span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Unlimited Resume Uploads & ATS Audits</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Interactive Career Digital Twin (Simulations)</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Personalized 4-Week Roadmaps & Projects</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    <span>24/7 AI Career Mentor chatbot advisor</span>
                  </li>
                </ul>
              </div>
              <Link href="/register" className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-[#060714] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CareerTwin AI. Built for modern professionals.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
