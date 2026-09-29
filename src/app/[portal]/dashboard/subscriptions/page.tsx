"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { Mail, Search, Globe, Clock, Building2, CheckCircle2, X } from "lucide-react";

interface Subscription {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  companyId?: { _id: string; name: string; slug: string };
  websiteId?: { _id: string; name: string; slug: string; url?: string };
  project?: string;
}

function SubscriptionsDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { companies } = useCompanies();

  const isSuperAdmin = ["superadmin", "super_editor", "super_viewer"].includes(user?.role || "");
  const isViewer = user?.role === "super_viewer" || user?.role === "company_viewer" || user?.role === "viewer";

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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const activeCompanyDoc = companies.find((c) => c.slug === selectedCompany);
  const activeCompanyWebsites = (activeCompanyDoc as any)?.websites || [];
  const matchedWebsiteDoc = activeCompanyWebsites.find(
    (w: any) => w.slug === urlWebsite || w._id === urlWebsite
  );
  const websiteDisplayName = matchedWebsiteDoc?.name || urlWebsite;

  const fetchSubscriptions = async () => {
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

      const url = `${API_BASE_URL}/api/subscriptions/list?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [selectedCompany, selectedWebsite]);

  const filteredSubscriptions = subscriptions.filter(
    (item) => item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            {isWebsiteContext
              ? `${websiteDisplayName} — Subscriptions`
              : selectedCompany !== "all"
              ? `${activeCompanyDoc?.name || selectedCompany} — Subscriptions`
              : "All Subscriptions"}
          </h1>
          <p className="text-gray-500 mt-1">Manage newsletter subscribers</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c] w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fafc] border-b border-gray-100 text-[#64748b] font-medium">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Portal / Website</th>
                <th className="px-6 py-4">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading subscriptions...</td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No subscriptions found</td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {sub.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium " + (
                        sub.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        {sub.isActive ? <CheckCircle2 size={12} /> : <X size={12} />}
                        {sub.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sub.websiteId?.name ? (
                          <>
                            <Globe size={14} className="text-gray-400" />
                            <span className="text-gray-600">{sub.websiteId.name}</span>
                          </>
                        ) : sub.companyId?.name ? (
                          <>
                            <Building2 size={14} className="text-gray-400" />
                            <span className="text-gray-600">{sub.companyId.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Unknown</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading subscriptions interface...</div>}>
      <SubscriptionsDashboardContent />
    </Suspense>
  );
}
