"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import {
  Mail,
  User,
  Globe,
  ExternalLink,
  Search,
  Calendar,
  X,
  Clock,
  Briefcase,
  FileText,
  Download,
  Filter,
  Eye,
  Linkedin,
} from "lucide-react";

interface CareerMail {
  _id: string;
  name: string;
  email: string;
  type: "application" | "brochure";
  linkedin?: string;
  resume?: string;
  pageTitle: string;
  pageUrl: string;
  appliedAt: string;
  createdAt: string;
}

function CareerMailsDashboardContent() {
  const searchParams = useSearchParams();
  const companyFilter = searchParams.get("company");
  const websiteFilter = searchParams.get("website") || searchParams.get("project");

  const [inquiries, setInquiries] = useState<CareerMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMail, setSelectedMail] = useState<CareerMail | null>(null);

  // Helper to resolve clean resume URL
  const getResumeUrl = (resume?: string) => {
    if (!resume || !resume.trim()) return null;
    const clean = resume.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    const base = API_BASE_URL.replace(/\/+$/, "");
    const path = clean.startsWith("/") ? clean : `/${clean}`;
    return `${base}${path}`;
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (companyFilter && companyFilter !== "all") params.append("company", companyFilter);
      if (websiteFilter && websiteFilter !== "all") params.append("website", websiteFilter);
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const url = `${API_BASE_URL}/api/career/all${queryStr}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching career mails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [companyFilter, websiteFilter]);

  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            {(websiteFilter || companyFilter || "All").charAt(0).toUpperCase() +
              (websiteFilter || companyFilter || "All").slice(1)}{" "}
            - Career Mails
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tracking {filteredInquiries.length} interactions from the careers page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-64 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#f99d1c] appearance-none cursor-pointer pr-10 relative"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a0aec0\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1rem",
            }}
          >
            <option value="all">All Types</option>
            <option value="application">Applications</option>
            <option value="brochure">Brochure Downloads</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Context</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading career mails...</td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{item.name}</span>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-[11px] text-gray-400 hover:text-[#f99d1c] hover:underline flex items-center gap-1 mt-0.5 transition-colors"
                          title={`Email ${item.email}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail size={10} className="shrink-0" /> {item.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          item.type === "application" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {item.type || "application"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-xs text-[#11253e] font-medium truncate" title={item.pageTitle}>
                          {item.pageTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate">
                          {item.pageUrl ? new URL(item.pageUrl).pathname : "/careers"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.type === "application" && getResumeUrl(item.resume) && (
                          <a
                            href={getResumeUrl(item.resume)!}
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
                          onClick={() => setSelectedMail(item)}
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
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 text-gray-300">
                        <Mail size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No career mails found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  {selectedMail.type === "application" ? <Briefcase size={20} /> : <Download size={20} />}
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">
                    {selectedMail.type === "application" ? "Job Application" : "Brochure Request"}
                  </h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Candidate: {selectedMail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#11253e]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-[#11253e] font-bold text-sm">{selectedMail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</p>
                  <a
                    href={`mailto:${selectedMail.email}`}
                    className="text-[#11253e] hover:text-[#f99d1c] hover:underline font-medium text-sm block break-all transition-colors"
                    title={`Email ${selectedMail.email}`}
                  >
                    {selectedMail.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Submitted At</p>
                  <p className="text-[#11253e] font-medium text-sm">
                    {new Date(selectedMail.appliedAt || selectedMail.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedMail.linkedin && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LinkedIn Profile</p>
                    <a
                      href={selectedMail.linkedin.startsWith("http") ? selectedMail.linkedin : `https://${selectedMail.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0a66c2] hover:text-[#f99d1c] text-sm hover:underline flex items-center gap-1.5 break-all transition-colors"
                    >
                      <Linkedin size={14} className="shrink-0" /> Open LinkedIn Profile <ExternalLink size={12} className="shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Resume / CV Card if application */}
              {selectedMail.type === "application" && getResumeUrl(selectedMail.resume) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Candidate Resume / CV</p>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#f99d1c] flex items-center justify-center text-[#11253e] shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#11253e]">Attached Document</p>
                        <p className="text-[10px] text-gray-500 font-mono truncate">
                          {selectedMail.resume?.split("/").pop()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getResumeUrl(selectedMail.resume)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f99d1c] hover:bg-[#e58b0f] text-[#11253e] font-bold text-xs rounded-xl transition-all shadow-sm"
                        title="View Resume in Browser"
                      >
                        <Eye size={13} /> View <ExternalLink size={11} />
                      </a>
                      <a
                        href={getResumeUrl(selectedMail.resume)!}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-[#11253e] font-medium text-xs rounded-xl transition-all border border-gray-200"
                        title="Download Resume"
                      >
                        <Download size={13} /> Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <Globe size={12} /> Source Context
                  </div>
                  <p className="text-[#11253e] font-bold text-sm tracking-tight">{selectedMail.pageTitle}</p>
                  {selectedMail.pageUrl && (
                    <a
                      href={selectedMail.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f99d1c] text-[11px] font-mono break-all hover:underline flex items-center gap-1"
                    >
                      {selectedMail.pageUrl} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={`mailto:${selectedMail.email}?subject=Regarding your application at Hutech Solutions`}
                  className="flex-1 bg-[#11253e] hover:bg-[#1a385c] text-white py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={14} /> Send Response
                </a>
                {selectedMail.type === "application" && getResumeUrl(selectedMail.resume) ? (
                  <a
                    href={getResumeUrl(selectedMail.resume)!}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 border border-gray-200 hover:border-[#f99d1c] hover:text-[#f99d1c] rounded-2xl text-gray-600 transition-all flex items-center justify-center"
                    title="Download Resume"
                  >
                    <Download size={18} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerMailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Career Mails...</div>}>
      <CareerMailsDashboardContent />
    </Suspense>
  );
}
