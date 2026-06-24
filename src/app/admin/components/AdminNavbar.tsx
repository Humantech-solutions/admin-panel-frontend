"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AdminNavbarProps {
  onMobileMenuOpen: () => void;
}

export function AdminNavbar({ onMobileMenuOpen }: AdminNavbarProps) {
  const { logout, user } = useAuth();
  const searchParams = useSearchParams();
  const project = searchParams.get("project") || "nabhira";
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#11253e] hover:bg-[#11253e]/5 transition-colors"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right: User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-xl transition-all duration-200"
        >
          <div className="text-right">
            <p className="text-[#11253e] font-semibold text-sm leading-tight">Welcome, {mounted && user?.name ? user.name : "Admin"}</p>
            <p className="text-gray-400 text-[11px] leading-tight hidden sm:block text-right">Admin Portal</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#11253e] to-[#1a3d66] flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <ChevronDown className={`w-2.5 h-2.5 text-[#11253e] transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {showProfileDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="px-5 py-3 border-b border-gray-50 mb-1">
              <p className="text-sm font-bold text-[#11253e]">{mounted && user?.name ? user.name : "Administrator"}</p>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">{mounted && user?.email ? user.email : "admin@hutech.com"}</p>
            </div>
            
            <div className="px-2 space-y-0.5">
              <Link 
                href={`/admin/dashboard/profile?project=${project}`}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowProfileDropdown(false)}
              >
                <User className="w-3.5 h-3.5" />
                My Profile
              </Link>
              <button className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <div className="h-px bg-gray-50 my-1.5 mx-3" />
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
