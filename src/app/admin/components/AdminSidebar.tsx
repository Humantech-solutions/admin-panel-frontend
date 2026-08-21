"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import footerLogo from "@/assets/footer.png";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Calendar,
  Briefcase,
  MessageSquare,
  FileText,
  X,
  Building2,
  Loader2,
  Globe,
  Settings,
} from "lucide-react";
import { useCompanies } from "@/lib/useCompanies";
import { useAuth } from "@/context/AuthContext";

const getCompanyNavItems = (company: string, companyId?: string) => [
  { label: "Websites", href: `/admin/dashboard/websites?company=${company}`, icon: <Globe size={20} /> },
  { label: "Employees / Users", href: `/admin/dashboard/employees?company=${company}`, icon: <Briefcase size={20} /> },
  { label: "Global Settings", href: `/admin/dashboard/settings?company=${company}`, icon: <Settings size={20} /> },
];

const getWebsiteNavItems = (company: string, website: string) => [
  {
    label: "Contact Form",
    href: `/admin/dashboard/contact-form?company=${company}&website=${website}`,
    icon: <Mail size={20} />,
    subItems: [
      { label: "All Inquiries", href: `/admin/dashboard/contact-form?company=${company}&website=${website}` },
      { label: "Contact Form", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Contact` },
      { label: "Clients Form", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Client` },
      { label: "Footer Contact Form", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Footer` },
      { label: "Industries", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Industries` },
      { label: "Solutions", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Solutions` },
      { label: "Case Study", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Case Study` },
      { label: "Blog", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Blog` },
      { label: "Service", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Service` },
      { label: "Career Contact", href: `/admin/dashboard/contact-form?company=${company}&website=${website}&category=Career` },
    ],
  },
  { label: "Sales Mails", href: `/admin/dashboard/sales-mails?company=${company}&website=${website}`, icon: <Mail size={20} /> },
  { label: "Event Form", href: `/admin/dashboard/event-form?company=${company}&website=${website}`, icon: <Calendar size={20} /> },
  { label: "Career Applications", href: `/admin/dashboard/career?company=${company}&website=${website}`, icon: <Briefcase size={20} /> },
  { label: "Career Mails", href: `/admin/dashboard/career-mails?company=${company}&website=${website}`, icon: <FileText size={20} /> },
  { label: "Chat Queries", href: `/admin/dashboard/chat-queries?company=${company}&website=${website}`, icon: <MessageSquare size={20} /> },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const getSuperAdminNavItems = () => [
  { label: "Companies & Websites", href: "/organization/companies", icon: <Building2 size={20} /> },
];

export function AdminSidebar({ isOpen, onToggle, isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Contact Form"]);
  const [mounted, setMounted] = useState(false);

  const { user } = useAuth();
  const { companies, loading: companiesLoading } = useCompanies();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = (mounted && user?.role === "superadmin") || pathname.startsWith("/organization");

  const currentCompanySlug = searchParams.get("company") || (user as any)?.companySlug || companies[0]?.slug || "";
  const currentWebsite = searchParams.get("website");

  const showLogsView = searchParams.get("logs") === "true" || pathname.includes("/contact-form") || pathname.includes("/event-form") || pathname.includes("/career") || pathname.includes("/chat") || pathname.includes("/sales-mails");

  const currentCompany = companies.find((c) => c.slug === currentCompanySlug) ?? companies[0];

  const config = isSuperAdmin
    ? { logo: "Product Owner", name: "Product Owner", sub: "Super Admin Master" }
    : currentCompany
      ? { logo: currentCompany.name, name: currentCompany.name, sub: "Company Portal" }
      : { logo: "Admin", name: "Admin Panel", sub: "Admin Log" };

  const navItems = isSuperAdmin
    ? getSuperAdminNavItems()
    : (currentWebsite && showLogsView)
      ? getWebsiteNavItems(currentCompanySlug, currentWebsite)
      : getCompanyNavItems(currentCompanySlug, currentCompany?._id);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={`flex items-center border-b border-white/10 transition-all duration-300 ${
          isOpen || mobile ? "px-5 py-5 gap-3 justify-between" : "px-3 py-5 justify-center"
        }`}
      >
        {(isOpen || mobile) && (
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#f99d1c] flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
              {companiesLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                config.logo[0]?.toUpperCase() ?? "P"
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span suppressHydrationWarning className="text-white font-bold text-sm leading-tight tracking-tight truncate">
                {companiesLoading ? "Loading…" : config.name}
              </span>
              <span suppressHydrationWarning className="text-white/40 text-[9px] font-bold uppercase tracking-wider leading-tight">
                {config.sub}
              </span>
            </div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-lg bg-white/10 hover:bg-[#f99d1c]/20 flex items-center justify-center text-white/70 hover:text-[#f99d1c] transition-all duration-200 shrink-0 ${
              !isOpen ? "rotate-180" : ""
            }`}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft size={14} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Websites list block (Hidden for Superadmin Product Owner) */}
      {(isOpen || mobile) && !isSuperAdmin && (
        <div className="px-3 pt-4 pb-2">
          {currentWebsite && showLogsView ? (() => {
            const activeSite = ((currentCompany as any)?.websites || []).find((s: any) => s._id === currentWebsite || s.slug === currentWebsite || s.id === currentWebsite);
            const activeSiteName = activeSite?.name || "Website Logs";
            return (
              <div>
                <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 px-2">
                  Website Logs
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f99d1c]/10 border border-[#f99d1c]/20 text-[#f99d1c] mb-2">
                  <Globe size={14} />
                  <span className="text-xs font-bold truncate">{activeSiteName}</span>
                </div>
                <Link
                  href={`/admin/dashboard?company=${currentCompanySlug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  <ChevronLeft size={14} />
                  Back to Overview
                </Link>
              </div>
            );
          })() : (
            <div>
              <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 px-2">
                Websites
              </p>
              <div className="space-y-1">
                {((currentCompany as unknown as { websites?: Array<{ slug: string; name: string }> })?.websites || []).length === 0 ? (
                  <p className="text-white/40 text-xs px-2 py-1 italic">No websites configured</p>
                ) : (
                  ((currentCompany as unknown as { websites?: Array<{ slug: string; name: string }> })?.websites || []).map((site) => (
                    <Link
                      key={site.slug}
                      href={`/admin/dashboard?company=${currentCompanySlug}&website=${site.slug}`}
                      onClick={mobile ? onMobileClose : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        currentWebsite === site.slug
                          ? "bg-[#f99d1c] text-white shadow-md shadow-[#f99d1c]/30 font-bold"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Globe size={15} className={currentWebsite === site.slug ? "text-white" : "text-white/40"} />
                      <span className="truncate">{site.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav label */}
      {(isOpen || mobile) && (
        <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase px-5 mt-4 mb-2">
          Menu
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isExpanded = expandedItems.includes(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const itemPath = item.href.split("?")[0];
          const isActive = pathname === itemPath || (hasSubItems && pathname.startsWith(itemPath));

          return (
            <div key={item.label} className="space-y-1">
              <div
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 group relative cursor-pointer
                  ${isOpen || mobile ? "px-3 py-2.5" : "px-2 py-2.5 justify-center"}
                  ${
                    isActive && !hasSubItems
                      ? "bg-[#f99d1c] text-white shadow-md shadow-[#f99d1c]/20"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                onClick={() => {
                  if (hasSubItems && (isOpen || mobile)) {
                    toggleExpand(item.label);
                  }
                }}
              >
                {!hasSubItems ? (
                  <Link href={item.href} className="flex items-center gap-3 w-full" onClick={mobile ? onMobileClose : undefined}>
                    <span className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    {(isOpen || mobile) && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <span className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110 text-[#f99d1c]" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    {(isOpen || mobile) && (
                      <>
                        <span className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                          {item.label}
                        </span>
                        <span className="ml-auto transition-transform duration-200">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {!isOpen && !mobile && (
                  <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#11253e] border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Sub items */}
              {hasSubItems && isExpanded && (isOpen || mobile) && (
                <div className="ml-9 space-y-1 border-l border-white/10 pl-2 mt-1">
                  {item.subItems!.map((sub: { label: string; href: string }) => {
                    const subSearchParams = new URL(sub.href, "http://localhost").searchParams;
                    const cat = subSearchParams.get("category");
                    const isSubActive =
                      pathname === sub.href.split("?")[0] &&
                      (cat ? searchParams.get("category") === cat : !searchParams.get("category"));

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={mobile ? onMobileClose : undefined}
                        className={`block py-2 px-3 text-xs rounded-lg transition-all
                          ${
                            isSubActive
                              ? "text-[#f99d1c] font-bold bg-[#f99d1c]/10"
                              : "text-white/40 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom branding */}
      {(isOpen || mobile) && (
        <div className="p-4 border-t border-white/10">
          <p className="text-white/20 text-[10px] text-center">Admin Dashboard v1.1</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-[#11253e] border-r border-white/10 sticky top-0 transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#11253e] flex flex-col shadow-xl z-50">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f99d1c] flex items-center justify-center text-white font-bold text-lg">
                  {config.logo[0]?.toUpperCase() ?? "A"}
                </div>
                <span className="text-white font-bold text-lg truncate">{config.logo}</span>
              </div>
              <button onClick={onMobileClose} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <SidebarContent mobile />
          </aside>
        </div>
      )}
    </>
  );
}

function ChevronLeft({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
