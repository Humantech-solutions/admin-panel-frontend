"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutDashboard, Globe, Beaker, LogOut, ChevronRight, History, ChevronDown, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("nabhira");
  const { logout } = useAuth();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    {
      id: "nabhira",
      name: "Nabhira Technologies",
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: "Cloud ecosystems and AI platform management",
      color: "from-blue-600 to-indigo-700",
      siteUrl: "https://nabhira.com/",
    },
    {
      id: "hutech",
      name: "Hutech Website",
      icon: <Globe className="w-5 h-5" />,
      description: "Corporate digital presence and content",
      color: "from-orange-500 to-red-600",
      siteUrl: "https://hutech.com/", // Placeholder
    },
    {
      id: "hulabs",
      name: "Hulabs Website",
      icon: <Beaker className="w-5 h-5" />,
      description: "Research and experimental laboratory portal",
      color: "from-emerald-500 to-teal-600",
      siteUrl: "https://hulabs.com/", // Placeholder
    },
  ];

  const handleViewSite = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab?.siteUrl) {
      window.open(tab.siteUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-black">
      {/* Sidebar */}
      <aside className="w-80 bg-[#11253e] text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Management Suite</p>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-lg ring-1 ring-white/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`p-2.5 rounded-xl transition-colors ${
                activeTab === tab.id ? "bg-[#f99d1c] text-white" : "bg-white/5 text-white/40 group-hover:text-white"
              }`}>
                {tab.icon}
              </span>
              <span className="font-bold text-[15px]">{tab.name}</span>
              {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 text-[#f99d1c]" />}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5">
          <p className="text-white/20 text-[10px] text-center font-medium tracking-widest uppercase">
            Admin Suite v1.1
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 shrink-0 sticky top-0 z-30 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Project Overview</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#11253e]">
                {tabs.find(t => t.id === activeTab)?.name}
              </span>
              <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg border border-green-100">Active</span>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-2xl transition-all duration-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#11253e]">Admin User</p>
                <p className="text-xs text-gray-400 font-medium">System Administrator</p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#11253e] to-[#030213] flex items-center justify-center text-white font-bold shadow-lg shadow-[#11253e]/20">
                  AD
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <ChevronDown className={`w-3 h-3 text-[#11253e] transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-4 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-6 py-4 border-b border-gray-50 mb-2">
                  <p className="text-sm font-bold text-[#11253e]">Admin User</p>
                  <p className="text-xs text-gray-400">admin@nabhira.com</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <div className="h-px bg-gray-50 my-2 mx-4" />
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-6xl">
            {/* Project Status Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${tabs.find(t => t.id === activeTab)?.color} p-12 text-white shadow-2xl`}>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-4">Welcome to Management</h3>
                <p className="text-white/80 text-lg max-w-xl mb-10 leading-relaxed font-light">
                  {tabs.find(t => t.id === activeTab)?.description} Control all aspects of your digital ecosystem from this unified dashboard.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleViewSite}
                    className="px-8 py-3.5 bg-white text-[#11253e] rounded-2xl font-bold hover:bg-white/90 transition-all shadow-xl"
                  >
                    View Project Site
                  </button>
                  <button 
                    onClick={() => window.open(`/admin/dashboard/${activeTab}`, "_blank")}
                    className="px-8 py-3.5 bg-black/20 text-white rounded-2xl font-bold hover:bg-black/30 transition-all border border-white/20 flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    Admin Logs
                  </button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
            </div>

            {/* Placeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { title: "Active Users", value: "1,284", change: "+12%" },
                { title: "System Health", value: "99.9%", change: "Stable" },
                { title: "Pending Updates", value: "3", change: "None" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.title}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-[#11253e]">{stat.value}</span>
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                        stat.change.includes("+") ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                    }`}>
                        {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Log Placeholder */}
            <div className="mt-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-xl font-bold text-[#11253e]">Recent Activity Log</h4>
                <button className="text-[#f99d1c] font-bold text-sm hover:underline">View All</button>
              </div>
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-6 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                      LOG
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#11253e]">System synchronization completed</p>
                      <p className="text-xs text-gray-400 font-medium">Project: {activeTab} • 2 hours ago</p>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                      Success
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
