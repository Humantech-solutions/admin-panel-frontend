"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Globe,
  Tag,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Server,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { Company, SmtpConfig } from "@/lib/useCompanies";

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

export interface DepartmentSmtpForm {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  pass: string;
  secure: boolean;
}

const emptySmtpForm: DepartmentSmtpForm = {
  enabled: false,
  host: "",
  port: "587",
  user: "",
  pass: "",
  secure: false,
};

export interface CompanyFormState {
  name: string;
  slug: string;
  description: string;
  adminEmail: string;
  contactNotificationEmail: string;
  careersNotificationEmail: string;
  salesNotificationEmail: string;
  fromEmailName: string;
  siteUrl: string;
  siteName: string;
  adminSmtp: DepartmentSmtpForm; // Primary Company SMTP
  careersSmtp: DepartmentSmtpForm;
  salesSmtp: DepartmentSmtpForm;
  contactSmtp: DepartmentSmtpForm;
}

const emptyForm: CompanyFormState = {
  name: "",
  slug: "",
  description: "",
  adminEmail: "",
  contactNotificationEmail: "",
  careersNotificationEmail: "",
  salesNotificationEmail: "",
  fromEmailName: "",
  siteUrl: "",
  siteName: "",
  adminSmtp: emptySmtpForm,
  careersSmtp: emptySmtpForm,
  salesSmtp: emptySmtpForm,
  contactSmtp: emptySmtpForm,
};

function mapSmtp(smtp?: SmtpConfig): DepartmentSmtpForm {
  if (smtp && (smtp.user || smtp.host)) {
    return {
      enabled: true,
      host: smtp.host || "",
      port: smtp.port ? String(smtp.port) : "587",
      user: smtp.user || "",
      pass: smtp.pass || "",
      secure: Boolean(smtp.secure),
    };
  }
  return { ...emptySmtpForm };
}

interface CompanyOnboardingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editTarget: Company | null;
  onSuccess: () => void;
}

