"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { User, Mail, Shield, Calendar, ArrowLeft, Key } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  mfaEnabled: boolean;
  createdAt?: string;
}

function ProfileContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const project = searchParams.get("project") || "nabhira";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      setError("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setProfile(data.user);
        } else {
          setError(data.message || "Failed to load profile details.");
        }
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        setError("Unable to connect to the server.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f99d1c]" />
        <p className="text-gray-500 font-semibold mt-4 text-sm">Fetching profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Accessing Profile</h2>
        <p className="text-red-600 font-semibold mb-6">{error}</p>
        <Link
          href={`/admin/dashboard?project=${project}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#11253e] hover:bg-[#1a3d66] text-white font-bold rounded-2xl transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const userProfile = profile || {
    name: user?.name || "System Admin",
    email: user?.email || "admin@hutech.com",
    mfaEnabled: true,
    createdAt: undefined
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center">
        <Link
          href={`/admin/dashboard?project=${project}`}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11253e] font-bold text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        {/* Banner with gradient */}
        <div className="h-44 bg-gradient-to-br from-[#11253e] to-[#1a3d66] relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f99d1c]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Profile Header Block */}
        <div className="px-8 sm:px-12 pb-8 relative">
          {/* Avatar floating overlapping the banner */}
          <div className="absolute -top-16 left-8 sm:left-12">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#f99d1c] to-[#e8900f] border-4 border-white flex items-center justify-center text-white text-4xl font-extrabold shadow-xl">
              {getInitials(userProfile.name)}
            </div>
          </div>

          <div className="pt-20">
            <h1 className="text-3xl font-extrabold text-[#11253e] tracking-tight">{userProfile.name}</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-1">System Administrator</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-8 border-t border-gray-50">
            <div className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                <p className="text-[#11253e] font-bold text-[15px] mt-1">{userProfile.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-[#11253e] font-bold text-[15px] mt-1">{userProfile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">2FA Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${userProfile.mfaEnabled ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-yellow-500 shadow-sm shadow-yellow-500/50'}`} />
                  <p className="text-[#11253e] font-bold text-[15px]">
                    {userProfile.mfaEnabled ? "Enabled (Authenticator App)" : "MFA Setup Required"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Joined Date</p>
                <p className="text-[#11253e] font-bold text-[15px] mt-1">{formatDate(userProfile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f99d1c]" />
        <p className="text-gray-500 font-semibold mt-4 text-sm">Loading profile container...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
