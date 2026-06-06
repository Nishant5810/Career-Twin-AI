"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Brain, FileText, BarChart3, LineChart as LineChartIcon, Map, Award, 
  TrendingUp, CheckSquare, Layers, HelpCircle, User as UserIcon, Bell, 
  Search, ArrowRight, Upload, CheckCircle2, ChevronRight, Play, Send,
  Cpu, Briefcase, GraduationCap, AlertCircle, LogOut, Settings, CreditCard,
  Plus, ExternalLink, ShieldCheck, RefreshCw, Star
} from "lucide-react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar
} from "recharts";
import { api } from "../utils/api";

const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#eab308", "#f97316", "#ef4444"];

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // App state
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local interactive states
  const [localSkills, setLocalSkills] = useState<any>(null);
  const [localProjects, setLocalProjects] = useState<any>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical Skills");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Intermediate");

  // Mock Interview State
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [interviewEvaluation, setInterviewEvaluation] = useState("");

  // Custom controls state
  const [selectedRole, setSelectedRole] = useState("ML Engineer");
  const [simAws, setSimAws] = useState(false);
  const [simProjects, setSimProjects] = useState(0);
  const [simAzure, setSimAzure] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  
  // Roadmap detail view state
  const [selectedWeek, setSelectedWeek] = useState<number>(2);
  const [updatingWeekId, setUpdatingWeekId] = useState<number | null>(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Hi Karthik! I'm your AI Career Mentor. Ask me anything about your career, skills, roadmap, resume or interview preparation." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Resume upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Profile settings state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification center state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoSaveTwin, setAutoSaveTwin] = useState(true);

  // Billing & plans state
  const [billingPlan, setBillingPlan] = useState("Premium User");

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    // Scroll chat to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // Mock token fallback for premium UI demonstration if offline
        localStorage.setItem("token", "demo-token");
      }
      
      const dashboardData = await api.getDashboardData();
      setData(dashboardData);
      setSimResult(dashboardData.digital_twin_default);
      setLocalSkills(dashboardData.skills);
      setLocalProjects(dashboardData.projects);
      
      const storedUser = localStorage.getItem("user");
      let currentUser = null;
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      } else {
        currentUser = { full_name: "Karthik R", role: "Premium User", email: "karthik.r@careertwin.ai" };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      setUser(currentUser);
      setProfileName(currentUser.full_name || "");
      setProfileEmail(currentUser.email || "");
      setProfileRole(currentUser.role || "Premium User");
      setBillingPlan(currentUser.role || "Premium User");
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Trigger Resume file select
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      await api.analyzeResume(file);
      // Refresh dashboard data
      const dashboardData = await api.getDashboardData();
      setData(dashboardData);
      setSimResult(dashboardData.digital_twin_default);
      setLocalSkills(dashboardData.skills);
      setLocalProjects(dashboardData.projects);
      
      // Add mentor notification
      setChatMessages(prev => [
        ...prev, 
        { sender: "bot", text: `I have successfully analyzed your resume "${file.name}"! Your new Resume score is ${dashboardData.stats.resume_score}/100 and I have customized your career forecast and roadmap.` }
      ]);
      setActiveTab("resume-analyzer");
    } catch (err: any) {
      setUploadError(err.message || "Failed to process resume.");
    } finally {
      setUploading(false);
    }
  };

  // Add custom skill to profile
  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkillObj = {
      name: newSkillName.trim(),
      proficiency_level: newSkillProficiency,
      maturity_score: newSkillProficiency === "Advanced" ? 90 : newSkillProficiency === "Intermediate" ? 70 : 40
    };

    setLocalSkills((prev: any) => {
      const updated = { ...prev };
      if (!updated[newSkillCategory]) {
        updated[newSkillCategory] = [];
      }
      updated[newSkillCategory] = [...updated[newSkillCategory], newSkillObj];
      return updated;
    });

    setNewSkillName("");
  };

  // Toggle project status locally
  const handleToggleProjectStatus = (projectId: number) => {
    setLocalProjects((prev: any[]) => 
      prev.map((p: any) => {
        if (p.id === projectId) {
          const nextStatus = 
            p.status === "not_started" ? "in_progress" :
            p.status === "in_progress" ? "completed" : "not_started";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Mock Q&A questions list
  const mockInterviewQuestions = [
    {
      q: "Explain the difference between bagging and boosting, and when you would use each.",
      suggested: "Bagging (Bootstrap Aggregating) reduces variance by training models in parallel on random data subsets (e.g. Random Forest). Boosting reduces bias by training models sequentially, where each model focuses on errors from the previous model (e.g. XGBoost). Use bagging to prevent overfitting, and boosting for high predictive accuracy."
    },
    {
      q: "How would you design a scalable web scraper for extracting job market demand datasets?",
      suggested: "Design a distributed crawler with worker nodes pulling URLs from a message queue like RabbitMQ, using proxy rotation and custom throttling to avoid rate limits, parsing text with PyQuery/BeautifulSoup, and loading structured datasets into Elasticsearch/MySQL with duplicate check hashes."
    },
    {
      q: "What is your experience containerizing machine learning models with Docker?",
      suggested: "Write a Dockerfile using a lightweight Python base (e.g. python:3.9-slim), install dependencies (numpy, fastapi, xgboost), expose the port, copy model weights (.pkl or .bin), run uvicorn server, and optimize build cache with layers."
    }
  ];

  // Evaluate mockup answers
  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewAnswer.trim()) return;
    setEvaluatingAnswer(true);
    setTimeout(() => {
      const answersLength = interviewAnswer.trim().length;
      let score = 55;
      let feedback = "";
      if (answersLength > 150) {
        score = 88;
        feedback = "Excellent! You provided a highly thorough and technical answer, outlining structural components, specific tools (like Python/FastAPI/Docker), and architectural trade-offs. To get a perfect score, mention scalability constraints or monitoring model drift.";
      } else if (answersLength > 50) {
        score = 72;
        feedback = "Good response! You hit key technical concepts, but it lacks specific architecture examples or deployment strategies. Expand your details on containerization commands or scikit-learn models.";
      } else {
        score = 45;
        feedback = "Response is too brief. Be more specific about tools, databases, modeling libraries (e.g., PyTorch, XGBoost), and how you implement them in production systems.";
      }
      setInterviewEvaluation(`Mock Score: ${score}/100\n\nEvaluation Feedback:\n${feedback}\n\nSuggested Key Phrases to Include:\n"${mockInterviewQuestions[selectedQuestionIndex].suggested.slice(0, 180)}..."`);
      setEvaluatingAnswer(false);
    }, 1200);
  };

  // Run Twin Simulation
  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const result = await api.simulate({
        target_role: selectedRole,
        aws_learned: simAws,
        ml_projects_count: simProjects,
        azure_certified: simAzure
      });
      setSimResult(result);
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setSimulating(false);
    }
  };

  // Toggle week status in learning roadmap
  const handleWeekStatusToggle = async (weekId: number, currentStatus: string) => {
    setUpdatingWeekId(weekId);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await api.updateRoadmapWeek(weekId, newStatus);
      // Update local state to be snappy
      setData((prev: any) => {
        if (!prev || !prev.roadmap) return prev;
        const updatedWeeks = prev.roadmap.weeks.map((w: any) => 
          w.id === weekId ? { ...w, status: newStatus } : w
        );
        return {
          ...prev,
          roadmap: {
            ...prev.roadmap,
            progress_percentage: res.overall_progress ?? prev.roadmap.progress_percentage,
            weeks: updatedWeeks
          }
        };
      });
    } catch (error) {
      console.error("Roadmap toggle error:", error);
    } finally {
      setUpdatingWeekId(null);
    }
  };

  // Send message to AI mentor
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setSendingChat(true);

    try {
      const response = await api.chat(userMsg);
      setChatMessages(prev => [...prev, { sender: "bot", text: response.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: "bot", text: "I'm having trouble connecting to my knowledge index right now. Please verify if the API server is online." }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const updatedUser = {
      ...user,
      full_name: profileName,
      email: profileEmail,
      role: profileRole
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Upgrade or change subscription plan
  const handleUpgradePlan = (newRole: string) => {
    const updatedUser = {
      ...user,
      role: newRole
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setProfileRole(newRole);
    setBillingPlan(newRole);

    setChatMessages(prev => [
      ...prev,
      { sender: "bot", text: `Plan Upgrade Successful! Welcome to the ${newRole} Tier. You have unlocked unlimited twin simulations, recruiter matchmaking lists, and continuous ATS resume profiling.` }
    ]);
  };

  if (!mounted) return null;

  // Render Skeleton Screen
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f4f6fc] dark:bg-[#090a16] flex items-center justify-center">
        <div className="space-y-6 w-full max-w-5xl px-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-slate-300 dark:bg-slate-800 rounded-lg w-48 animate-pulse"></div>
            <div className="h-10 bg-slate-300 dark:bg-slate-800 rounded-lg w-28 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-300 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-slate-300 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-96 bg-slate-300 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Formatting sparklines for SVG rendering
  const getSparklineSvgPath = (points: number[]) => {
    if (!points || points.length < 2) return "";
    const width = 120;
    const height = 40;
    const maxVal = Math.max(...points);
    const minVal = Math.min(...points);
    const range = maxVal - minVal || 1;
    
    return points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - minVal) / range) * (height - 8) - 4;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  // Extract variables for simpler dashboard display
  const stats = data.stats;
  const careerPredictions = data.career_predictions;
  const salaryPredictions = data.salary_predictions;
  const skillGaps = data.skill_gaps;
  const roadmap = data.roadmap;
  const marketTrends = data.market_trends;

  // Active roadmap week details
  const activeWeekDetail = roadmap?.weeks.find((w: any) => w.week_number === selectedWeek);

  // Salary Prediction Chart coordinates based on selected role
  const selectedRoleSalaryObj = salaryPredictions.find((s: any) => s.role === selectedRole) || salaryPredictions[0];
  const salaryChartData = [
    { period: "Now", salary: selectedRoleSalaryObj.current_salary },
    { period: "1 Year", salary: selectedRoleSalaryObj.year_1_salary },
    { period: "3 Years", salary: selectedRoleSalaryObj.year_3_salary },
    { period: "5 Years", salary: selectedRoleSalaryObj.year_5_salary }
  ];

  // Mapped Sidebar Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Cpu },
    { id: "resume-analyzer", label: "Resume Analyzer", icon: FileText },
    { id: "skill-intelligence", label: "Skill Intelligence", icon: Layers },
    { id: "career-predictor", label: "Career Predictor", icon: TrendingUp },
    { id: "salary-predictor", label: "Salary Predictor", icon: LineChartIcon },
    { id: "learning-roadmap", label: "Learning Roadmap", icon: Map },
    { id: "projects", label: "Project Recommendations", icon: Award },
    { id: "job-insights", label: "Job Market Insights", icon: BarChart3 },
    { id: "interview-readiness", label: "Interview Readiness", icon: GraduationCap },
    { id: "placement-predictor", label: "Placement Predictor", icon: CheckSquare },
    { id: "career-twin", label: "Career Digital Twin", icon: Cpu, isPulse: true },
    { id: "ai-mentor", label: "AI Career Mentor", icon: HelpCircle }
  ];

  // Helper renderer: Overview Dashboard Page
  const renderDashboardOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Row of 4 Metric Sparkline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Resume Score */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.01] transition duration-200">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Resume Score</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold dark:text-white">{stats.resume_score}</span>
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 mt-2 block">Excellent</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl mb-2">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <svg className="w-[100px] h-[35px] overflow-visible" stroke="#10b981" strokeWidth="2" fill="none">
              <path d={getSparklineSvgPath(stats.resume_score_sparkline)} />
            </svg>
          </div>
        </div>

        {/* Career Fit Score */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.01] transition duration-200">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Career Fit Score</p>
            <div className="flex items-baseline space-x-0.5">
              <span className="text-3xl font-extrabold dark:text-white">{stats.career_fit_score}</span>
              <span className="text-xs text-slate-400 font-semibold">%</span>
            </div>
            <span className="text-[10px] font-bold text-purple-500 mt-2 block">Very High</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl mb-2">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <svg className="w-[100px] h-[35px] overflow-visible" stroke="#8b5cf6" strokeWidth="2" fill="none">
              <path d={getSparklineSvgPath(stats.career_fit_sparkline)} />
            </svg>
          </div>
        </div>

        {/* Interview Ready */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.01] transition duration-200">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Interview Ready</p>
            <div className="flex items-baseline space-x-0.5">
              <span className="text-3xl font-extrabold dark:text-white">{stats.interview_ready_score}</span>
              <span className="text-xs text-slate-400 font-semibold">%</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-500 mt-2 block">Good</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl mb-2">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <svg className="w-[100px] h-[35px] overflow-visible" stroke="#4f46e5" strokeWidth="2" fill="none">
              <path d={getSparklineSvgPath(stats.interview_ready_sparkline)} />
            </svg>
          </div>
        </div>

        {/* Placement Probability */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:scale-[1.01] transition duration-200">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">Placement Probability</p>
            <div className="flex items-baseline space-x-0.5">
              <span className="text-3xl font-extrabold dark:text-white">{stats.placement_probability_score}</span>
              <span className="text-xs text-slate-400 font-semibold">%</span>
            </div>
            <span className="text-[10px] font-bold text-orange-500 mt-2 block">High Chance</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl mb-2">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <svg className="w-[100px] h-[35px] overflow-visible" stroke="#f97316" strokeWidth="2" fill="none">
              <path d={getSparklineSvgPath(stats.placement_probability_sparkline)} />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Top Predictions Card */}
          <div className="glass-card p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-sm font-extrabold mb-1 dark:text-white uppercase tracking-wider text-slate-500">Top Career Predictions</h3>
              <p className="text-[11px] text-slate-400 mb-6">Predictions are based on your skills, experience, education and market trends.</p>
              
              <div className="h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={careerPredictions}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="probability"
                    >
                      {careerPredictions.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Fit</span>
                  <span className="text-sm font-bold leading-tight text-slate-800 dark:text-white max-w-[100px]">{careerPredictions[0]?.role}</span>
                  <span className="text-lg font-extrabold text-indigo-500 mt-0.5">{Math.round(careerPredictions[0]?.probability)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {careerPredictions.map((pred: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{pred.role}</span>
                  </div>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{Math.round(pred.probability)}%</span>
                </div>
              ))}
              <button onClick={() => setActiveTab("career-predictor")} className="w-full mt-4 py-2 border border-slate-200 dark:border-indigo-950/60 hover:bg-slate-100 dark:hover:bg-[#161738]/60 text-xs font-semibold rounded-xl dark:text-slate-300 transition">View Full Report</button>
            </div>
          </div>

          {/* Salary predictions */}
          <div className="glass-card p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-extrabold mb-1 dark:text-white uppercase tracking-wider text-slate-500">Salary Prediction</h3>
                <p className="text-[11px] text-slate-400">Forecasted earning trajectory matched to target goals.</p>
              </div>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-100 dark:bg-[#161738]/80 border border-slate-200 dark:border-indigo-950/60 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none text-slate-700 dark:text-slate-200"
              >
                {careerPredictions.map((cp: any, i: number) => (
                  <option key={i} value={cp.role}>{cp.role}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {["Current Salary", "1 Year", "3 Years", "5 Years"].map((label, idx) => {
                const vals = [selectedRoleSalaryObj.current_salary, selectedRoleSalaryObj.year_1_salary, selectedRoleSalaryObj.year_3_salary, selectedRoleSalaryObj.year_5_salary];
                return (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#12142d]/80 rounded-xl border border-slate-200/50 dark:border-indigo-950/30">
                    <p className="text-[10px] text-slate-400 font-semibold mb-1">{label}</p>
                    <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400">₹{vals[idx]} LPA</p>
                  </div>
                );
              })}
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salaryChartData}>
                  <defs>
                    <linearGradient id="salaryColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="L" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0c0d24", border: "1px solid #1f224b", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#6366f1", fontSize: "12px", fontWeight: "bold" }}
                    formatter={(value) => [`₹${value} LPA`, "Salary"]}
                  />
                  <Area type="monotone" dataKey="salary" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#salaryColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Skill Gaps Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-extrabold dark:text-white uppercase tracking-wider text-slate-500">Skill Gap Analysis</h3>
                <button onClick={() => setActiveTab("skill-intelligence")} className="text-[10px] text-indigo-500 hover:underline font-bold">View All</button>
              </div>
              <p className="text-[11px] text-slate-400 mb-6">Compare current skills against target role benchmarks.</p>

              <div className="space-y-4">
                {skillGaps.map((gap: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          gap.priority === "High Priority" ? "bg-red-500" :
                          gap.priority === "Medium Priority" ? "bg-amber-500" : "bg-indigo-400"
                        }`}></span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{gap.skill}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">{gap.priority}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-indigo-950/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          gap.priority === "High Priority" ? "bg-red-500" :
                          gap.priority === "Medium Priority" ? "bg-amber-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${gap.importance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveTab("skill-intelligence")} className="w-full mt-8 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition">
              View Detailed Skill Gap
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Roadmap Card */}
        <div className="glass-card p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-extrabold mb-1 dark:text-white uppercase tracking-wider text-slate-500">Learning Roadmap</h3>
              <p className="text-[11px] text-slate-400">Weekly progress matching your primary target.</p>
            </div>
            <button onClick={() => setActiveTab("learning-roadmap")} className="text-[10px] text-indigo-500 hover:underline font-bold">View Full</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative border-l-2 border-indigo-100 dark:border-indigo-950/60 pl-6 ml-2 space-y-5">
              {roadmap?.weeks.map((wk: any) => (
                <div 
                  key={wk.id} 
                  onClick={() => setSelectedWeek(wk.week_number)}
                  className={`relative cursor-pointer transition ${
                    selectedWeek === wk.week_number ? "text-indigo-500 font-bold" : "text-slate-400"
                  }`}
                >
                  <span className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-[#0c0d24] flex items-center justify-center ${
                    wk.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : 
                    selectedWeek === wk.week_number ? "border-indigo-500" : "border-slate-300 dark:border-indigo-950"
                  }`}>
                    {wk.status === "completed" && <span className="text-[8px] font-bold">✓</span>}
                  </span>
                  <span className="block text-[8px] uppercase tracking-wider">Week {wk.week_number}</span>
                  <p className="text-xs truncate max-w-[100px]">{wk.topic}</p>
                </div>
              ))}
            </div>

            {activeWeekDetail && (
              <div className="p-3 bg-slate-50 dark:bg-[#12142d]/80 border border-slate-200/50 dark:border-indigo-950/30 rounded-xl text-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{activeWeekDetail.topic}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>Progress</span>
                      <span>{activeWeekDetail.status === "completed" ? "100%" : "60%"}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-indigo-950/60 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: activeWeekDetail.status === "completed" ? "100%" : "60%" }}></div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleWeekStatusToggle(activeWeekDetail.id, activeWeekDetail.status)}
                  className="w-full mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-[10px] transition"
                >
                  {activeWeekDetail.status === "completed" ? "Incomplete" : "Complete →"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Market demand trends */}
        <div className="glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-extrabold dark:text-white uppercase tracking-wider text-slate-500">Job Market Insights</h3>
              <button onClick={() => setActiveTab("job-insights")} className="text-[10px] text-indigo-500 hover:underline font-bold">View All</button>
            </div>
            <p className="text-[11px] text-slate-400 mb-6">Live demand tracking index for industry technologies.</p>
            <div className="space-y-2">
              {marketTrends.slice(0, 4).map((trend: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                  <span className="font-semibold dark:text-slate-200">{trend.name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-500 font-bold">{trend.trend_type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Twin simulation preview */}
        <div className="glass-card p-6 rounded-2xl bg-[#0b0c20] text-slate-300 border border-indigo-950/60 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-indigo-950/80 pb-3 mb-3">
              <div>
                <h3 className="text-white text-xs font-extrabold tracking-wider uppercase">Career Digital Twin</h3>
                <p className="text-[9px] text-slate-400">AWS master simulation scenario</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded">Simulation Preview</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span>Simulated Salary (3y):</span>
                <span className="font-bold text-indigo-400">₹{simResult?.simulated_salary_3y} LPA</span>
              </div>
              <div className="flex justify-between">
                <span>Probability Boost:</span>
                <span className="font-bold text-emerald-400">+{Math.round(simResult?.probability_increase)}%</span>
              </div>
            </div>
          </div>
          <button onClick={() => setActiveTab("career-twin")} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-center text-xs transition">
            Run Simulations
          </button>
        </div>
      </div>

      {/* Quick AI Mentor Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-indigo-500/20 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-white" />
          <div>
            <h4 className="font-bold text-white text-xs">Need customized career advice?</h4>
            <p className="text-[10px] text-[#b4b4e9]">Ask your AI Mentor about skill updates, resume scoring, or system design prep.</p>
          </div>
        </div>
        <button onClick={() => setActiveTab("ai-mentor")} className="px-4 py-1.5 bg-white text-indigo-900 text-xs font-bold rounded-lg hover:bg-indigo-50 transition">
          Launch Chat
        </button>
      </div>
    </div>
  );

  // Helper renderer: Resume Analyzer View
  const renderResumeAnalyzer = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Resume & ATS Analyzer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload and audit your resume against recruitment applicant tracking systems.</p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Resume</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone & Gauges */}
        <div className="glass-card p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resume Scores</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-[#12142d]/80 rounded-2xl border border-slate-200/50 dark:border-indigo-950/30 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Resume Score</span>
              <span className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-400">{data.stats.resume_score}</span>
              <span className="text-xs text-slate-400"> /100</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#12142d]/80 rounded-2xl border border-slate-200/50 dark:border-indigo-950/30 text-center">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">ATS Match</span>
              <span className="text-3xl font-extrabold text-emerald-500">{data.stats.placement_probability_score}</span>
              <span className="text-xs text-slate-400"> %</span>
            </div>
          </div>

          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-slate-300 dark:border-indigo-950/60 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition"
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Drag & drop your PDF or DOCX file</p>
            <p className="text-[10px] text-slate-400 mt-1">Files up to 5MB are supported</p>
            {uploading && <p className="text-xs text-indigo-500 font-semibold mt-3 animate-pulse">Analyzing resume contents...</p>}
            {uploadError && <p className="text-xs text-red-500 font-semibold mt-3">{uploadError}</p>}
          </div>
        </div>

        {/* ATS Suggestions / Recommendations Checklist */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">ATS Recommendations Checklist</h3>
          <div className="space-y-3">
            {data.suggestions ? data.suggestions.map((sug: string, idx: number) => (
              <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{sug}</span>
              </div>
            )) : (
              <p className="text-xs text-slate-400">No suggestions available. Upload a resume to scan for errors.</p>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Sections Review */}
      {data.education && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Education */}
          <div className="glass-card p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Extracted Education</span>
            </h4>
            <div className="space-y-4">
              {data.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-indigo-950/20 text-xs">
                  <p className="font-bold text-slate-800 dark:text-white">{edu.degree}</p>
                  <p className="text-slate-500 mt-0.5">{edu.institution}</p>
                  <span className="text-[10px] text-indigo-500 font-semibold mt-1 block">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="glass-card p-5 rounded-2xl shadow-sm md:col-span-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Extracted Experience</span>
            </h4>
            <div className="space-y-4">
              {data.experience ? data.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-indigo-950/20 text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{exp.role}</p>
                      <p className="text-slate-500 text-[10px]">{exp.company}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] rounded font-semibold">{exp.duration}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{exp.description}</p>
                </div>
              )) : (
                <p className="text-xs text-slate-400">No work experience entries extracted.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper renderer: Skill Intelligence View
  const renderSkillIntelligence = () => {
    const skillsToRender = localSkills || data.skills;
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Skill Intelligence Index</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage and analyze your categorized technical, domain, soft and modeling credentials.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill Tag Lists */}
          <div className="lg:col-span-2 space-y-6">
            {skillsToRender && Object.entries(skillsToRender).map(([cat, list]: [string, any]) => (
              <div key={cat} className="glass-card p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4">{cat}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((sk: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-indigo-950/20 flex flex-col justify-between text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800 dark:text-white">{sk.name}</span>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] rounded font-semibold">{sk.proficiency_level}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-indigo-950/40 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${sk.maturity_score}%` }}></div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">{sk.maturity_score}% Maturity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Skill Interactivity Zone */}
          <div className="glass-card p-6 rounded-2xl shadow-sm h-fit space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Add Skill Tool</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Add credentials dynamically to recalculate candidate scores and simulate career fit outcomes.</p>
            
            <form onSubmit={handleAddCustomSkill} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Skill Name</label>
                <input 
                  type="text" 
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. PyTorch, Kubernetes"
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Category</label>
                <select 
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technical Skills">Technical Skills</option>
                  <option value="ML Skills">ML Skills</option>
                  <option value="Domain Skills">Domain Skills</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Proficiency Level</label>
                <select 
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Skill Profile</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Helper renderer: Career Predictor View
  const renderCareerPredictor = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Career Path Predictor</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Explore career predictions, matching probability rates, and required overlap skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fit Donut Chart */}
        <div className="glass-card p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Career Fit Distribution</h3>
          
          <div className="h-56 w-56 relative flex items-center justify-center mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={careerPredictions}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="probability"
                >
                  {careerPredictions.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Match</span>
              <span className="text-base font-extrabold leading-tight dark:text-white mt-1 max-w-[120px]">{careerPredictions[0]?.role}</span>
              <span className="text-2xl font-black text-indigo-500 mt-1">{Math.round(careerPredictions[0]?.probability)}%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {careerPredictions.map((pred: any, i: number) => (
              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/20 text-[10px] font-bold rounded-md flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span>{pred.role}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Roles Details */}
        <div className="lg:col-span-2 space-y-4">
          {careerPredictions.map((pred: any, i: number) => {
            const hasMatch = Math.round(pred.probability) > 70;
            return (
              <div key={i} className="glass-card p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <h4 className="font-extrabold text-sm dark:text-white">{pred.role}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-lg leading-relaxed">
                    Evaluated fit percentage matches technical, ML and cloud credentials for target benchmarks. 
                    {hasMatch ? " High probability overlay indicates optimal technical experience." : " Potential skill gaps found in advanced frameworks."}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                    hasMatch ? "bg-emerald-500/10 text-emerald-500" :
                    Math.round(pred.probability) > 55 ? "bg-indigo-500/10 text-indigo-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {Math.round(pred.probability)}% Match Rate
                  </span>
                  <button onClick={() => { setSelectedRole(pred.role); setActiveTab("salary-predictor"); }} className="text-[10px] text-indigo-500 font-bold hover:underline mt-2 flex items-center space-x-1">
                    <span>Forecast Income</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Helper renderer: Salary Predictor View
  const renderSalaryPredictor = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Salary Growth Curve</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Compare historical salary inputs and forecast future potential curves over 1, 3 and 5 years.</p>
        </div>
        <select 
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-white dark:bg-[#161738]/80 border border-slate-200 dark:border-indigo-950/60 px-4 py-2 rounded-xl text-xs font-semibold outline-none text-slate-700 dark:text-slate-200"
        >
          {careerPredictions.map((cp: any, i: number) => (
            <option key={i} value={cp.role}>{cp.role}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats card */}
        <div className="glass-card p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Salary Growth stats</span>
            <h3 className="font-extrabold text-base mt-1 dark:text-white">{selectedRole}</h3>
            
            <div className="mt-6 space-y-4 text-xs font-medium">
              <div className="flex justify-between border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                <span className="text-slate-400">Baseline entry:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedRoleSalaryObj.current_salary} LPA</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                <span className="text-slate-400">1 Year projection:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedRoleSalaryObj.year_1_salary} LPA</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                <span className="text-slate-400">3 Years projection:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedRoleSalaryObj.year_3_salary} LPA</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400">5 Years projection:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedRoleSalaryObj.year_5_salary} LPA</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
            <span className="text-[9px] text-[#5c5c99] uppercase font-bold block mb-1">Estimated Growth Rate</span>
            <span className="text-2xl font-black text-indigo-500">
              +{Math.round(((selectedRoleSalaryObj.year_5_salary - selectedRoleSalaryObj.current_salary) / selectedRoleSalaryObj.current_salary) * 100)}%
            </span>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Overall salary appreciation forecast matches typical high-performing tech trajectories.</p>
          </div>
        </div>

        {/* Big chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Comparative Income Forecast (LPA)</h3>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryChartData}>
                <defs>
                  <linearGradient id="salaryBigColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="L" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0c0d24", border: "1px solid #1f224b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#6366f1", fontSize: "13px", fontWeight: "bold" }}
                  formatter={(value) => [`₹${value} LPA`, "Salary"]}
                />
                <Area type="monotone" dataKey="salary" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#salaryBigColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper renderer: Learning Roadmap View
  const renderLearningRoadmap = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Structured Learning Roadmap</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly custom roadmap steps focused on learning framework requirements.</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl shadow-sm">
        {/* Progress bar */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-[#12142d]/80 border border-slate-200/50 dark:border-indigo-950/30 rounded-2xl flex items-center justify-between gap-6">
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Overall Progress</span>
            <div className="w-full bg-slate-200 dark:bg-indigo-950/60 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${roadmap?.progress_percentage}%` }}></div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-indigo-500">{roadmap?.progress_percentage}%</span>
            <span className="block text-[8px] text-slate-400 uppercase font-semibold">Weeks Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vertical roadmap list */}
          <div className="lg:col-span-2 relative border-l-2 border-indigo-100 dark:border-indigo-950/60 pl-8 ml-4 space-y-8">
            {roadmap?.weeks.map((wk: any) => (
              <div 
                key={wk.id} 
                onClick={() => setSelectedWeek(wk.week_number)}
                className={`relative cursor-pointer transition p-4 rounded-xl border ${
                  selectedWeek === wk.week_number ? "border-indigo-500 bg-indigo-500/5 text-indigo-500" : "border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-indigo-950"
                }`}
              >
                <span className={`absolute -left-[43px] top-4.5 h-6 w-6 rounded-full border-2 bg-white dark:bg-[#0c0d24] flex items-center justify-center transition ${
                  wk.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : 
                  selectedWeek === wk.week_number ? "border-indigo-500" : "border-slate-300 dark:border-indigo-950"
                }`}>
                  {wk.status === "completed" ? <span className="text-[10px] font-bold">✓</span> : <span className="text-[9px] font-bold">{wk.week_number}</span>}
                </span>

                <span className="block text-[9px] uppercase font-bold tracking-widest text-[#5c5c99]">Week {wk.week_number}</span>
                <h4 className="font-extrabold text-sm dark:text-white mt-1 leading-snug">{wk.topic}</h4>
              </div>
            ))}
          </div>

          {/* Week Detail Panel */}
          {activeWeekDetail && (
            <div className="p-6 bg-slate-50 dark:bg-[#12142d]/80 border border-slate-200/50 dark:border-indigo-950/30 rounded-2xl flex flex-col justify-between text-xs min-h-[350px]">
              <div>
                <span className="text-[10px] text-[#5c5c99] uppercase font-bold tracking-wider">Curriculum Details</span>
                <h4 className="font-bold text-base dark:text-white mt-1.5 leading-snug">{activeWeekDetail.topic}</h4>
                
                <div className="mt-6 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold block">Syllabus Overview</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed leading-snug">
                    Master key foundations, modeling principles, and required framework structures for {activeWeekDetail.topic}. Complete the reading lists and coding exercises to certify the roadmap.
                  </p>
                </div>

                <div className="mt-6">
                  <span className="text-[10px] text-slate-400 font-bold block mb-2">Recommended Resources</span>
                  <div className="space-y-2">
                    {activeWeekDetail.resources.map((res: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={res.link} 
                        className="p-2.5 bg-slate-200 dark:bg-[#1b1d3d] rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-indigo-950 flex items-center justify-between hover:border-indigo-500 transition"
                      >
                        <span className="truncate max-w-[150px]">{res.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleWeekStatusToggle(activeWeekDetail.id, activeWeekDetail.status)}
                disabled={updatingWeekId === activeWeekDetail.id}
                className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center shadow-lg transition"
              >
                {updatingWeekId === activeWeekDetail.id ? "Updating..." : activeWeekDetail.status === "completed" ? "Mark Week as Incomplete" : "Mark Week as Completed ✓"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer: Project Recommendations View
  const renderProjectRecommendations = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Project Recommendations</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete recommended technical projects to dynamically boost candidate match rates and add to your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {localProjects && localProjects.map((p: any) => {
          const isCompleted = p.status === "completed";
          const isInProgress = p.status === "in_progress";
          return (
            <div key={p.id} className="glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    p.difficulty === "Advanced" ? "bg-red-500/10 text-red-500" :
                    p.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {p.difficulty}
                  </span>
                  
                  {/* Status Badge clickable toggler */}
                  <button 
                    onClick={() => handleToggleProjectStatus(p.id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition ${
                      isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      isInProgress ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent"
                    }`}
                  >
                    {isCompleted ? "Completed ✓" : isInProgress ? "In Progress..." : "Not Started"}
                  </button>
                </div>

                <h3 className="font-extrabold text-sm dark:text-white leading-snug mb-2">{p.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{p.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {p.technologies.map((t: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/20 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-indigo-950/20 pt-3">
                  <span>Est Time:</span>
                  <span className="font-bold">{p.estimated_time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Helper renderer: Job Market Insights View
  const renderJobMarketInsights = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Job Market Demand Insights</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live demand tracking index for industry technologies and hiring indicators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left lists */}
        <div className="glass-card p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Trending Technology Index</h3>
          
          <div className="space-y-4">
            {marketTrends.map((trend: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-indigo-950/20 pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold dark:text-slate-200">{trend.name}</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  trend.trend_type === "Very High Demand" ? "bg-emerald-500/10 text-emerald-500" :
                  trend.trend_type === "High Demand" ? "bg-indigo-500/10 text-indigo-500" :
                  trend.trend_type === "Medium Demand" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {trend.trend_type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Demand Index Scores</h3>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketTrends}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0c0d24", border: "1px solid #1f224b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#8b5cf6", fontSize: "13px", fontWeight: "bold" }}
                  formatter={(value) => [value, "Demand Score"]}
                />
                <Bar dataKey="demand_score" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {marketTrends.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper renderer: Interview Readiness View
  const renderInterviewReadiness = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Interview Readiness</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete simulated mock Q&A question sets to gauge candidate preparation matching target benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions selection */}
        <div className="glass-card p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-[#12142d]/80 border border-slate-200/50 dark:border-indigo-950/30 rounded-2xl text-center mb-4">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Interview Readiness Score</span>
            <span className="text-3xl font-black text-indigo-500">{data.stats.interview_ready_score}%</span>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Question Sets</h3>
          {mockInterviewQuestions.map((q, idx) => (
            <div 
              key={idx}
              onClick={() => { setSelectedQuestionIndex(idx); setInterviewAnswer(""); setInterviewEvaluation(""); }}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                selectedQuestionIndex === idx ? "border-indigo-500 bg-indigo-500/5 font-bold" : "border-slate-200 dark:border-indigo-950/60 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-indigo-900"
              }`}
            >
              <span className="block text-[8px] uppercase tracking-wider text-indigo-400">Question {idx + 1}</span>
              <p className="truncate mt-0.5 leading-snug">{q.q}</p>
            </div>
          ))}
        </div>

        {/* Answer input & feedback output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5c5c99] mb-4">Active Question</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-white mb-6 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/60 dark:border-indigo-950/40 rounded-xl">
              "{mockInterviewQuestions[selectedQuestionIndex].q}"
            </p>

            <form onSubmit={handleEvaluateAnswer} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-2 font-semibold">Your Technical Answer</label>
                <textarea 
                  rows={6}
                  value={interviewAnswer}
                  onChange={(e) => setInterviewAnswer(e.target.value)}
                  placeholder="Type your technical answer here. Mention specific frameworks, metrics or modeling decisions..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={evaluatingAnswer || !interviewAnswer.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {evaluatingAnswer ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{evaluatingAnswer ? "Evaluating answer..." : "Evaluate Answer"}</span>
              </button>
            </form>
          </div>

          {/* Feedback Output */}
          {interviewEvaluation && (
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-emerald-500/20 bg-emerald-500/5 animate-fadeIn">
              <h3 className="text-xs font-extrabold uppercase text-emerald-500 tracking-wider mb-3 flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Evaluation Report</span>
              </h3>
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-medium font-sans whitespace-pre-wrap leading-relaxed">
                {interviewEvaluation}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer: Placement Predictor View
  const renderPlacementPredictor = () => {
    const isResumePassed = stats.resume_score > 80;
    const isProjectsPassed = localProjects.some((p: any) => p.status === "completed");
    const isInterviewPassed = stats.interview_ready_score > 70;
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Placement Probability Index</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Evaluate candidacy probability across target tech companies and audit hiring checklist items.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Probability gauge */}
          <div className="glass-card p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Placement Outlook</h3>
            
            <div className="relative p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/30 rounded-2xl text-center mb-4 w-full">
              <span className="text-3xl font-black text-orange-500 block mb-1">{data.stats.placement_probability_score}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Placement Probability</span>
            </div>

            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-500 dark:text-indigo-400/80 leading-relaxed text-left">
              🚀 High match indicators! Acquiring a cloud credential or finishing the active roadmap milestones will increase placements score past 85%.
            </div>
          </div>

          {/* Verification checklist */}
          <div className="glass-card p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Prerequisite Audit</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className={`h-5 w-5 ${isResumePassed ? "text-emerald-500" : "text-slate-400"}`} />
                  <span>Resume Score &gt; 80%</span>
                </div>
                <span className={isResumePassed ? "text-emerald-500" : "text-slate-400"}>{isResumePassed ? "Pass" : "Fail"}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className={`h-5 w-5 ${isProjectsPassed ? "text-emerald-500" : "text-slate-400"}`} />
                  <span>ML Project Completed</span>
                </div>
                <span className={isProjectsPassed ? "text-emerald-500" : "text-slate-400"}>{isProjectsPassed ? "Pass" : "Fail"}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className={`h-5 w-5 ${isInterviewPassed ? "text-emerald-500" : "text-slate-400"}`} />
                  <span>Interview Ready &gt; 70%</span>
                </div>
                <span className={isInterviewPassed ? "text-emerald-500" : "text-slate-400"}>{isInterviewPassed ? "Pass" : "Fail"}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className={`h-5 w-5 ${simResult?.simulated_salary_3y > 15 ? "text-emerald-500" : "text-slate-400"}`} />
                  <span>Cloud/AWS Certified</span>
                </div>
                <span className={simResult?.simulated_salary_3y > 15 ? "text-emerald-500" : "text-slate-400"}>{simResult?.simulated_salary_3y > 15 ? "Pass" : "Fail"}</span>
              </div>
            </div>
          </div>

          {/* Matched Companies */}
          <div className="glass-card p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Employer Match Ratings</h3>
            <div className="space-y-4">
              {[
                { name: "Google", match: "92%", status: "Highly Matched" },
                { name: "Microsoft", match: "88%", status: "Highly Matched" },
                { name: "Amazon AWS", match: "85%", status: "Highly Matched" },
                { name: "TechCorp", match: "78%", status: "Matchable" }
              ].map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-indigo-950/20 pb-2">
                  <div>
                    <span className="font-extrabold dark:text-white block">{comp.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{comp.status}</span>
                  </div>
                  <span className="text-indigo-500 font-bold">{comp.match} Match</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper renderer: Career Digital Twin Simulation View
  const renderCareerDigitalTwin = () => {
    const twinSalaryChartData = simResult ? [
      { period: "Now", Original: 6.0, Simulated: simResult.timeline?.[0]?.simulated || 7.2 },
      { period: "1 Year", Original: 8.5, Simulated: simResult.timeline?.[1]?.simulated || 10.2 },
      { period: "3 Years", Original: 14.5, Simulated: simResult.simulated_salary_3y || 16.5 },
      { period: "5 Years", Original: 22.0, Simulated: simResult.timeline?.[3]?.simulated || 25.0 }
    ] : [];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Virtual Career Twin Simulation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Master new technical frameworks or cloud achievements to dynamically simulate future income trajectories.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs column */}
          <div className="glass-card p-6 rounded-2xl shadow-sm h-fit space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-indigo-950/20 pb-3">Simulation Inputs</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Scenario Parameters</label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950 p-3 rounded-xl cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={simAws} 
                      onChange={(e) => setSimAws(e.target.checked)} 
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161738] text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Learn AWS Cloud</span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950 p-3 rounded-xl cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={simAzure} 
                      onChange={(e) => setSimAzure(e.target.checked)} 
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161738] text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Earn Azure Developer Certificate</span>
                  </label>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950 p-3 rounded-xl flex items-center justify-between">
                    <span>Portfolio ML Projects</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setSimProjects(p => Math.max(0, p - 1))} className="px-2 py-0.5 bg-slate-200 dark:bg-[#161738] border border-slate-300 dark:border-indigo-950 rounded text-slate-700 dark:text-white font-bold">-</button>
                      <span className="font-extrabold w-4 text-center">{simProjects}</span>
                      <button onClick={() => setSimProjects(p => Math.min(5, p + 1))} className="px-2 py-0.5 bg-slate-200 dark:bg-[#161738] border border-slate-300 dark:border-indigo-950 rounded text-slate-700 dark:text-white font-bold">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Target Career Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  {careerPredictions.map((cp: any, idx: number) => (
                    <option key={idx} value={cp.role}>{cp.role}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleRunSimulation}
                disabled={simulating}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center text-xs shadow-lg transition"
              >
                {simulating ? "Re-simulating..." : "Run Twin Simulation"}
              </button>
            </div>
          </div>

          {/* Output chart column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Simulated Trajectory Comparison (LPA)</h3>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={twinSalaryChartData}>
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="L" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c0d24", border: "1px solid #1f224b", borderRadius: "12px" }}
                      labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                      itemStyle={{ fontSize: "13px", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="Original" stroke="#475569" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="Simulated" stroke="#10b981" strokeWidth={4} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {simResult && (
              <div className="grid grid-cols-3 gap-6">
                <div className="glass-card p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated 3Y LPA</span>
                  <span className="text-xl font-extrabold text-indigo-500 mt-2 block">₹{simResult.simulated_salary_3y} LPA</span>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Probability Boost</span>
                  <span className="text-xl font-extrabold text-emerald-500 mt-2 block">+{Math.round(simResult.probability_increase)}%</span>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Growth Potential</span>
                  <span className="text-xl font-extrabold text-purple-500 mt-2 block">{simResult.career_growth}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper renderer: AI Career Mentor View
  const renderAICareerMentor = () => (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-140px)] flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold dark:text-white">AI Career Mentor Chatbot</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Get 24/7 personalized mentoring instructions, resume advice and interview prep guides.</p>
      </div>

      {/* Main chat box */}
      <div className="flex-1 glass-card p-6 rounded-2xl shadow-sm my-6 overflow-y-auto space-y-4 flex flex-col justify-end">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-xl max-w-[75%] leading-relaxed text-xs border ${
              msg.sender === "user" ? "bg-indigo-500/10 text-indigo-600 ml-auto border-indigo-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 mr-auto border-slate-200 dark:border-slate-800"
            }`}>
              <span className="font-bold text-[8px] uppercase tracking-wider block mb-1">{msg.sender === "user" ? "You" : "AI Mentor"}</span>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Suggested prompting chips */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {[
          "How can I improve my Resume Score?",
          "What skills should I learn for ML Engineer?",
          "Explain system design interview prep patterns.",
          "Analyze my placement probability."
        ].map((q, idx) => (
          <button 
            key={idx} 
            onClick={() => { setChatInput(q); }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-full border border-slate-200 dark:border-indigo-950/40 text-slate-600 dark:text-slate-300 transition shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Question input */}
      <form onSubmit={handleSendMessage} className="w-full flex items-center bg-slate-50 dark:bg-[#07081c]/70 border border-slate-200 dark:border-indigo-950/60 px-4 py-3 rounded-2xl focus-within:border-indigo-500 transition">
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={sendingChat ? "Coach is typing..." : "Type your career question here..."}
          disabled={sendingChat}
          className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-100 flex-1 placeholder:text-slate-500 disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={sendingChat || !chatInput.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl transition shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );

  // Helper renderer: Profile Settings View
  const renderProfileSettings = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Profile Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your developer credentials, contact information, and target professional role settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="glass-card p-6 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-24 w-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 font-mono">
            {profileName.charAt(0) || "K"}
          </div>
          <div>
            <h3 className="font-extrabold text-base dark:text-white leading-none">{profileName || "Karthik R"}</h3>
            <span className="text-xs text-slate-400 font-semibold block mt-1">{profileRole}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/30 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-left w-full">
            📍 **Email**: {profileEmail || "karthik.r@careertwin.ai"}<br />
            💳 **Current Tier**: {user?.role || "Premium User"}
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 pb-2 border-b border-slate-100 dark:border-indigo-950/20">Edit Personal Details</h3>
          
          {saveSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Target Professional Role</label>
                <select 
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Specialist">DevOps Specialist</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">New Password (Optional)</label>
                <input 
                  type="password" 
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Helper renderer: Notification Center View
  const renderNotificationCenter = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Notification Center</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure alert channels and view recent platform recommendation feeds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toggle controls */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-indigo-950/20">Alert Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-indigo-950/30 rounded-xl">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Email Notifications</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Receive weekly roadmap progress summaries and skill recommendations.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161738] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-indigo-950/30 rounded-xl">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">SMS Alerts</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Get instant mock interview ready scores sent to your phone.</p>
              </div>
              <input 
                type="checkbox" 
                checked={smsAlerts} 
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161738] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-indigo-950/30 rounded-xl">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Auto-Save Sandbox Twin</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Automatically trigger virtual digital twin simulations on skill updates.</p>
              </div>
              <input 
                type="checkbox" 
                checked={autoSaveTwin} 
                onChange={(e) => setAutoSaveTwin(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161738] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div className="glass-card p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 pb-2 border-b border-slate-100 dark:border-indigo-950/20">Feeds History</h3>
          
          <div className="space-y-4">
            <div className="border-l-2 border-indigo-500 pl-3 py-0.5">
              <span className="text-[9px] uppercase font-bold text-indigo-500">Just Now</span>
              <h5 className="text-[11px] font-bold text-slate-800 dark:text-white">Skill Added</h5>
              <p className="text-[10px] text-slate-400">Added 'FastAPI' as Advanced ML credential.</p>
            </div>
            
            <div className="border-l-2 border-slate-300 dark:border-indigo-950 pl-3 py-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">10 mins ago</span>
              <h5 className="text-[11px] font-bold text-slate-800 dark:text-white">Interview Evaluated</h5>
              <p className="text-[10px] text-slate-400">Mock score generated: 88/100.</p>
            </div>

            <div className="border-l-2 border-slate-300 dark:border-indigo-950 pl-3 py-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">1 hour ago</span>
              <h5 className="text-[11px] font-bold text-slate-800 dark:text-white">Resume Scanned</h5>
              <p className="text-[10px] text-slate-400">ATS recommendation list successfully customized.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper renderer: Billing & Plans View
  const renderBillingPlans = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold dark:text-white">Billing & Subscription Plans</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Unlock developer intelligence, ATS optimization engines, and placement forecasts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan 1 */}
        <div className="glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between border border-transparent hover:border-indigo-500/20 transition h-[420px]">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-indigo-950/20">
              <h3 className="font-extrabold text-sm dark:text-white uppercase tracking-wider text-slate-500">Free Tier</h3>
              <p className="text-[10px] text-slate-400">Start scoring your engineering metrics.</p>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-indigo-500">₹0</span>
              <span className="text-xs text-slate-400">/mo</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>1 Resume Score per month</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Standard Roadmaps</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Basic matching results</span>
              </li>
            </ul>
          </div>
          <button 
            disabled 
            className="w-full py-2.5 bg-slate-100 dark:bg-[#1a1b38] hover:bg-slate-200 dark:hover:bg-[#20224d] text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition disabled:opacity-50"
          >
            Included in Free
          </button>
        </div>

        {/* Plan 2 */}
        <div className={`glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between border ${billingPlan === "Premium User" ? "border-indigo-500 bg-[#0d0e2c]/60" : "border-transparent"} hover:border-indigo-500/20 transition h-[420px] relative`}>
          {billingPlan === "Premium User" && (
            <span className="absolute top-3 right-4 px-2 py-0.5 bg-indigo-600 text-white font-bold text-[8px] tracking-wider uppercase rounded">Active Plan</span>
          )}
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-indigo-950/20">
              <h3 className="font-extrabold text-sm dark:text-white uppercase tracking-wider text-slate-500">Pro Professional</h3>
              <p className="text-[10px] text-slate-400">Accelerate predictive job matching.</p>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-indigo-500">₹499</span>
              <span className="text-xs text-slate-400">/mo</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Unlimited Resume Uploads</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>AI Mentoring Coaching Integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Full Digital Twin simulations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Interactive roadmap checklists</span>
              </li>
            </ul>
          </div>
          <button 
            onClick={() => handleUpgradePlan("Premium User")}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
          >
            {billingPlan === "Premium User" ? "Current Tier" : "Downgrade Pro"}
          </button>
        </div>

        {/* Plan 3 */}
        <div className={`glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between border ${billingPlan === "Recruiter Enterprise" ? "border-indigo-500 bg-[#0d0e2c]/60" : "border-transparent"} hover:border-indigo-500/20 transition h-[420px] relative`}>
          {billingPlan === "Recruiter Enterprise" && (
            <span className="absolute top-3 right-4 px-2 py-0.5 bg-indigo-600 text-white font-bold text-[8px] tracking-wider uppercase rounded">Active Plan</span>
          )}
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-indigo-950/20">
              <h3 className="font-extrabold text-sm dark:text-white uppercase tracking-wider text-slate-500">Recruiter Enterprise</h3>
              <p className="text-[10px] text-slate-400">Match talent using custom engines.</p>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-indigo-500">₹1,999</span>
              <span className="text-xs text-slate-400">/mo</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Recruiter placement matchmaking list</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Dedicated corporate recruitment profile</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Unlimited multi-candidate comparisons</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Custom database synchronization</span>
              </li>
            </ul>
          </div>
          <button 
            onClick={() => handleUpgradePlan("Recruiter Enterprise")}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
          >
            {billingPlan === "Recruiter Enterprise" ? "Current Tier" : "Upgrade Enterprise"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fc] dark:bg-[#090a16] flex text-slate-800 dark:text-slate-100 transition duration-300">
      
      {/* Hidden file input for Resume Analysis */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx,.doc"
      />

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0b0c1e] text-slate-400 p-5 flex flex-col justify-between shrink-0 border-r border-[#191a3c]">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 mb-8 px-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Brain className="h-5 w-5 text-white animate-float" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">CareerTwin AI</span>
              <span className="block text-[9px] text-[#5c5c99] font-medium tracking-wide">Your Future, Predicted Smarter.</span>
            </div>
          </div>

          {/* MAIN MENU */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#5c5c99] mb-3 px-2">Main Menu</p>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        if (item.id === "resume-analyzer" && activeTab !== "resume-analyzer" && !data.stats.resume_score) {
                          // Upload directly if they don't have score yet
                          handleUploadClick();
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition ${
                        isActive 
                          ? "font-semibold text-white bg-indigo-600 shadow-lg shadow-indigo-600/20" 
                          : "font-medium text-slate-400 hover:bg-[#1a1b38] hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${item.isPulse ? "animate-pulse text-indigo-400" : ""}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ACCOUNT SECTION */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#5c5c99] mb-3 px-2">Account</p>
              <nav className="space-y-1">
                {[
                  { id: "profile-settings", label: "Profile Settings", icon: Settings },
                  { id: "notification-center", label: "Notification Center", icon: Bell },
                  { id: "billing-plans", label: "Billing & Plans", icon: CreditCard }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition ${
                        isActive 
                          ? "font-semibold text-white bg-indigo-600 shadow-lg shadow-indigo-600/20" 
                          : "font-medium text-slate-400 hover:bg-[#1a1b38] hover:text-white"
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Upgrade Pro Promo & User profile */}
        <div className="space-y-4 pt-6 border-t border-[#1a1b3c]">
          <div className="p-4 rounded-xl bg-gradient-to-tr from-purple-950/40 to-indigo-950/40 border border-indigo-900/30 text-xs">
            <h5 className="font-bold text-white mb-1.5 flex items-center">Upgrade to Pro 🚀</h5>
            <p className="text-[10px] text-[#8e8ec4] leading-relaxed mb-3">Unlock advanced predictions, unlimited resumes, and AI mentor coaching.</p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-lg shadow-md transition">Upgrade Now</button>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-indigo-900 rounded-full border border-indigo-500/30 flex items-center justify-center text-white text-xs font-bold font-mono">
                {user?.full_name?.charAt(0) || "K"}
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-none">{user?.full_name || "Karthik R"}</p>
                <p className="text-[9px] text-[#5c5c99]">{user?.role || "Premium User"}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 bg-[#171836] hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg transition" title="Log Out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="py-4 px-8 flex justify-between items-center border-b border-slate-200 dark:border-indigo-950/20 bg-white/70 dark:bg-[#0c0d24]/60 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold dark:text-white flex items-center gap-2">
              Hello, {user?.full_name?.split(" ")[0] || "Karthik"}
              <span className="animate-float">👋</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Here's your career overview & AI insights for your professional growth.</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything...      Ctrl + K" 
                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#171836]/60 border border-slate-200 dark:border-indigo-950/60 rounded-xl text-xs w-64 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-950/20 dark:text-slate-200"
              />
            </div>

            <button className="p-2 bg-slate-100 dark:bg-[#171836]/60 border border-slate-200 dark:border-indigo-950/60 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1c1d42] transition relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1.5 h-2 w-2 bg-indigo-500 rounded-full animate-ping"></span>
            </button>

            <button onClick={() => setActiveTab("ai-mentor")} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition">
              <Brain className="h-3.5 w-3.5" />
              <span>AI Mentor</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD MODULE CONTAINER */}
        <div className="p-8 space-y-6 flex-1">
          {activeTab === "dashboard" && renderDashboardOverview()}
          {activeTab === "resume-analyzer" && renderResumeAnalyzer()}
          {activeTab === "skill-intelligence" && renderSkillIntelligence()}
          {activeTab === "career-predictor" && renderCareerPredictor()}
          {activeTab === "salary-predictor" && renderSalaryPredictor()}
          {activeTab === "learning-roadmap" && renderLearningRoadmap()}
          {activeTab === "projects" && renderProjectRecommendations()}
          {activeTab === "job-insights" && renderJobMarketInsights()}
          {activeTab === "interview-readiness" && renderInterviewReadiness()}
          {activeTab === "placement-predictor" && renderPlacementPredictor()}
          {activeTab === "career-twin" && renderCareerDigitalTwin()}
          {activeTab === "ai-mentor" && renderAICareerMentor()}
          {activeTab === "profile-settings" && renderProfileSettings()}
          {activeTab === "notification-center" && renderNotificationCenter()}
          {activeTab === "billing-plans" && renderBillingPlans()}
        </div>
      </main>

    </div>
  );
}
