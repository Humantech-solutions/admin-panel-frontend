"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminNavbar } from "../components/AdminNavbar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const stored = sessionStorage.getItem("adminAuth");
      if (stored !== "true") {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, router]);

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
        <AdminNavbar onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}
