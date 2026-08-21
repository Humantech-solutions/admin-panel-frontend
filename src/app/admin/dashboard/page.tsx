"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Globe,
  Plus,
  ExternalLink,
  ChevronRight,
  History,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Building2,
  X,
  ChevronLeft,
  Briefcase,
} from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const { companies } = useCompanies();
  const searchParams = useSearchParams();
  const companySlug = searchParams.get("company") || (user as any)?.companySlug || companies[0]?.slug || "";
  const website = searchParams.get("website");

  const showLogs = searchParams.get("logs") === "true";

  const currentCompany = companies.find((c) => c.slug === companySlug) || companies[0];

  // Websites list (managed per company)
  const [websites, setWebsites] = useState<Array<{
    id: string;
    name: string;
    url: string;
    description: string;
    active: boolean;
    color: string;
  }>>([]);

  // Modal state
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: "", slug: "", url: "", description: "" });

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebsite.name || !newWebsite.url) return;

    const slug = newWebsite.slug || newWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const created = {
      id: slug,
      name: newWebsite.name,
      url: newWebsite.url,
      description: newWebsite.description || "Company digital website.",
      active: true,
      color: "from-[#11253e] to-[#1a3d66]",
    };

    setWebsites((prev) => [...prev, created]);
    setNewWebsite({ name: "", slug: "", url: "", description: "" });
    setShowAddWebsite(false);
  };

  const companyWebsites = (currentCompany as any)?.websites || [];
  const selectedSite = companyWebsites.find((w: any) => w._id === website || w.slug === website || w.id === website) || {
    name: currentCompany?.name ? `${currentCompany.name} Website` : "Main Website",
    url: "#",
  };

  const logCards = [
    { label: "Contact Form", desc: "View & manage contact enquiries", icon: <Mail size={24} className="text-blue-500" />, href: `/admin/dashboard/contact-form?company=${companySlug}&website=${website}`, color: "from-blue-500/10 to-blue-600/5", border: "border-blue-200" },
    { label: "Event Form", desc: "Add and track upcoming events", icon: <Calendar size={24} className="text-purple-500" />, href: `/admin/dashboard/event-form?company=${companySlug}&website=${website}`, color: "from-purple-500/10 to-purple-600/5", border: "border-purple-200" },
    { label: "Career Applications", desc: "Manage job openings & candidate applications", icon: <Briefcase size={24} className="text-emerald-500" />, href: `/admin/dashboard/career?company=${companySlug}&website=${website}`, color: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-200" },
    { label: "Career Mails", desc: "Review incoming job applications", icon: <FileText size={24} className="text-orange-500" />, href: `/admin/dashboard/career-mails?company=${companySlug}&website=${website}`, color: "from-orange-500/10 to-orange-600/5", border: "border-orange-200" },
    { label: "Chatbot", desc: "Set up & monitor chatbot responses", icon: <MessageSquare size={24} className="text-pink-500" />, href: `/admin/dashboard/chat-queries?company=${companySlug}&website=${website}`, color: "from-pink-500/10 to-pink-600/5", border: "border-pink-200" },
  ];

  /* ─────────────────────────────────────────────────────────────────────────── */
  /*  VIEW 1: NO WEBSITE SELECTED (COMPANY LEVEL)                                */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (!website) {
    return (
      <div className="space-y-8">
        {/* Parent Company Banner */}
        <div className="bg-gradient-to-br from-[#11253e] via-[#162e4c] to-[#1a3d66] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-[#f99d1c]/20 text-[#f99d1c] border border-[#f99d1c]/30 text-xs font-bold uppercase tracking-widest rounded-xl">
                  Parent Company
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-xl border border-green-500/30">
                  Active
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
                {currentCompany?.name ?? "Company Overview"}
              </h1>
              <p className="text-white/80 text-base max-w-xl leading-relaxed">
                {currentCompany?.description || `Manage websites, employee access, and global settings for ${currentCompany?.name ?? "your company"}.`}
              </p>
            </div>

            <button
              onClick={() => setShowAddWebsite(true)}
              className="inline-flex items-center gap-2 bg-[#f99d1c] hover:bg-[#e88f10] text-white text-sm font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#f99d1c]/30 transition-all shrink-0 active:scale-95"
            >
              <Plus size={18} />
              Add Website
            </button>
          </div>
        </div>

        {/* Websites List Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#11253e]">Company Websites</h2>
              <p className="text-xs text-gray-400">Click a website or Admin Logs to view its dashboard.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {websites.map((site) => (
              <div
                key={site.id}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#f99d1c]/10 text-[#f99d1c] flex items-center justify-center font-bold">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#11253e] text-base">{site.name}</h3>
                        <span className="text-xs text-gray-400 font-mono">{site.url}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-200 uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">{site.description}</p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Site
                  </a>
                  <Link
                    href={`/admin/dashboard?company=${companySlug}&website=${site.id}`}
                    className="flex-1 py-2.5 px-4 bg-[#11253e] hover:bg-[#1a3d66] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    Admin Logs
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/admin/dashboard/employees?company=${companySlug}`}
            className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-4 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#11253e] text-base group-hover:text-[#f99d1c] transition-colors">
                Employees & User Access
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Onboard new team members and assign access roles.</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href={`/admin/dashboard/companies/${currentCompany?._id ?? "default"}/websites`}
            className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-4 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#11253e] text-base group-hover:text-[#f99d1c] transition-colors">
                CRM & Website Configurations
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Configure webhooks, API keys, and notification emails.</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Add Website Modal */}
        {showAddWebsite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#11253e]">Add Website to {currentCompany?.name ?? "Company"}</h3>
                <button onClick={() => setShowAddWebsite(false)} className="text-gray-400 hover:text-[#11253e] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddWebsite} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Website Name</label>
                  <input
                    type="text"
                    required
                    value={newWebsite.name}
                    onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                    placeholder="e.g., Hulabs Portal"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Live URL</label>
                  <input
                    type="url"
                    required
                    value={newWebsite.url}
                    onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newWebsite.description}
                    onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                    placeholder="Short description of this website's purpose..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm resize-none"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddWebsite(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#f99d1c] hover:bg-[#e8900f] text-white font-bold rounded-xl shadow-lg shadow-[#f99d1c]/30 transition-all text-sm"
                  >
                    Add Website
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /*  VIEW 2: WEBSITE ANALYTICS OVERVIEW (website parameter present, logs false) */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (!showLogs) {
    return (
      <div className="space-y-8">
        {/* Website Overview Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#11253e] via-[#162e4c] to-[#1a3d66] p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[#f99d1c] font-bold text-xs uppercase tracking-widest rounded-xl">
                {currentCompany?.name ?? "Hutech Solutions"}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 font-bold text-xs uppercase tracking-widest rounded-xl border border-green-500/30">
                Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              {selectedSite.name}
            </h1>

            <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed font-light">
              {selectedSite.description} Control all aspects of your digital ecosystem from this unified dashboard.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={selectedSite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white text-[#11253e] rounded-2xl font-bold hover:bg-white/90 transition-all shadow-xl text-sm flex items-center gap-2"
              >
                <ExternalLink size={16} />
                View Project Site
              </a>
              <Link
                href={`/admin/dashboard?company=${companySlug}&website=${website}&logs=true`}
                className="px-6 py-3.5 bg-black/20 text-white hover:bg-black/30 rounded-2xl font-bold transition-all border border-white/20 flex items-center gap-2 text-sm"
              >
                <History size={16} />
                Admin Logs
              </Link>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        </div>

        {/* Analytics & Metrics Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#11253e]">Website Performance & System Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Active Users", value: "1,284", change: "+12%", color: "text-green-500", bg: "bg-green-50 border-green-100" },
              { title: "System Health", value: "99.9%", change: "Stable", color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
              { title: "Pending Updates", value: "3", change: "None", color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
            ].map((stat) => (
              <div key={stat.title} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-[#11253e] mt-1">{stat.value}</p>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${stat.bg} ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button to open logs */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-[#11253e] text-lg">Detailed Admin Logs & Enquiries</h3>
            <p className="text-gray-500 text-sm mt-1">Access form submissions, job applications, chatbot queries, and event registrations.</p>
          </div>
          <Link
            href={`/admin/dashboard?company=${companySlug}&website=${website}&logs=true`}
            className="px-6 py-3.5 bg-[#11253e] hover:bg-[#1a3d66] text-white font-bold rounded-2xl shadow-lg transition-all text-sm shrink-0 flex items-center gap-2"
          >
            Open Admin Logs
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /*  VIEW 3: WEBSITE DETAILED ADMIN LOGS (website parameter present, logs=true) */
  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/admin/dashboard?company=${companySlug}&website=${website}`}
              className="text-xs font-semibold text-gray-400 hover:text-[#f99d1c] transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Back to {selectedSite.name} Analytics
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#11253e]">{selectedSite.name} — Detailed Admin Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Select a module below or use the sidebar menu to inspect logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {logCards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#f99d1c]/10 transition-colors">{card.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#11253e] font-bold text-base group-hover:text-[#f99d1c] transition-colors truncate">{card.label}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{card.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
