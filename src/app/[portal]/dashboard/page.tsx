"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import Link from "next/link";
import InquiryAnalytics from "./components/InquiryAnalytics";
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
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Radio,
  Layers,
  ShieldCheck,
  Inbox,
} from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const { companies, refetch } = useCompanies();
  const searchParams = useSearchParams();
  const companySlug = searchParams.get("company") || (user as any)?.companySlug || companies[0]?.slug || "";
  const website = searchParams.get("website");

  const currentCompany = companies.find((c) => c.slug === companySlug) || companies[0];
  const companyWebsites = (currentCompany as any)?.websites || [];

  // Modal state
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: "", slug: "", url: "", description: "" });
  const [useCompanySmtp, setUseCompanySmtp] = useState(true);
  const [smtpConfig, setSmtpConfig] = useState({ host: "", port: "587", user: "", pass: "", secure: false });
  const [modalError, setModalError] = useState("");
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");

  const getCanonicalUrl = (raw: string) =>
    (raw || "").trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setUrlError("");
    setModalError("");

    if (!newWebsite.name.trim() || !newWebsite.url.trim() || !currentCompany) return;

    let hasClientError = false;

    // Check duplicate website name for this company
    const duplicateName = companyWebsites.find(
      (w: any) => w.name && w.name.trim().toLowerCase() === newWebsite.name.trim().toLowerCase()
    );
    if (duplicateName) {
      setNameError("Website name exists");
      hasClientError = true;
    }

    // Check duplicate website URL for this company
    const incomingCanonical = getCanonicalUrl(newWebsite.url);
    const duplicateUrl = companyWebsites.find(
      (w: any) => w.url && getCanonicalUrl(w.url) === incomingCanonical
    );
    if (duplicateUrl) {
      setUrlError("Website URL exists");
      hasClientError = true;
    }

    if (hasClientError) return;

    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/websites/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newWebsite.name.trim(),
          title: newWebsite.name.trim(),
          slug: newWebsite.slug || newWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          url: newWebsite.url.trim(),
          companyId: currentCompany._id,
          isActive: true,
          ...(!useCompanySmtp ? { smtpConfig } : {})
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddWebsite(false);
        setNewWebsite({ name: "", slug: "", url: "", description: "" });
        setNameError("");
        setUrlError("");
        setModalError("");
        await refetch();
      } else {
        if (data.field === "name" || data.message === "Website name exists") {
          setNameError("Website name exists");
        } else if (data.field === "url" || data.message === "Website URL exists") {
          setUrlError("Website URL exists");
        } else {
          setModalError(data.message || "Failed to add website");
        }
      }
    } catch (err) {
      console.error("Error adding website:", err);
      setModalError("Network error. Please try again.");
    }
  };

  const selectedSite = companyWebsites.find((w: any) => w._id === website || w.slug === website || w.id === website) || {
    name: currentCompany?.name ? `${currentCompany.name} Website` : "Main Website",
    url: "#",
  };



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
              onClick={() => {
                setShowAddWebsite(true); setModalError(""); setNameError(""); setUrlError("");
                setUseCompanySmtp(companyWebsites.length > 0);
              }}
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
              <p className="text-xs text-gray-400">Click a website's Dashboard to view its analytics and logs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(currentCompany?.websites || []).map((site: any) => (
              <div
                key={site._id || site.slug || site.name}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#f99d1c]/10 text-[#f99d1c] flex items-center justify-center font-bold">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#11253e] text-base">{site.title || site.name}</h3>
                        <span className="text-xs text-gray-400 font-mono">{site.url}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-200 uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">{site.description || "Company digital website."}</p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <a
                    href={site.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Site
                  </a>
                  <Link
                    href={`/admin/dashboard?company=${companySlug}&website=${site._id || site.slug || site.id}`}
                    className="flex-1 py-2.5 px-4 bg-[#11253e] hover:bg-[#1a3d66] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    Dashboard
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
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
                    {modalError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Website Name</label>
                  <input
                    type="text"
                    required
                    value={newWebsite.name}
                    onChange={(e) => {
                      setNewWebsite({ ...newWebsite, name: e.target.value });
                      setNameError("");
                    }}
                    placeholder="e.g., Hulabs Portal"
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      nameError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#f99d1c] focus:ring-[#f99d1c]/20"
                    } rounded-xl focus:ring-2 outline-none transition-all text-sm`}
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                      {nameError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Live URL</label>
                  <input
                    type="url"
                    required
                    value={newWebsite.url}
                    onChange={(e) => {
                      setNewWebsite({ ...newWebsite, url: e.target.value });
                      setUrlError("");
                    }}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      urlError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#f99d1c] focus:ring-[#f99d1c]/20"
                    } rounded-xl focus:ring-2 outline-none transition-all text-sm`}
                  />
                  {urlError && (
                    <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                      {urlError}
                    </p>
                  )}
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

                {companyWebsites.length > 0 && (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <input
                      type="checkbox"
                      id="useCompanySmtp"
                      checked={useCompanySmtp}
                      onChange={(e) => setUseCompanySmtp(e.target.checked)}
                      className="w-4 h-4 text-[#f99d1c] focus:ring-[#f99d1c] rounded border-gray-300"
                    />
                    <label htmlFor="useCompanySmtp" className="text-sm font-bold text-gray-700 cursor-pointer">
                      Use same SMTP setup as Company
                    </label>
                  </div>
                )}

                {!useCompanySmtp && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">Website SMTP Setup</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">SMTP Host</label>
                        <input
                          type="text"
                          required={!useCompanySmtp}
                          value={smtpConfig.host}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                          placeholder="smtp.gmail.com"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#f99d1c] focus:ring-1 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Port</label>
                        <input
                          type="text"
                          required={!useCompanySmtp}
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                          placeholder="587"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#f99d1c] focus:ring-1 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Security</label>
                        <select
                          value={smtpConfig.secure ? "true" : "false"}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.value === "true" })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#f99d1c] focus:ring-1 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                        >
                          <option value="false">TLS (Port 587)</option>
                          <option value="true">SSL (Port 465)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Username / Email</label>
                        <input
                          type="email"
                          required={!useCompanySmtp}
                          value={smtpConfig.user}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#f99d1c] focus:ring-1 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">App Password</label>
                        <input
                          type="password"
                          required={!useCompanySmtp}
                          value={smtpConfig.pass}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#f99d1c] focus:ring-1 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
  /*  VIEW 2: WEBSITE DETAILED LEAD & ADMIN LOGS (website parameter present)    */
  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#11253e] via-[#162e4c] to-[#1e3a5f] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        {/* Decorative backdrop glow elements */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f99d1c]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top telemetry & status row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#f99d1c]/20 text-[#f99d1c] border border-[#f99d1c]/30 text-[11px] font-bold uppercase tracking-wider">
                Telemetry & Lead Logs
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/60 text-xs font-medium flex items-center gap-1">
                <Activity size={12} className="text-[#f99d1c]" /> 6 Integrated Channels
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Log Sync
              </span>

              {selectedSite.url && selectedSite.url !== "#" && (
                <a
                  href={selectedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  <Globe size={13} />
                  <span>Visit Site</span>
                  <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {selectedSite.name} — Detailed Lead Logs
            </h1>
            <p className="text-white/75 text-sm sm:text-base leading-relaxed">
              Real-time audit console monitoring visitor interactions, customer inquiries, candidate CV submissions, event RSVPs, and conversational leads.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Channels</p>
            <p className="text-lg sm:text-xl font-bold text-[#11253e] truncate">6 Modules</p>
            <p className="text-[11px] text-emerald-600 font-medium">All active & tracking</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ingestion Pipeline</p>
            <p className="text-lg sm:text-xl font-bold text-[#11253e] truncate">100% Operational</p>
            <p className="text-[11px] text-emerald-600 font-medium">Zero pending backlog</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Radio size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notification Dispatch</p>
            <p className="text-lg sm:text-xl font-bold text-[#11253e] truncate">Instant Alerts</p>
            <p className="text-[11px] text-blue-600 font-medium">Dynamic department SMTP</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Audit Security</p>
            <p className="text-lg sm:text-xl font-bold text-[#11253e] truncate">Protected Data</p>
            <p className="text-[11px] text-gray-500 font-medium">Role-based access</p>
          </div>
        </div>
      </div>

      {/* Inquiry Analytics: Pie Chart (Which Tab) & Trend Graph (Raised vs Dropped) */}
      <InquiryAnalytics
        companySlug={companySlug}
        websiteId={website || ""}
        websiteName={selectedSite.name}
      />

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
