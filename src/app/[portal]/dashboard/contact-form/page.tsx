"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Mail,
  User,
  Globe,
  ExternalLink,
  Eye,
  Search,
  X,
  Clock,
  CheckCircle2,
  Phone,
  Building2,
  Filter,
  FileText,
  Download,
  Linkedin,
} from "lucide-react";

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  pageTitle: string;
  pageUrl: string;
  category: string;
  status: string;
  submittedAt: string;
  companyId?: { _id: string; name: string; slug: string };
  websiteId?: { _id: string; name: string; slug: string; url?: string };
  project?: string;
  resume?: string;
  linkedin?: string;
}

function ContactDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { companies } = useCompanies();

  const isSuperAdmin = ["superadmin", "super_editor", "super_viewer"].includes(user?.role || "");
  const isViewer = user?.role === "super_viewer" || user?.role === "company_viewer" || user?.role === "viewer";

  const categoryFilter = searchParams.get("category");
  const urlCompany = searchParams.get("company");
  const urlWebsite = searchParams.get("website");
  const urlProject = searchParams.get("project");

  // Non-superadmin users are locked to their own company slug
  const activeCompanySlug = isSuperAdmin
    ? urlCompany || urlProject || "all"
    : (user as any)?.companySlug || urlCompany || "all";

  const isWebsiteContext = Boolean(urlWebsite);
  const activeWebsiteSlug = urlWebsite || "all";

  const [selectedCompany, setSelectedCompany] = useState<string>(activeCompanySlug);
  const [selectedWebsite, setSelectedWebsite] = useState<string>(activeWebsiteSlug);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  // Active Company & Website document resolution
  const activeCompanyDoc = companies.find((c) => c.slug === selectedCompany);
  const activeCompanyWebsites = (activeCompanyDoc as any)?.websites || [];
  const matchedWebsiteDoc = activeCompanyWebsites.find(
    (w: any) => w.slug === urlWebsite || w._id === urlWebsite
  );
  const websiteDisplayName = matchedWebsiteDoc?.name || urlWebsite;

  // Helper to extract clean resume URL from inquiry object or message
  const getResumeUrl = (inquiry: ContactInquiry | null | undefined): string | null => {
    if (!inquiry) return null;
    let rawUrl: string | null = null;
    if (inquiry.resume && typeof inquiry.resume === "string" && inquiry.resume.trim()) {
      rawUrl = inquiry.resume.trim();
    } else if (inquiry.message && typeof inquiry.message === "string" && inquiry.message.includes("/uploads/resumes/")) {
      const match = inquiry.message.match(/\/uploads\/resumes\/[^\s"']+/);
      if (match) {
        rawUrl = match[0];
      }
    }
    if (!rawUrl) return null;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    const base = API_BASE_URL.replace(/\/+$/, "");
    const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    return `${base}${cleanPath}`;
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const params = new URLSearchParams();

      if (selectedWebsite && selectedWebsite !== "all") {
        params.append("website", selectedWebsite);
      }
      if (selectedCompany && selectedCompany !== "all") {
        params.append("company", selectedCompany);
      }
      if (categoryFilter) {
        params.append("category", categoryFilter);
      }

      const url = `${API_BASE_URL}/api/contact/all?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [categoryFilter, selectedCompany, selectedWebsite]);

  const filteredInquiries = inquiries.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      await fetch(`${API_BASE_URL}/api/contact/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchInquiries();
      if (selectedInquiry?._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            {isWebsiteContext
              ? `${websiteDisplayName} — Contact Inquiries`
              : selectedCompany !== "all"
              ? `${activeCompanyDoc?.name || selectedCompany} — Contact Inquiries`
              : "All Contact Inquiries & Leads"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing {filteredInquiries.length} contact form submissions {categoryFilter && `for ${categoryFilter}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Organization Filter Dropdown (Super Admin Only & not in direct website context) */}
          {isSuperAdmin && !isWebsiteContext && (
            <div className="relative flex items-center">
              <Filter size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedWebsite("all");
                }}
                className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#11253e] focus:outline-none focus:border-[#f99d1c] shadow-xs cursor-pointer"
              >
                <option value="all">🏢 All Organizations ({companies.length})</option>
                {companies.map((comp) => (
                  <option key={comp._id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Website Filter Dropdown */}
          {!isWebsiteContext && selectedCompany !== "all" && activeCompanyWebsites.length > 1 && (
            <div className="relative flex items-center">
              <Globe size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#11253e] focus:outline-none focus:border-[#f99d1c] shadow-xs cursor-pointer"
              >
                <option value="all">🌐 All Websites ({activeCompanyWebsites.length})</option>
                {activeCompanyWebsites.map((site: any) => (
                  <option key={site._id || site.slug} value={site.slug || site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Context</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{item.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">{item.subject}</span>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-[11px] text-gray-400 hover:text-[#f99d1c] hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px] transition-colors"
                          title={`Email ${item.email}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail size={10} className="shrink-0" /> {item.email}
                        </a>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-xs text-[#11253e] font-bold truncate transition-all" title={item.pageTitle}>
                          {item.pageTitle || "Quick Contact"}
                        </span>
                        {item.pageUrl && (
                          <span className="text-[10px] text-gray-400 font-mono truncate hover:text-[#f99d1c] transition-colors" title={item.pageUrl}>
                            {new URL(item.pageUrl).pathname}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          item.category === "Contact"
                            ? "bg-indigo-50 text-indigo-600"
                            : item.category === "Client"
                            ? "bg-purple-50 text-purple-600"
                            : item.category === "Footer"
                            ? "bg-teal-50 text-teal-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-500">
                        {item.submittedAt || (item as any).createdAt
                          ? new Date(item.submittedAt || (item as any).createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getResumeUrl(item) && (
                          <a
                            href={getResumeUrl(item)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                            title="View / Download Resume"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText size={18} className="text-[#f99d1c]" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedInquiry(item)}
                          className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} className="text-[#11253e]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                        <MessageSquare className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">No contact inquiries found</p>
                      <p className="text-gray-400 text-xs mt-1">Inquiries submitted via website contact forms will appear here.</p>
                      {categoryFilter?.toLowerCase() === "career" && (
                        <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-800 max-w-md">
                          Looking for candidate resumes &amp; job applications?{" "}
                          <a
                            href={`/admin/dashboard/career?company=${selectedCompany}&website=${selectedWebsite}`}
                            className="font-bold underline text-[#11253e] hover:text-[#f99d1c] transition-colors"
                          >
                            Open Career Applications →
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">Inquiry Details</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Company: {selectedInquiry.companyId?.name || selectedInquiry.project || "General"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#11253e]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Left Column: Client Info */}
              <div className="md:col-span-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                      <p className="text-[#11253e] font-bold text-sm truncate">{selectedInquiry.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="text-[#11253e] hover:text-[#f99d1c] font-medium text-sm hover:underline break-all block transition-colors"
                        title={`Email ${selectedInquiry.email}`}
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>

                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                        {selectedInquiry.phone.toLowerCase().includes("linkedin.com") ? (
                          <Linkedin size={14} className="text-[#0a66c2]" />
                        ) : (
                          <Phone size={14} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                          {selectedInquiry.phone.toLowerCase().includes("linkedin.com")
                            ? "LinkedIn Profile"
                            : selectedInquiry.phone.startsWith("http")
                            ? "Website / Profile"
                            : "Phone Number"}
                        </p>
                        {selectedInquiry.phone.toLowerCase().includes("linkedin.com") || selectedInquiry.phone.startsWith("http") ? (
                          <a
                            href={selectedInquiry.phone.startsWith("http") ? selectedInquiry.phone : `https://${selectedInquiry.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0a66c2] hover:text-[#f99d1c] font-medium text-sm hover:underline flex items-center gap-1.5 break-all transition-colors"
                            title="Open Profile"
                          >
                            <span className="truncate">Open LinkedIn Profile</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${selectedInquiry.phone.replace(/[^0-9+]/g, "")}`}
                            className="text-[#11253e] hover:text-[#f99d1c] font-medium text-sm hover:underline transition-colors block"
                            title={`Call ${selectedInquiry.phone}`}
                          >
                            {selectedInquiry.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* LinkedIn if provided separately on inquiry */}
                  {(selectedInquiry as any).linkedin && !selectedInquiry.phone?.toLowerCase().includes("linkedin.com") && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#0a66c2] shrink-0">
                        <Linkedin size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">LinkedIn Profile</p>
                        <a
                          href={(selectedInquiry as any).linkedin.startsWith("http") ? (selectedInquiry as any).linkedin : `https://${(selectedInquiry as any).linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a66c2] hover:text-[#f99d1c] font-medium text-sm hover:underline flex items-center gap-1.5 break-all transition-colors"
                        >
                          <span className="truncate">Open LinkedIn Profile</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Received At</p>
                      <p className="text-[#11253e] font-medium text-sm">{new Date(selectedInquiry.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={12} /> Source Page
                    </p>
                    <p className="text-[#11253e] font-bold text-[11px] leading-snug">{selectedInquiry.pageTitle || "Quick Contact"}</p>
                  </div>
                  {selectedInquiry.pageUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source URL</p>
                      <a
                        href={selectedInquiry.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f99d1c] text-[10px] break-all font-mono hover:underline flex items-center gap-1"
                      >
                        View Source <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>

                {!isViewer && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Action Status</p>
                    <div className="flex gap-2">
                      {["New", "Contacted", "Closed"].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateStatus(selectedInquiry._id, st)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            selectedInquiry.status === st
                              ? "bg-[#11253e] text-white border-[#11253e]"
                              : "bg-white text-gray-400 border-gray-100 hover:border-[#f99d1c] hover:text-[#f99d1c]"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Message & Resume Content */}
              <div className="md:col-span-7 bg-[#11253e] text-white rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageSquare size={80} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Subject</h4>
                    <p className="text-lg font-bold tracking-tight">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Inquiry Message</h4>
                    <p className="text-white/80 font-light leading-relaxed text-sm whitespace-pre-wrap italic bg-white/5 p-4 rounded-xl border border-white/10">
                      {(() => {
                        const rawMsg = selectedInquiry.message || "";
                        if (rawMsg.trim().startsWith("Resume: /uploads/") || rawMsg.trim().startsWith("/uploads/resumes/")) {
                          return "Candidate submitted their application along with the attached resume.";
                        }
                        const cleanMsg = rawMsg.replace(/Resume:\s*\/uploads\/resumes\/[^\s"']+/gi, "").trim();
                        return cleanMsg || "Candidate submitted their application along with the attached resume.";
                      })()}
                    </p>
                  </div>

                  {/* Attached Resume / CV Card */}
                  {getResumeUrl(selectedInquiry) && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Candidate Resume / CV</h4>
                      <div className="p-4 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#f99d1c] flex items-center justify-center text-[#11253e] shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">Attached Resume</p>
                            <p className="text-[10px] text-white/60 font-mono truncate max-w-[160px]">
                              {getResumeUrl(selectedInquiry)?.split("/").pop()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={getResumeUrl(selectedInquiry)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-[#f99d1c] hover:bg-[#e58b0f] text-[#11253e] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                            title="View Resume in Browser"
                          >
                            <Eye size={13} /> View <ExternalLink size={11} />
                          </a>
                          <a
                            href={getResumeUrl(selectedInquiry)!}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 border border-white/20"
                            title="Download Resume"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedInquiry.status === "Closed" && (
                    <div className="flex items-center gap-2 text-[#f99d1c] pt-2">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Inquiry Handled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Dashboard...</div>}>
      <ContactDashboardContent />
    </Suspense>
  );
}
