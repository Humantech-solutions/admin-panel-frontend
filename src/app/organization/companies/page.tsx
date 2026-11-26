"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Shield,
  HardDrive,
  Code2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { useCompanies, Company } from "@/lib/useCompanies";
import CompanyOnboardingDrawer from "@/components/CompanyOnboardingDrawer";
import EmbedCodeModal from "@/components/EmbedCodeModal";

function authHeaders() {
  const token = sessionStorage.getItem("adminToken");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function OrganizationCompaniesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { companies, loading, refetch } = useCompanies();

  const isAdmin = user?.role === "superadmin" || user?.role === "super_user";
  const isEditor = user?.role === "super_editor";
  const isViewer = user?.role === "super_viewer";

  // Role check: Only Super Admin / Product Owner can access
  useEffect(() => {
    if (user && !["superadmin", "super_user", "super_editor", "super_viewer"].includes(user.role || "") && !loading) {
      const targetSlug = (user as any).companySlug || companies[0]?.slug;
      if (targetSlug) {
        router.replace(`/admin/dashboard?company=${targetSlug}`);
      } else {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, router, companies, loading]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [embedCompany, setEmbedCompany] = useState<Company | null>(null);

  /* ── Dynamic KPI Calculations ── */
  const totalWebsites = companies.reduce((acc, comp) => {
    const count = Array.isArray((comp as any).websites)
      ? (comp as any).websites.length
      : ((comp as any).websitesCount || 0);
    return acc + count;
  }, 0);

  const totalStorageMB = companies.reduce((acc, comp) => {
    return acc + ((comp as any).storageMB || (comp as any).storageUsedMB || 0);
  }, 0);

  const totalCapacityGB = (companies as any)?.totalCapacityGB || (companies as any)?.ec2CapacityGB || Number(process.env.NEXT_PUBLIC_EC2_STORAGE_LIMIT_GB) || 0;

  const formattedUsed = totalStorageMB >= 1024
    ? `${(totalStorageMB / 1024).toFixed(1)} GB`
    : `${totalStorageMB} MB`;

  /* ── Drawer helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setDrawerOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditTarget(company);
    setDrawerOpen(true);
  };

  const toggleActive = async (company: Company) => {
    setTogglingIds((s) => new Set(s).add(company._id));
    try {
      await fetch(`${API_BASE_URL}/api/companies/${company._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !company.isActive }),
      });
      await refetch();
    } catch {
      console.error("Toggle failed");
    } finally {
      setTogglingIds((s) => { const n = new Set(s); n.delete(company._id); return n; });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/companies/${deleteTarget._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await refetch();
      setDeleteTarget(null);
    } catch {
      console.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Super Admin Product Owner Banner */}
      <div className="bg-gradient-to-br from-[#11253e] via-[#1a3d66] to-[#030213] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#f99d1c]/20 text-[#f99d1c] border border-[#f99d1c]/30 text-xs font-bold uppercase tracking-widest rounded-xl">
                Product Owner Portal
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-xl border border-green-500/30">
                Master Admin
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Onboarded Organizations & Companies
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
              Global overview of all onboarded tenant organizations, registered website domains, and platform settings.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-[#f99d1c] hover:bg-[#e88f10] text-white text-sm font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-[#f99d1c]/30 transition-all shrink-0 active:scale-95"
            >
              <Plus size={18} />
              Onboard Company
            </button>
          )}
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Companies</p>
            <p className="text-2xl font-extrabold text-[#11253e] mt-1">{companies.length}</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Websites</p>
            <p className="text-2xl font-extrabold text-[#11253e] mt-1">{totalWebsites}</p>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
            <Globe size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Storage & Database</p>
            <p className="text-2xl font-extrabold text-[#11253e] mt-1">
              {formattedUsed} {totalCapacityGB > 0 ? (
                <span className="text-xs font-semibold text-gray-400">/ {totalCapacityGB} GB Used</span>
              ) : (
                <span className="text-xs font-semibold text-gray-400">Used</span>
              )}
            </p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <HardDrive size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role Access</p>
            <p className="text-2xl font-extrabold text-[#f99d1c] mt-1">Product Owner</p>
          </div>
          <div className="w-11 h-11 bg-orange-50 text-[#f99d1c] rounded-xl flex items-center justify-center font-bold">
            <Shield size={22} />
          </div>
        </div>
      </div>

      {/* Companies Master Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Websites</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Storage</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Onboarded</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-[#f99d1c]" size={28} />
                      <p className="text-gray-400 text-sm">Loading organizations…</p>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Building2 className="text-gray-300" size={28} />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-sm">No companies yet</p>
                        <p className="text-gray-400 text-xs mt-1">Click &ldquo;Onboard Company&rdquo; to get started.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Organization Column */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#11253e] to-[#1a3d66] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                          {company.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#11253e] leading-snug">{company.name}</p>
                          {company.description ? (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{company.description}</p>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-normal">Tenant Portal</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug Column */}
                    <td className="px-4 py-4 align-top">
                      <span className="inline-block whitespace-nowrap font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60 font-medium">
                        {company.slug}
                      </span>
                    </td>

                    {/* Admin Email Column */}
                    <td className="px-4 py-4 align-top">
                      <span className="text-xs font-medium text-slate-600 break-all">{company.adminEmail}</span>
                    </td>

                    {/* Websites Column */}
                    <td className="px-5 py-4 align-top">
                      {(() => {
                        const websites = (company as any).websites || [];
                        if (!Array.isArray(websites) || websites.length === 0) {
                          return (
                            <span className="text-xs text-slate-400 italic font-normal">
                              No websites linked
                            </span>
                          );
                        }
                        return (
                          <div className="space-y-1.5">
                            {websites.map((site: any) => (
                              <div
                                key={site._id || site.slug}
                                className="flex items-start gap-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2 min-w-[200px] max-w-[280px]"
                              >
                                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <Globe size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-[#11253e] truncate">
                                      {site.name}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                        site.isActive !== false
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-200 text-slate-600"
                                      }`}
                                    >
                                      {site.isActive !== false ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  {site.url && (
                                    <a
                                      href={site.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline truncate block mt-0.5 flex items-center gap-1"
                                    >
                                      <span className="truncate">
                                        {site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                      </span>
                                      <ExternalLink size={10} className="shrink-0 opacity-60" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Storage Used Column */}
                    <td className="px-4 py-4 align-top text-center">
                      {(() => {
                        const mb = (company as any).storageMB || (company as any).storageUsedMB || 0;
                        const formatted = mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
                        return (
                          <span className="inline-block font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-md font-bold whitespace-nowrap">
                            {formatted}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Onboarded Date Column */}
                    <td className="px-4 py-4 align-top">
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-4 align-top text-center">
                      <button
                        onClick={() => toggleActive(company)}
                        disabled={togglingIds.has(company._id)}
                        title={company.isActive ? "Click to deactivate" : "Click to activate"}
                        className="inline-flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        {togglingIds.has(company._id) ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : company.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[11px] font-bold px-2.5 py-1 rounded-full hover:bg-emerald-100/60 transition-colors whitespace-nowrap">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap">
                            <XCircle size={12} />
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEmbedCompany(company)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#f99d1c] hover:bg-amber-50 transition-all"
                          title="View Embed Code"
                        >
                          <Code2 size={16} />
                        </button>
                        {(isAdmin || isEditor) && (
                          <button
                            onClick={() => openEdit(company)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#11253e] hover:bg-slate-100 transition-all"
                            title="Edit Organization"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(company)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete Organization"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step Onboarding Drawer */}
      <CompanyOnboardingDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editTarget={editTarget}
        onSuccess={refetch}
      />

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={26} />
              </div>
              <div>
                <h3 className="font-bold text-[#11253e] text-lg">Delete Organization?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  This will permanently remove <span className="font-semibold text-[#11253e]">{deleteTarget.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all active:scale-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <EmbedCodeModal
        isOpen={Boolean(embedCompany)}
        onClose={() => setEmbedCompany(null)}
        websiteName={embedCompany?.name}
        websiteSlug={embedCompany?.slug || ""}
        isOrgCreation={true}
      />
    </div>
  );
}
