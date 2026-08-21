"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Settings,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { Company, useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export interface Website {
  _id: string;
  companyId: string;
  name: string;
  url: string;
  crmType: string;
  crmConfig: any;
  isActive: boolean;
  createdAt: string;
}

interface WebsiteForm {
  name: string;
  url: string;
  crmType: string;
  crmEndpoint: string;
  crmApiKey: string;
}

const emptyForm: WebsiteForm = {
  name: "",
  url: "",
  crmType: "custom",
  crmEndpoint: "",
  crmApiKey: "",
};

function authHeaders() {
  const token = sessionStorage.getItem("adminToken");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function WebsitesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  const isSuperAdmin = user?.role === "superadmin";
  const companyParam = searchParams.get("company") || searchParams.get("companyId") || currentCompany?.slug || currentCompany?._id;

  const [company, setCompany] = useState<Company | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  /* Drawer state */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Website | null>(null);
  const [form, setForm] = useState<WebsiteForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* Delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Fetch Data */
  const fetchData = async () => {
    if (!companyParam) return;
    setLoading(true);
    try {
      // Fetch company details
      const compRes = await fetch(`${API_BASE_URL}/api/companies/${companyParam}`, {
        headers: authHeaders(),
      });
      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.success && compData.company) {
          setCompany(compData.company);
        }
      }

      // Fetch websites for this company
      const webRes = await fetch(`${API_BASE_URL}/api/companies/${companyParam}/websites`, {
        headers: authHeaders(),
      });
      if (webRes.ok) {
        const webData = await webRes.json();
        if (webData.success && Array.isArray(webData.websites)) {
          setWebsites(webData.websites);
        } else {
          setWebsites([]);
        }
      } else {
        setWebsites([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyParam]);

  /* ── Drawer helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (website: Website) => {
    setEditTarget(website);
    setForm({
      name: website.name,
      url: website.url,
      crmType: website.crmType || "custom",
      crmEndpoint: website.crmConfig?.endpoint || "",
      crmApiKey: website.crmConfig?.apiKey || "",
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
    setFormError("");
  };

  /* ── Submit (create / update) ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) { setFormError("Website name is required."); return; }
    if (!form.url.trim()) { setFormError("Website URL is required."); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        url: form.url,
        companyId: company?._id || companyParam,
        crmType: form.crmType,
        crmConfig: {
          endpoint: form.crmEndpoint,
          apiKey: form.crmApiKey
        }
      };

      let res: Response;
      if (editTarget) {
        res = await fetch(`${API_BASE_URL}/api/websites/${editTarget._id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/companies/${company?._id || companyParam}/websites`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        if (!data.success) { setFormError(data.message ?? "Something went wrong."); return; }
        await fetchData();
        closeDrawer();
      } else {
        setFormError("Failed to save website.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/websites/${deleteTarget._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        await fetchData();
        setDeleteTarget(null);
      }
    } catch {
      console.error("Failed to delete website");
    } finally {
      setDeleting(false);
    }
  };

  const targetCompany = company || currentCompany;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#11253e] tracking-tight">
              {targetCompany?.name ? `${targetCompany.name} Websites` : "Company Websites"}
            </h1>
            <p className="text-sm font-semibold text-gray-400">
              Manage sites, domains, and CRM webhooks for this organization
            </p>
          </div>
        </div>

        {!isSuperAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#f99d1c] hover:bg-[#e88f10] text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-[#f99d1c]/20 transition-all text-sm"
          >
            <Plus size={18} />
            Add Website
          </button>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-3" size={32} />
          <p className="font-semibold text-sm">Loading websites...</p>
        </div>
      ) : websites.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-[#11253e] mb-1">No Websites Added Yet</h3>
          <p className="text-gray-400 text-sm font-medium mb-6">
            Add your primary website or landing pages to receive inquiries and form leads.
          </p>
          {!isSuperAdmin && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-[#11253e] hover:bg-[#030213] text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
            >
              <Plus size={18} />
              Add First Website
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => (
            <div
              key={site._id}
              className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-[#f99d1c] font-black group-hover:scale-105 transition-transform">
                    <Globe size={24} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-[#11253e] mb-1 group-hover:text-[#f99d1c] transition-colors">
                  {site.name}
                </h3>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 mb-4 truncate max-w-full"
                >
                  {site.url}
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/admin/dashboard/contact-form?company=${targetCompany?.slug || companyParam}&website=${site._id}`}
                  className="text-xs font-bold text-[#11253e] hover:text-[#f99d1c] flex items-center gap-1.5"
                >
                  <Settings size={14} /> View Form Submissions
                </Link>
                {!isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(site)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(site)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer Form */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#11253e]">
                  {editTarget ? "Edit Website" : "Add Website"}
                </h2>
                <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-black rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form id="website-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-[#11253e] uppercase tracking-wider mb-2">
                    Website / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Acme Main Store"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#f99d1c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#11253e] uppercase tracking-wider mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://acme.com"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#f99d1c]"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                    {formError}
                  </p>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="website-form"
                disabled={saving}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#f99d1c] hover:bg-[#e88f10] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : editTarget ? "Update" : "Create Website"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-[#11253e] mb-2">Delete Website?</h3>
            <p className="text-xs text-gray-400 font-medium mb-6">
              Are you sure you want to delete <span className="font-bold text-black">{deleteTarget.name}</span>? Form entries linked to it will remain in CRM.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
