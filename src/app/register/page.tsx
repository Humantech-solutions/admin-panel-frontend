"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import adminBg from "@/../public/assets/admin_login_bg.png";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Registration failed.");
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
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Admin Portal</h2>
          <p className="text-white/80 max-w-md text-lg font-light leading-relaxed">
            Unified management console for Nabhira Technologies, Hutech Website, and Hutech Lab.
          </p>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f99d1c]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#11253e]/5 rounded-tl-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo Section - Empty but preserved space */}
          <div className="flex justify-center lg:justify-start mb-16 h-12">
            <div className="text-gray-200 font-bold text-2xl tracking-widest border-2 border-dashed border-gray-100 px-8 flex items-center justify-center rounded-xl bg-gray-50/50">
              LOGO
            </div>
          </div>

          {!success ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-[#11253e] mb-2 tracking-tight">Create Account</h1>
                <p className="text-gray-500 font-medium">Get access to unified administrator dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#11253e] text-sm font-bold mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f99d1c] transition-colors">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#11253e] font-semibold placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-[15px] shadow-sm"
                    />
                  </div>
                </div>

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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#11253e] font-semibold placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-[15px] shadow-sm"
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
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-[#11253e] font-semibold placeholder-gray-400 focus:outline-none focus:border-[#f99d1c] focus:bg-white focus:ring-4 focus:ring-[#f99d1c]/10 transition-all text-[15px] shadow-sm"
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
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2} className="shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-600 text-[14px] font-bold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f99d1c] hover:bg-[#e8900f] text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-[#f99d1c]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 font-medium text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#f99d1c] font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-8 shadow-sm">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#11253e] mb-4 tracking-tight">Account Created!</h1>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                Registration successful. Two-Factor Authentication setup is required. Please sign in to verify your account and obtain the setup code.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-[#11253e] hover:bg-[#030213] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-[#11253e]/20"
              >
                Proceed to Login
              </button>
            </div>
          )}

          {/* Copyright notice */}
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
            <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase font-bold">
              © {new Date().getFullYear()} Hutech Group
            </p>
            <div className="flex gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secure Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