export default function CompanyOnboardingDrawer({
  isOpen,
  onClose,
  editTarget,
  onSuccess,
}: CompanyOnboardingDrawerProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showAdvancedSmtp, setShowAdvancedSmtp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editTarget) {
        setForm({
          name: editTarget.name || "",
          slug: editTarget.slug || "",
          description: editTarget.description || "",
          adminEmail: editTarget.adminEmail || "",
          contactNotificationEmail: editTarget.contactNotificationEmail || "",
          careersNotificationEmail: editTarget.careersNotificationEmail || "",
          salesNotificationEmail: editTarget.salesNotificationEmail || "",
          fromEmailName: editTarget.fromEmailName || "",
          siteUrl: editTarget.websites?.[0]?.url || "",
          siteName: editTarget.websites?.[0]?.name || "",
          adminSmtp: mapSmtp(editTarget.adminSmtp),
          careersSmtp: mapSmtp(editTarget.careersSmtp),
          salesSmtp: mapSmtp(editTarget.salesSmtp),
          contactSmtp: mapSmtp(editTarget.contactSmtp),
        });
        setSlugEdited(true);
      } else {
        setForm(emptyForm);
        setSlugEdited(false);
      }
      setCurrentStep(1);
      setFormError("");
      setShowAdvancedSmtp(false);
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugEdited ? prev.slug : slugify(value),
    }));
  };

  const validateStep = (step: number): boolean => {
    setFormError("");
    if (step === 1) {
      if (!form.name.trim()) {
        setFormError("Company name is required.");
        return false;
      }
      if (!form.slug.trim()) {
        setFormError("Company slug is required.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.adminEmail.trim()) {
        setFormError("Notification email is required.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setFormError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setCurrentStep(1);
      setFormError("Company name is required.");
      return;
    }
    if (!form.adminEmail.trim()) {
      setCurrentStep(2);
      setFormError("Notification email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = editTarget
        ? `${API_BASE_URL}/api/companies/${editTarget._id}`
        : `${API_BASE_URL}/api/companies`;
      const method = editTarget ? "PUT" : "POST";

      const payload: Record<string, any> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        adminEmail: form.adminEmail.trim(),
        contactNotificationEmail: form.contactNotificationEmail.trim(),
        careersNotificationEmail: form.careersNotificationEmail.trim(),
        salesNotificationEmail: form.salesNotificationEmail.trim(),
        fromEmailName: form.fromEmailName.trim(),
      };

      if (!editTarget && form.siteUrl.trim()) {
        payload.siteUrl = form.siteUrl.trim();
        payload.siteName = form.siteName.trim() || `${form.name.trim()} Website`;
      }

      if (form.adminSmtp.enabled && form.adminSmtp.user) {
        payload.adminSmtp = {
          host: form.adminSmtp.host.trim(),
          port: parseInt(form.adminSmtp.port) || 587,
          user: form.adminSmtp.user.trim(),
          pass: form.adminSmtp.pass.trim(),
          secure: form.adminSmtp.secure,
        };
      }

      ["careersSmtp", "salesSmtp", "contactSmtp"].forEach((key) => {
        const k = key as "careersSmtp" | "salesSmtp" | "contactSmtp";
        if (form[k].enabled && form[k].user) {
          payload[k] = {
            host: form[k].host.trim(),
            port: parseInt(form[k].port) || 587,
            user: form[k].user.trim(),
            pass: form[k].pass.trim(),
            secure: form[k].secure,
          };
        }
      });

      const response = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save company profile.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Organization Info" },
    { number: 2, title: "Email & Notifications" },
    { number: 3, title: "Website & Confirm" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#11253e]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
          {/* DRAWER HEADER */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f99d1c]/10 text-[#f99d1c] flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#11253e]">
                  {editTarget ? `Edit ${editTarget.name}` : "Onboard New Organization"}
                </h2>
                <p className="text-xs text-gray-400">
                  {editTarget
                    ? "Update company settings & email configurations"
                    : "Set up organization profile, websites, and mail servers"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-[#11253e] hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* STEP INDICATOR PILLS */}
          <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-2">
            {steps.map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.number);
                  }
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === s.number
                    ? "bg-[#11253e] text-white shadow-sm"
                    : currentStep > s.number
                    ? "bg-[#f99d1c]/15 text-[#f99d1c]"
                    : "bg-white text-gray-400 border border-gray-100"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    currentStep === s.number
                      ? "bg-[#f99d1c] text-white"
                      : currentStep > s.number
                      ? "bg-[#f99d1c] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > s.number ? "✓" : s.number}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>

          {/* FORM CONTENT BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-red-700">{formError}</div>
              </div>
            )}

            {/* STEP 1: Organization Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <Field icon={<Building2 size={15} />} label="Organization Name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                    required
                  />
                </Field>

                <Field icon={<Tag size={15} />} label="Slug (URL key)" hint="Auto-generated from name">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setForm((p) => ({ ...p, slug: slugify(e.target.value) }));
                    }}
                    placeholder="acme-corp"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-mono placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                  />
                </Field>
              </div>
            )}

            {/* STEP 2: Email & Notifications */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <Field icon={<Mail size={15} />} label="Primary Notification Email" required hint="Admin email where general lead notifications are sent">
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))}
                    placeholder="admin@acme.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                    required
                  />
                </Field>

                <Field icon={<ShieldCheck size={15} />} label="From Name" hint="Sender name shown in notification emails">
                  <input
                    type="text"
                    value={form.fromEmailName}
                    onChange={(e) => setForm((p) => ({ ...p, fromEmailName: e.target.value }))}
                    placeholder="Acme Notifications"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                  />
                </Field>

                {/* Departmental Recipient Notification Emails */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-extrabold text-[#11253e] uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} className="text-[#f99d1c]" />
                    Departmental Notification Recipient Emails
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Specify distinct recipient emails for each department. If left blank, they automatically fall back to the primary notification email above.
                  </p>

                  <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Contact Form Recipient Email</label>
                      <input
                        type="email"
                        placeholder="contact@acme.com (Optional)"
                        value={form.contactNotificationEmail}
                        onChange={(e) => setForm((p) => ({ ...p, contactNotificationEmail: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Careers / HR Recipient Email</label>
                      <input
                        type="email"
                        placeholder="careers@acme.com (Optional)"
                        value={form.careersNotificationEmail}
                        onChange={(e) => setForm((p) => ({ ...p, careersNotificationEmail: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Sales & Events Recipient Email</label>
                      <input
                        type="email"
                        placeholder="sales@acme.com (Optional)"
                        value={form.salesNotificationEmail}
                        onChange={(e) => setForm((p) => ({ ...p, salesNotificationEmail: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Outgoing SMTP Server */}
                <div className="pt-3 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-[#11253e] uppercase tracking-wider flex items-center gap-2">
                      <Server size={14} className="text-[#f99d1c]" />
                      Company Outgoing SMTP Server
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">Optional Setup</span>
                  </div>

                  <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 transition-all space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.adminSmtp.enabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => ({
                            ...prev,
                            adminSmtp: { ...prev.adminSmtp, enabled: checked },
                          }));
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#f99d1c] focus:ring-[#f99d1c] accent-[#f99d1c]"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#11253e] block">Enable Custom Company SMTP</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          If disabled, emails are dispatched using the platform&apos;s primary mail engine.
                        </span>
                      </div>
                    </label>

                    {form.adminSmtp.enabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-3.5 animate-in fade-in duration-200">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Host</label>
                            <input
                              type="text"
                              placeholder="smtp.hostinger.com"
                              value={form.adminSmtp.host}
                              onChange={(e) => setForm((prev) => ({
                                ...prev,
                                adminSmtp: { ...prev.adminSmtp, host: e.target.value }
                              }))}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Port</label>
                            <input
                              type="number"
                              placeholder="587"
                              value={form.adminSmtp.port}
                              onChange={(e) => setForm((prev) => ({
                                ...prev,
                                adminSmtp: { ...prev.adminSmtp, port: e.target.value }
                              }))}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username / Email</label>
                          <input
                            type="text"
                            placeholder="email@domain.com"
                            value={form.adminSmtp.user}
                            onChange={(e) => setForm((prev) => ({
                              ...prev,
                              adminSmtp: { ...prev.adminSmtp, user: e.target.value }
                            }))}
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={form.adminSmtp.pass}
                            onChange={(e) => setForm((prev) => ({
                              ...prev,
                              adminSmtp: { ...prev.adminSmtp, pass: e.target.value }
                            }))}
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                          />
                        </div>

                        <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.adminSmtp.secure}
                            onChange={(e) => setForm((prev) => ({
                              ...prev,
                              adminSmtp: { ...prev.adminSmtp, secure: e.target.checked }
                            }))}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-[#f99d1c] focus:ring-[#f99d1c] accent-[#f99d1c]"
                          />
                          <span className="text-xs font-semibold text-gray-600">Use Secure SSL/TLS (Port 465)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Website & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {!editTarget && (
                  <div className="space-y-4">
                    <Field icon={<Globe size={15} />} label="Primary Website URL" hint="Optional initial website link">
                      <input
                        type="url"
                        value={form.siteUrl}
                        onChange={(e) => setForm((p) => ({ ...p, siteUrl: e.target.value }))}
                        placeholder="https://acme.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                      />
                    </Field>

                    {form.siteUrl.trim() && (
                      <Field icon={<Tag size={15} />} label="Website Title" hint="Display title for website">
                        <input
                          type="text"
                          value={form.siteName}
                          onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
                          placeholder="Acme Corporate Website"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#11253e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
                        />
                      </Field>
                    )}
                  </div>
                )}

                {/* Onboarding Confirmation Summary Card */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-[#11253e] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#f99d1c]" />
                    Configuration Summary
                  </h3>
                  <div className="space-y-2 text-xs text-gray-600 pt-1">
                    <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="font-semibold text-gray-400">Organization:</span>
                      <span className="font-bold text-[#11253e]">{form.name || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="font-semibold text-gray-400">URL Slug:</span>
                      <span className="font-mono text-[#11253e]">{form.slug || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="font-semibold text-gray-400">Notification Email:</span>
                      <span className="font-medium text-[#11253e]">{form.adminEmail || "—"}</span>
                    </div>
                    {form.contactNotificationEmail && (
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="font-semibold text-gray-400">Contact Recipient:</span>
                        <span className="font-medium text-[#11253e]">{form.contactNotificationEmail}</span>
                      </div>
                    )}
                    {form.careersNotificationEmail && (
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="font-semibold text-gray-400">Careers Recipient:</span>
                        <span className="font-medium text-[#11253e]">{form.careersNotificationEmail}</span>
                      </div>
                    )}
                    {form.salesNotificationEmail && (
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="font-semibold text-gray-400">Sales Recipient:</span>
                        <span className="font-medium text-[#11253e]">{form.salesNotificationEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-400">Outgoing Mail:</span>
                      <span className="font-bold text-[#f99d1c]">
                        {form.adminSmtp.enabled && form.adminSmtp.user ? "Custom SMTP Enabled" : "Platform Global SMTP"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DRAWER FOOTER ACTIONS */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#11253e] hover:bg-[#1a3d66] rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#f99d1c] hover:bg-[#e88f10] rounded-xl shadow-md shadow-[#f99d1c]/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : editTarget ? (
                  "Save Changes"
                ) : (
                  "Onboard Organization"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
  required,
  hint,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#11253e] flex items-center gap-1.5">
          {icon && <span className="text-[#f99d1c]">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
