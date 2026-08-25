"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import adminBg from "@/../public/assets/admin_login_bg.png";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";

export default function AdminLoginPage() {
  const { login, verifyMfa } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mfaStep, setMfaStep] = useState<"login" | "otp" | "change_password" | "setup_company">("login");
  const [mfaToken, setMfaToken] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Company Setup states
  const [setupSlide, setSetupSlide] = useState<1 | 2>(1);
  const [setupCompanyName, setSetupCompanyName] = useState("");
  const [setupAdminEmail, setSetupAdminEmail] = useState("");
  const [setupFromEmailName, setSetupFromEmailName] = useState("");
  const [setupSiteUrl, setSetupSiteUrl] = useState("");
  const [enableSmtp, setEnableSmtp] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [pendingUser, setPendingUser] = useState<any>(null);

  const redirectUser = (u: any) => {
    if (u?.role === "superadmin") {
      router.push("/organization/companies");
    } else {
      const companySlug = u?.companySlug || u?.companyId;
      if (companySlug) {
        router.push(`/admin/dashboard?company=${companySlug}`);
      } else {
        router.push("/admin/dashboard");
      }
    }
  };

  const checkNextStep = (u: any) => {
    if (u?.mustChangePassword) {
      setMfaStep("change_password");
      setPendingUser(u);
    } else if (u?.needsCompanySetup) {
      setMfaStep("setup_company");
      setSetupSlide(1);
      setPendingUser(u);
      if (u?.email) setSetupAdminEmail(u.email);
      if (u?.name) setSetupFromEmailName(u.name);
    } else {
      redirectUser(u);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      if (result.mfaRequired || result.mfaSetupRequired) {
        setMfaStep("otp");
        setMfaToken(result.mfaToken || "");
        setMfaMessage(result.message || "");
      } else {
        checkNextStep(result.user);
      }
    } else {
      setError(result.error || "Login failed.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyMfa(mfaToken, otp);
    setLoading(false);

    if (result.success) {
      checkNextStep(result.user);
    } else {
      setError(result.error || "Verification failed.");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...pendingUser, mustChangePassword: false };
        sessionStorage.setItem("adminUser", JSON.stringify(updatedUser));
        checkNextStep(updatedUser);
      } else {
        setError(data.message || "Failed to update password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextSlide = () => {
    setError("");
    if (!setupCompanyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!setupAdminEmail.trim()) {
      setError("Notification email is required.");
      return;
    }
    setSetupSlide(2);
  };

  const handleSetupCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!setupCompanyName.trim()) {
      setSetupSlide(1);
      setError("Company name is required.");
      return;
    }

    const adminSmtpPayload = enableSmtp && (smtpUser || smtpHost) ? {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      secure: smtpSecure,
    } : null;

    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/auth/setup-company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: setupCompanyName,
          adminEmail: setupAdminEmail,
          fromEmailName: setupFromEmailName,
          siteUrl: setupSiteUrl,
          adminSmtp: adminSmtpPayload
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        redirectUser(data.user);
      } else {
        setError(data.message || "Failed to setup company.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-black">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src={adminBg}
          alt="Admin Login Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030213]/60 to-transparent" />
        <div className="absolute bottom-12 left-12 z-10">
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Admin</h2>
          <p className="text-white/80 max-w-md text-lg font-light leading-relaxed">
            Unified management console for Nabhira Technologies, Hutech Website, and Hutech Lab.
          </p>
        </div>
      </div>

      {/* Right side: Login / Register Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 bg-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f99d1c]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#11253e]/5 rounded-tl-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {mfaStep === "login" ? (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-[#11253e] mb-2 tracking-tight">Portal Access</h1>
                <p className="text-gray-500 font-medium">Please sign in to manage your ecosystem</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#11253e] text-sm font-bold mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f99d1c] transition-colors">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hutech.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#11253e] font-semibold placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-[15px] shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#11253e] text-sm font-bold mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f99d1c] transition-colors">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#11253e] font-semibold placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-[15px] shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11253e] transition-colors"
                    >
                      {showPassword ? (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2} className="shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-600 text-xs font-bold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f99d1c] hover:bg-[#e8900f] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-[#f99d1c]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Authorizing...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 font-medium text-sm">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#f99d1c] font-bold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          ) : mfaStep === "otp" ? (
            <>
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-[#11253e] mb-2 tracking-tight">Security Verification</h1>
                <p className="text-gray-500 font-medium text-xs">{mfaMessage}</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#11253e] text-sm font-bold mb-2 ml-1">
                    Authenticator Code
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f99d1c] transition-colors">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      required
                      autoFocus
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-2 border-gray-300 rounded-2xl text-[#11253e] font-bold tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-xl shadow-sm text-center"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <span className="text-red-600 text-xs font-bold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#11253e] hover:bg-[#030213] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-[#11253e]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaStep("login");
                    setError("");
                    setOtp("");
                  }}
                  className="w-full text-gray-500 hover:text-[#11253e] font-bold text-xs transition-colors py-2"
                >
                  Back to login
                </button>
              </form>
            </>
          ) : mfaStep === "change_password" ? (
            <>
              <div className="mb-8 text-center sm:text-left">
                <span className="inline-block px-3 py-1 bg-amber-50 text-[#f99d1c] font-extrabold text-[10px] tracking-[0.2em] uppercase rounded-full border border-amber-200/60 mb-2">
                  First-Time Account Setup
                </span>
                <h1 className="text-3xl font-extrabold text-[#11253e] tracking-tight">
                  Set Your Password
                </h1>
                <p className="text-gray-500 font-medium mt-1 text-xs">
                  Please set your own permanent password to secure your account.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-sm"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <span className="text-red-600 text-xs font-bold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-[#f99d1c] hover:bg-[#e88f10] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-[#f99d1c]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating Password…" : "Save Password & Continue"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* ──────────────── 2-SLIDE COMPANY REGISTRATION (NATURAL TIGHT SPACING) ──────────────── */}
              <div className="mb-5 text-center sm:text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-extrabold text-[10px] tracking-wider uppercase rounded-full border border-blue-200/60">
                    Step {setupSlide} of 2
                  </span>
                  {/* Step Indicators */}
                  <div className="flex gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full transition-all ${setupSlide === 1 ? 'bg-[#f99d1c] ring-2 ring-[#f99d1c]/30' : 'bg-gray-200'}`} />
                    <span className={`w-2.5 h-2.5 rounded-full transition-all ${setupSlide === 2 ? 'bg-[#f99d1c] ring-2 ring-[#f99d1c]/30' : 'bg-gray-200'}`} />
                  </div>
                </div>

                <h1 className="text-2xl font-extrabold text-[#11253e] tracking-tight">
                  {setupSlide === 1 ? "Register Your Company" : "Website & Mail Server"}
                </h1>
                <p className="text-gray-500 font-medium mt-1 text-xs">
                  {setupSlide === 1
                    ? "Enter your organization profile and primary notification email."
                    : "Configure optional website domain and custom outgoing SMTP settings."}
                </p>
              </div>

              {/* SLIDE 1: Organization & Admin Details */}
              {setupSlide === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      value={setupCompanyName}
                      onChange={(e) => setSetupCompanyName(e.target.value)}
                      placeholder="Acme Corporation"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-3 focus:ring-[#f99d1c]/10 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                      Notification Email * <span className="text-gray-400 font-normal text-[11px]">(Alerts & Leads Inbox)</span>
                    </label>
                    <input
                      type="email"
                      value={setupAdminEmail}
                      onChange={(e) => setSetupAdminEmail(e.target.value)}
                      placeholder="admin@acme.com"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-3 focus:ring-[#f99d1c]/10 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                      From Sender Name <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={setupFromEmailName}
                      onChange={(e) => setSetupFromEmailName(e.target.value)}
                      placeholder="Acme Notifications"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-3 focus:ring-[#f99d1c]/10 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <span className="text-red-600 text-xs font-bold">{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="w-full py-3 bg-[#11253e] hover:bg-[#1a3d66] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      Proceed to Step 2 →
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Website & SMTP Setup */}
              {setupSlide === 2 && (
                <form onSubmit={handleSetupCompanySubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[#11253e] text-xs font-bold mb-1.5 ml-1">
                      Primary Website URL <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={setupSiteUrl}
                      onChange={(e) => setSetupSiteUrl(e.target.value)}
                      placeholder="https://acme.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#11253e] font-medium focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-3 focus:ring-[#f99d1c]/10 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  {/* Admin Outgoing SMTP Setup Box - ALWAYS OPEN, DISABLED WHEN UNCHECKED */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableSmtp}
                          onChange={(e) => setEnableSmtp(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#f99d1c] focus:ring-[#f99d1c] accent-[#f99d1c]"
                        />
                        <span className="text-xs font-bold text-[#11253e]">Setup Custom Admin SMTP Server</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        {enableSmtp ? "Custom Enabled" : "Skip (Use Default)"}
                      </span>
                    </div>

                    {/* Always visible SMTP fields - Disabled & grayed out when enableSmtp is false */}
                    <div className={`space-y-2.5 transition-opacity ${!enableSmtp ? "opacity-50 pointer-events-none" : ""}`}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Host</label>
                          <input
                            type="text"
                            placeholder="smtp.hostinger.com"
                            value={smtpHost}
                            disabled={!enableSmtp}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#f99d1c] disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Port</label>
                          <input
                            type="number"
                            placeholder="587"
                            value={smtpPort}
                            disabled={!enableSmtp}
                            onChange={(e) => setSmtpPort(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#f99d1c] disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Username / Email</label>
                        <input
                          type="text"
                          placeholder="email@domain.com"
                          value={smtpUser}
                          disabled={!enableSmtp}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#f99d1c] disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SMTP Password</label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={smtpPass}
                          disabled={!enableSmtp}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#f99d1c] disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>

                      <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={smtpSecure}
                          disabled={!enableSmtp}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#f99d1c] focus:ring-[#f99d1c] accent-[#f99d1c]"
                        />
                        <span className="text-[11px] font-semibold text-gray-600">Use Secure SSL/TLS (Port 465)</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <span className="text-red-600 text-xs font-bold">{error}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSetupSlide(1)}
                      className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-[#11253e] font-bold text-sm rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !setupCompanyName.trim()}
                      className="w-2/3 py-3 bg-[#f99d1c] hover:bg-[#e88f10] text-white font-bold text-sm rounded-xl shadow-md shadow-[#f99d1c]/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Launching…" : "Launch Dashboard"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Copyright notice */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase font-bold">
              © {new Date().getFullYear()} Hutech Group
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
