"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Globe,
  Mail,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Shield,
  HardDrive,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { useCompanies, Company } from "@/lib/useCompanies";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function authHeaders() {
  const token = sessionStorage.getItem("adminToken");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface CompanyForm {
  name: string;
  slug: string;
  description: string;
  adminEmail: string;
  fromEmailName: string;
  siteUrl: string;
  siteName: string;
}

const emptyForm: CompanyForm = {
  name: "",
  slug: "",
  description: "",
  adminEmail: "",
  fromEmailName: "",
  siteUrl: "",
  siteName: "",
};

export default function OrganizationCompaniesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { companies, loading, refetch } = useCompanies();

  // Role check: Only Super Admin / Product Owner can access
  useEffect(() => {
    if (user && user.role !== "superadmin" && !loading) {
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
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

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

  // Dynamic EC2 capacity limit: fetched from backend API payload or NEXT_PUBLIC_EC2_STORAGE_LIMIT_GB
  const totalCapacityGB = (companies as any)?.totalCapacityGB || (companies as any)?.ec2CapacityGB || Number(process.env.NEXT_PUBLIC_EC2_STORAGE_LIMIT_GB) || 0;

  const formattedUsed = totalStorageMB >= 1024
    ? `${(totalStorageMB / 1024).toFixed(1)} GB`
    : `${totalStorageMB} MB`;

  /* ── Drawer helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setSlugEdited(false);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditTarget(company);
    setForm({
      name: company.name,
      slug: company.slug,
      description: company.description ?? "",
      adminEmail: company.adminEmail,
      fromEmailName: company.fromEmailName ?? "",
      siteUrl: company.siteUrl ?? "",
      siteName: company.name,
    });
    setSlugEdited(true);
    setFormError("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
    setFormError("");
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugEdited ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) { setFormError("Company name is required."); return; }
    if (!form.adminEmail.trim()) { setFormError("Notification email is required."); return; }

    setSaving(true);
    try {
      let res: Response;
      if (editTarget) {
        res = await fetch(`${API_BASE_URL}/api/companies/${editTarget._id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/companies/add`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!data.success) { setFormError(data.message ?? "Something went wrong."); return; }
      await refetch();
      closeDrawer();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
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

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#f99d1c] hover:bg-[#e88f10] text-white text-sm font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-[#f99d1c]/30 transition-all shrink-0 active:scale-95"
          >
            <Plus size={18} />
            Onboard Company
          </button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Websites</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Storage Used</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Onboarded Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                  <tr key={company._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#11253e] to-[#1a3d66] flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                          {company.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#11253e]">{company.name}</p>
                          {company.description && (
                            <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px] truncate">{company.description}</p>
                          )}
                          {Array.isArray((company as any).websites) && (company as any).websites.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-gray-100 space-y-1">
                              {(company as any).websites.map((site: any) => (
                                <div key={site._id || site.slug} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="text-gray-300 font-mono text-[10px]">↳</span>
                                  <Globe size={11} className="text-blue-500 shrink-0" />
                                  <span className="font-semibold text-gray-700">{site.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {company.slug}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{company.adminEmail}</span>
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const websites = (company as any).websites || [];
                        if (!Array.isArray(websites) || websites.length === 0) {
                          return (
                            <span className="text-xs text-gray-400 font-medium italic">
                              No websites linked
                            </span>
                          );
                        }
                        return (
                          <div className="space-y-2.5">
                            {websites.map((site: any) => {
                              const formattedDate = site.createdAt
                                ? new Date(site.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "N/A";
                              return (
                                <div key={site._id || site.slug} className="flex items-center gap-2">
                                  {/* Zoho-style Date Ribbon Tag */}
                                  <span className="inline-flex items-center bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs shrink-0 tracking-tight">
                                    {formattedDate}
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-[#11253e] truncate">
                                        {site.name}
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${site.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {site.isActive !== false ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    {site.url && (
                                      <a
                                        href={site.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] font-medium text-blue-600 hover:underline truncate max-w-[170px]"
                                      >
                                        {site.url}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Storage Used */}
                    <td className="px-6 py-4">
                      {(() => {
                        const mb = (company as any).storageMB || (company as any).storageUsedMB || 0;
                        const formatted = mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
                        return (
                          <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md font-bold">
                            {formatted}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 font-medium">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Aug 17, 2026"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(company)}
                        disabled={togglingIds.has(company._id)}
                        title={company.isActive ? "Click to deactivate" : "Click to activate"}
                        className="inline-flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        {togglingIds.has(company._id) ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : company.isActive ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <XCircle size={12} />
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(company)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#11253e] hover:bg-gray-100 transition-all"
                          title="Edit Company"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(company)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete Company"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-[#11253e]/50 backdrop-blur-sm" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f99d1c] rounded-xl flex items-center justify-center text-white">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e] text-base">
                    {editTarget ? "Edit Organization" : "Onboard New Organization"}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {editTarget ? `Editing: ${editTarget.name}` : "Configure organization details"}
                  </p>
                </div>
              </div>
              <button onClick={closeDrawer} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#11253e] transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <Field icon={<Building2 size={15} />} label="Organization Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corp"
                  className="input"
                  required
                />
              </Field>

              <Field icon={<Tag size={15} />} label="Slug (URL key)" hint="Auto-generated from name">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => { setSlugEdited(true); setForm((p) => ({ ...p, slug: slugify(e.target.value) })); }}
                  placeholder="acme-corp"
                  className="input font-mono"
                />
              </Field>

              <Field icon={<FileText size={15} />} label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this organization…"
                  rows={3}
                  className="input resize-none"
                />
              </Field>

              <Field icon={<Mail size={15} />} label="Notification Email" required hint="Primary admin email">
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))}
                  placeholder="admin@acme.com"
                  className="input"
                  required
                />
              </Field>

              <Field icon={<Mail size={15} />} label="From Name" hint="Sender name in notification emails">
                <input
                  type="text"
                  value={form.fromEmailName}
                  onChange={(e) => setForm((p) => ({ ...p, fromEmailName: e.target.value }))}
                  placeholder="Acme Notifications"
                  className="input"
                />
              </Field>

              {!editTarget && (
                <>
                  <Field icon={<Globe size={15} />} label="Primary Website URL" hint="Auto-creates linked website domain">
                    <input
                      type="url"
                      value={form.siteUrl}
                      onChange={(e) => setForm((p) => ({ ...p, siteUrl: e.target.value }))}
                      placeholder="https://acme.com"
                      className="input"
                    />
                  </Field>

                  {form.siteUrl && (
                    <Field icon={<Globe size={15} />} label="Primary Website Name" hint="Display name for website">
                      <input
                        type="text"
                        value={form.siteName}
                        onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
                        placeholder="Acme Main Site"
                        className="input"
                      />
                    </Field>
                  )}
                </>
              )}

              {formError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  {formError}
                </div>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDrawer}
                className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-[#11253e] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#f99d1c] hover:bg-[#e88f10] rounded-xl shadow-md shadow-[#f99d1c]/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Onboard Organization"}
              </button>
            </div>
          </aside>
        </div>
      )}

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

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #11253e;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #f99d1c;
          box-shadow: 0 0 0 3px rgba(249, 157, 28, 0.12);
          background: #fff;
        }
        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  label,
  required,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span className="text-gray-400">{icon}</span>
        {label}
        {required && <span className="text-[#f99d1c]">*</span>}
        {hint && <span className="normal-case font-normal text-gray-400 tracking-normal ml-auto">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
