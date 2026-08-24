"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Search, 
  Eye, 
  X, 
  Globe, 
  ExternalLink,
  ClipboardList,
  Building2,
  Filter
} from "lucide-react";

interface EventRegistration {
  _id: string;
  eventTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  interests: string;
  pageTitle: string;
  pageUrl: string;
  submittedAt: string;
  companyId?: { _id: string; name: string; slug: string };
  websiteId?: { _id: string; name: string; slug: string; url?: string };
}

function EventDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { companies } = useCompanies();

  const isSuperAdmin = user?.role === "superadmin";

  const urlCompany = searchParams.get("company");
  const urlWebsite = searchParams.get("website");
  const urlProject = searchParams.get("project");

  const activeCompanySlug = isSuperAdmin
    ? urlCompany || urlProject || "all"
    : (user as any)?.companySlug || urlCompany || "all";

  const isWebsiteContext = Boolean(urlWebsite);
  const activeWebsiteSlug = urlWebsite || "all";

  const [selectedCompany, setSelectedCompany] = useState<string>(activeCompanySlug);
  const [selectedWebsite, setSelectedWebsite] = useState<string>(activeWebsiteSlug);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);

  const activeCompanyDoc = companies.find((c) => c.slug === selectedCompany);
  const activeCompanyWebsites = (activeCompanyDoc as any)?.websites || [];
  const matchedWebsiteDoc = activeCompanyWebsites.find(
    (w: any) => w.slug === urlWebsite || w._id === urlWebsite
  );
  const websiteDisplayName = matchedWebsiteDoc?.name || urlWebsite;

  const fetchRegistrations = async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/event-registration/all?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedCompany, selectedWebsite]);

  const filteredRegistrations = registrations.filter(reg => 
    reg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            {isWebsiteContext
              ? `${websiteDisplayName} — Event Registrations`
              : selectedCompany !== "all"
              ? `${activeCompanyDoc?.name || selectedCompany} — Event Registrations`
              : "All Event Registrations"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage users who registered for events on the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Organization Filter Dropdown (Super Admin Only & not in website context) */}
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

          {/* Website Filter Dropdown (Only shown when browsing company level with multiple websites and NOT inside a specific website panel) */}
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
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-60 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization / Site</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendee Org</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading registrations...</td>
                </tr>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{reg.firstName} {reg.lastName}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{reg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 max-w-fit">
                          <Building2 size={11} />
                          {reg.companyId?.name || "General Organization"}
                        </span>
                        {reg.websiteId?.name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 max-w-fit">
                            <Globe size={10} />
                            {reg.websiteId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#11253e] font-semibold">{reg.eventTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {reg.company || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        {new Date(reg.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReg(reg)}
                        className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                        <ClipboardList className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No registrations found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">Registration Details</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Company: {selectedReg.companyId?.name || "General"} | Event: {selectedReg.eventTitle}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReg(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#11253e]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[70vh] overflow-y-auto">
              <div className="md:col-span-12 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Attendee Name</p>
                        <p className="text-[#11253e] font-bold text-sm">{selectedReg.firstName} {selectedReg.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Mail size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                        <p className="text-[#11253e] font-medium text-sm">{selectedReg.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Briefcase size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Company / Organization</p>
                        <p className="text-[#11253e] font-bold text-sm">{selectedReg.company || "Not Provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <MapPin size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Interests</p>
                        <p className="text-[#11253e] font-medium text-sm capitalize">{selectedReg.interests || "General"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#11253e] rounded-2xl p-6 text-white space-y-4">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/10 pb-2">Website & Target Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} /> Target Website
                      </p>
                      <p className="text-white font-bold text-xs">{selectedReg.websiteId?.name || selectedReg.pageTitle || "N/A"}</p>
                    </div>
                    {selectedReg.pageUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <ExternalLink size={12} /> Source URL
                        </p>
                        <a 
                          href={selectedReg.pageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#f99d1c] text-[10px] break-all font-mono hover:underline"
                        >
                          {selectedReg.pageUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Dashboard...</div>}>
      <EventDashboardContent />
    </Suspense>
  );
}
