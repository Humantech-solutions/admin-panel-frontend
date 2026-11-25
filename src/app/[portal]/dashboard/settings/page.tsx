"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCompanies, Company, SmtpConfig } from "@/lib/useCompanies";
import { API_BASE_URL } from "@/config/api";
import {
  Settings,
  Building2,
  Mail,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  Globe,
  Key,
} from "lucide-react";

interface SmtpFormState {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  pass: string;
  secure: boolean;
}

const emptySmtpState: SmtpFormState = {
  enabled: false,
  host: "",
  port: "587",
  user: "",
  pass: "",
  secure: false,
};

function authHeaders() {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function SettingsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { companies, refetch } = useCompanies();

  const urlCompany = searchParams.get("company");
  const activeCompanySlug = urlCompany || (user as any)?.companySlug || companies[0]?.slug || "";
  const companyDoc = companies.find((c) => c.slug === activeCompanySlug) || companies[0];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // General profile state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fromEmailName, setFromEmailName] = useState("");

  // Notification routing emails
  const [adminEmail, setAdminEmail] = useState("");
  const [contactNotificationEmail, setContactNotificationEmail] = useState("");
  const [careersNotificationEmail, setCareersNotificationEmail] = useState("");
  const [salesNotificationEmail, setSalesNotificationEmail] = useState("");

  // Department SMTPs
  const [contactSmtp, setContactSmtp] = useState<SmtpFormState>(emptySmtpState);
  const [careersSmtp, setCareersSmtp] = useState<SmtpFormState>(emptySmtpState);
  const [salesSmtp, setSalesSmtp] = useState<SmtpFormState>(emptySmtpState);
  const [adminSmtp, setAdminSmtp] = useState<SmtpFormState>(emptySmtpState);

  // Accordion open/close
  const [openSmtpTab, setOpenSmtpTab] = useState<string | null>("contact");

  const populateFromCompany = (comp: Company) => {
    setName(comp.name || "");
    setDescription(comp.description || "");
    setFromEmailName(comp.fromEmailName || "");

    setAdminEmail(comp.adminEmail || "");
    setContactNotificationEmail(comp.contactNotificationEmail || comp.adminEmail || "");
    setCareersNotificationEmail(comp.careersNotificationEmail || comp.adminEmail || "");
    setSalesNotificationEmail(comp.salesNotificationEmail || comp.adminEmail || "");

    const parseSmtp = (smtp?: SmtpConfig): SmtpFormState => ({
      enabled: Boolean(smtp?.host || smtp?.user),
      host: smtp?.host || "",
      port: smtp?.port ? String(smtp.port) : "587",
      user: smtp?.user || "",
      pass: smtp?.pass || "",
      secure: Boolean(smtp?.secure),
    });

    setContactSmtp(parseSmtp(comp.contactSmtp));
    setCareersSmtp(parseSmtp(comp.careersSmtp));
    setSalesSmtp(parseSmtp(comp.salesSmtp));
    setAdminSmtp(parseSmtp(comp.adminSmtp));
  };

  useEffect(() => {
    if (companyDoc) {
      populateFromCompany(companyDoc);
    }
  }, [companyDoc?._id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyDoc?._id) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formatPayloadSmtp = (smtp: SmtpFormState) => {
        if (!smtp.enabled && !smtp.host && !smtp.user) return undefined;
        return {
          host: smtp.host.trim() || undefined,
          port: smtp.port ? Number(smtp.port) : 587,
          user: smtp.user.trim() || undefined,
          pass: smtp.pass || undefined,
          secure: smtp.secure,
        };
      };

      const payload = {
        name: name.trim(),
        description: description.trim(),
        fromEmailName: fromEmailName.trim(),
        adminEmail: adminEmail.trim(),
        contactNotificationEmail: contactNotificationEmail.trim(),
        careersNotificationEmail: careersNotificationEmail.trim(),
        salesNotificationEmail: salesNotificationEmail.trim(),
        contactSmtp: formatPayloadSmtp(contactSmtp),
        careersSmtp: formatPayloadSmtp(careersSmtp),
        salesSmtp: formatPayloadSmtp(salesSmtp),
        adminSmtp: formatPayloadSmtp(adminSmtp),
      };

      const res = await fetch(`${API_BASE_URL}/api/companies/${companyDoc._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Global company settings updated successfully!");
        refetch();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setErrorMsg(data.message || "Failed to update settings.");
      }
    } catch (err: any) {
      setErrorMsg("Network error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderSmtpSection = (
    label: string,
    key: string,
    smtp: SmtpFormState,
    setSmtp: React.Dispatch<React.SetStateAction<SmtpFormState>>,
    descriptionText: string
  ) => {
    const isOpen = openSmtpTab === key;
    return (
      <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setOpenSmtpTab(isOpen ? null : key)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${smtp.host && smtp.user ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
              <Server size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#11253e]">{label}</p>
              <p className="text-xs text-gray-400">{descriptionText}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {smtp.host && smtp.user ? (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Configured</span>
            ) : (
              <span className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">Default Server</span>
            )}
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        {isOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-[#fafafa]/50 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">SMTP Host</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#f99d1c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">SMTP Port</label>
              <input
                type="text"
                placeholder="587"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#f99d1c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Username / Email</label>
              <input
                type="text"
                placeholder="noreply@yourdomain.com"
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#f99d1c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">App Password</label>
              <input
                type="password"
                placeholder={smtp.pass ? "••••••••" : "Enter SMTP Password"}
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#f99d1c]"
              />
            </div>
            <div className="col-span-full flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={smtp.secure}
                  onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
                  className="rounded border-gray-300 text-[#f99d1c] focus:ring-[#f99d1c]"
                />
                Use SSL (Port 465) — leave unchecked for TLS/STARTTLS (Port 587)
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#11253e] text-[#f99d1c] flex items-center justify-center font-bold">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#11253e]">Global Organization Settings</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Manage company identity, notification routing, and outbound email servers for {companyDoc?.name || "your organization"}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-bold animate-in fade-in">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Organization Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Building2 className="text-[#f99d1c]" size={20} />
            <div>
              <h2 className="text-base font-bold text-[#11253e]">Company Profile</h2>
              <p className="text-xs text-gray-400">Basic brand information across all client portals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Default Outbound From Name</label>
              <input
                type="text"
                placeholder="e.g. Hutech Solutions Team"
                value={fromEmailName}
                onChange={(e) => setFromEmailName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of company business and services..."
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department Notification Routing Emails */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Mail className="text-[#f99d1c]" size={20} />
            <div>
              <h2 className="text-base font-bold text-[#11253e]">Department Notification Routing</h2>
              <p className="text-xs text-gray-400">Incoming inquiries from website forms will be automatically dispatched to these emails.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Inquiries Email</label>
              <input
                type="email"
                placeholder="contact@yourdomain.com"
                value={contactNotificationEmail}
                onChange={(e) => setContactNotificationEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Careers & Resumes Email</label>
              <input
                type="email"
                placeholder="careers@yourdomain.com"
                value={careersNotificationEmail}
                onChange={(e) => setCareersNotificationEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sales & Brochure Email</label>
              <input
                type="email"
                placeholder="sales@yourdomain.com"
                value={salesNotificationEmail}
                onChange={(e) => setSalesNotificationEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dedicated Department SMTP Relays */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Server className="text-[#f99d1c]" size={20} />
            <div>
              <h2 className="text-base font-bold text-[#11253e]">Department SMTP Outbound Relays</h2>
              <p className="text-xs text-gray-400">Configure dedicated SMTP servers for reliable deliverability from your company domain.</p>
            </div>
          </div>

          <div className="space-y-4">
            {renderSmtpSection("Contact Form Outbound SMTP", "contact", contactSmtp, setContactSmtp, "Used to send auto-acknowledgments for contact inquiries.")}
            {renderSmtpSection("Careers & Recruitment SMTP", "careers", careersSmtp, setCareersSmtp, "Used to send application received receipts to candidates.")}
            {renderSmtpSection("Sales Inquiries SMTP", "sales", salesSmtp, setSalesSmtp, "Used to dispatch quotes and sales brochures.")}
            {renderSmtpSection("General Administration SMTP", "admin", adminSmtp, setAdminSmtp, "Fallback SMTP for system notifications and employee invites.")}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#f99d1c] hover:bg-[#e58b0f] text-[#11253e] font-bold text-sm rounded-2xl shadow-lg shadow-[#f99d1c]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Global Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Global Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
