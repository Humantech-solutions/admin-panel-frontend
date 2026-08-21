"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../admin/components/AdminSidebar";
import { AdminNavbar } from "../admin/components/AdminNavbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CompaniesProvider, useCompanies } from "@/lib/useCompanies";

function OrganizationInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { companies, loading } = useCompanies();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const stored = sessionStorage.getItem("adminAuth");
      if (stored !== "true") {
        router.replace("/login");
        return;
      }
    }

    if (user && user.role !== "superadmin" && !loading) {
      const targetSlug = (user as any).companySlug || companies[0]?.slug;
      if (targetSlug) {
        router.replace(`/admin/dashboard?company=${targetSlug}`);
      } else {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, router, companies, loading]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Suspense fallback={<div className="w-60 h-screen bg-[#11253e]" />}>
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </Suspense>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
          <AdminNavbar onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompaniesProvider>
      <OrganizationInner>{children}</OrganizationInner>
    </CompaniesProvider>
  );
}
