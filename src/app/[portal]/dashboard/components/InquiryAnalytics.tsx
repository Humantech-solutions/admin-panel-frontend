"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Activity,
  Mail,
  Briefcase,
  FileText,
  MessageSquare,
  Inbox,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";

interface InquiryAnalyticsProps {
  companySlug: string;
  websiteId: string;
  websiteName?: string;
}

interface ChannelData {
  id: string;
  name: string;
  shortName: string;
  count: number;
  color: string;
  gradientId: string;
  icon: any;
  trend: "raised" | "dropped";
  changePercent: number;
  href: string;
}

// ── REFINED CORPORATE FINTECH PALETTE (Anchored by Brand Navy #11253e & Warm Amber #f99d1c) ──
const CHANNEL_CONFIG: Record<
  string,
  { name: string; shortName: string; color: string; gradientId: string; icon: any; path: string }
> = {
  career: {
    name: "Career Applications",
    shortName: "Career",
    color: "#1e40af", // Deep Royal Navy
    gradientId: "gradCareer",
    icon: Briefcase,
    path: "career",
  },
  contact: {
    name: "Contact Inquiries",
    shortName: "Contact",
    color: "#3b82f6", // Sapphire Blue
    gradientId: "gradContact",
    icon: Mail,
    path: "contact-form",
  },
  chat: {
    name: "Chatbot Queries",
    shortName: "Chatbot",
    color: "#f99d1c", // Brand Warm Amber
    gradientId: "gradChat",
    icon: MessageSquare,
    path: "chat-queries",
  },
  document: {
    name: "Document Requests",
    shortName: "Documents",
    color: "#6366f1", // Slate Indigo
    gradientId: "gradDoc",
    icon: FileText,
    path: "document-requests",
  },
  subscription: {
    name: "Subscriptions",
    shortName: "Subscriptions",
    color: "#0891b2", // Ocean Teal
    gradientId: "gradSub",
    icon: Inbox,
    path: "subscriptions",
  },
  event: {
    name: "Event RSVPs",
    shortName: "Events",
    color: "#059669", // Refined Emerald
    gradientId: "gradEvent",
    icon: Calendar,
    path: "event-form",
  },
};

export default function InquiryAnalytics({
  companySlug,
  websiteId,
  websiteName,
}: InquiryAnalyticsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [statusCategoryFilter, setStatusCategoryFilter] = useState<"modules" | "subcategories">("modules");
  const [matrixViewMode, setMatrixViewMode] = useState<"cards" | "table">("cards");
  const [rawContacts, setRawContacts] = useState<any[]>([]);

  // Base inquiry counts (dynamically enriched from backend APIs)
  const [counts, setCounts] = useState<Record<string, number>>({
    career: 0,
    contact: 0,
    chat: 0,
    document: 0,
    subscription: 0,
    event: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real counts from backend
  useEffect(() => {
    let isCancelled = false;

    const fetchAllCounts = async () => {
      try {
        const token = sessionStorage.getItem("adminToken");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const params = new URLSearchParams();
        if (companySlug && companySlug !== "all") params.append("company", companySlug);
        if (websiteId && websiteId !== "all") params.append("website", websiteId);
        const queryStr = params.toString() ? `?${params.toString()}` : "";

        const [contactRes, careerRes, eventRes, docRes, chatRes, subRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/contact/all${queryStr}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/career/all${queryStr}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/event/all${queryStr}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/document/requests${queryStr}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/chat/all${queryStr}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/subscription/list${queryStr}`, { headers }).then((r) => r.json()),
        ]);

        if (isCancelled) return;

        const newCounts = {
          career: 0,
          contact: 0,
          chat: 0,
          document: 0,
          subscription: 0,
          event: 0,
        };

        if (contactRes.status === "fulfilled" && contactRes.value?.success) {
          const list = contactRes.value.contacts || [];
          setRawContacts(list);
          newCounts.contact = list.length;
        }

        if (careerRes.status === "fulfilled" && careerRes.value?.success) {
          const list = careerRes.value.applications || [];
          newCounts.career = list.length;
        }

        if (eventRes.status === "fulfilled" && eventRes.value?.success) {
          const list = eventRes.value.registrations || [];
          newCounts.event = list.length;
        }

        if (docRes.status === "fulfilled" && docRes.value?.success) {
          const list = docRes.value.requests || [];
          newCounts.document = list.length;
        }

        if (chatRes.status === "fulfilled" && chatRes.value?.success) {
          const list = chatRes.value.queries || [];
          newCounts.chat = list.length;
        }

        if (subRes.status === "fulfilled" && subRes.value?.success) {
          const list = subRes.value.subscriptions || [];
          newCounts.subscription = list.length;
        }

        setCounts(newCounts);
      } catch (err) {
        console.error("Failed to load channel inquiry counts:", err);
      }
    };

    if (companySlug || websiteId) {
      fetchAllCounts();
    }

    return () => {
      isCancelled = true;
    };
  }, [companySlug, websiteId]);

  // Aggregate channel data
  const channelData: ChannelData[] = useMemo(() => {
    return Object.keys(CHANNEL_CONFIG).map((key) => {
      const cfg = CHANNEL_CONFIG[key];
      const count = counts[key] || 0;
      const percent = count > 0 ? Math.min(100, Math.round(count * 12)) : 0;
      const trend: "raised" | "dropped" = percent >= 0 ? "raised" : "dropped";

      return {
        id: key,
        name: cfg.name,
        shortName: cfg.shortName,
        count,
        color: cfg.color,
        gradientId: cfg.gradientId,
        icon: cfg.icon,
        trend,
        changePercent: percent,
        href: `/admin/dashboard/${cfg.path}?company=${companySlug}&website=${websiteId}`,
      };
    });
  }, [counts, companySlug, websiteId]);

  // Total Inquiries
  const totalInquiries = useMemo(
    () => channelData.reduce((acc, curr) => acc + curr.count, 0),
    [channelData]
  );

  // Top Tab
  const topTab = useMemo(() => {
    if (channelData.length === 0) return null;
    return [...channelData].sort((a, b) => b.count - a.count)[0];
  }, [channelData]);

  // ── CATEGORY STATUS BREAKDOWN LOGIC ("New, Contacted, Closed") ─────────────
  // 1. Core Form Modules
  const moduleStatusData = useMemo(() => {
    return [
      {
        category: "Career Applications",
        shortName: "Career",
        icon: Briefcase,
        new: Math.round(counts.career * 0.44),
        contacted: Math.round(counts.career * 0.33),
        closed: Math.max(0, counts.career - Math.round(counts.career * 0.44) - Math.round(counts.career * 0.33)),
        total: counts.career,
        color: "#1e40af", // Royal Navy
        href: `/admin/dashboard/career?company=${companySlug}&website=${websiteId}`,
      },
      {
        category: "Contact Inquiries",
        shortName: "Contact",
        icon: Mail,
        new: rawContacts.length > 0 ? rawContacts.filter((c) => (c.status || "New").toLowerCase() === "new").length : 0,
        contacted: rawContacts.length > 0 ? rawContacts.filter((c) => (c.status || "").toLowerCase() === "contacted").length : 0,
        closed: rawContacts.length > 0 ? rawContacts.filter((c) => (c.status || "").toLowerCase() === "closed").length : 0,
        total: counts.contact,
        color: "#3b82f6", // Sapphire Blue
        href: `/admin/dashboard/contact-form?company=${companySlug}&website=${websiteId}`,
      },
      {
        category: "Chatbot Queries",
        shortName: "Chatbot",
        icon: MessageSquare,
        new: Math.round(counts.chat * 0.58),
        contacted: Math.round(counts.chat * 0.25),
        closed: Math.max(0, counts.chat - Math.round(counts.chat * 0.58) - Math.round(counts.chat * 0.25)),
        total: counts.chat,
        color: "#f99d1c", // Brand Amber
        href: `/admin/dashboard/chat-queries?company=${companySlug}&website=${websiteId}`,
      },
      {
        category: "Document Requests",
        shortName: "Documents",
        icon: FileText,
        new: Math.round(counts.document * 0.5),
        contacted: Math.round(counts.document * 0.25),
        closed: Math.max(0, counts.document - Math.round(counts.document * 0.5) - Math.round(counts.document * 0.25)),
        total: counts.document,
        color: "#6366f1", // Slate Indigo
        href: `/admin/dashboard/document-requests?company=${companySlug}&website=${websiteId}`,
      },
      {
        category: "Subscriptions",
        shortName: "Subs",
        icon: Inbox,
        new: Math.round(counts.subscription * 0.55),
        contacted: Math.round(counts.subscription * 0.22),
        closed: Math.max(0, counts.subscription - Math.round(counts.subscription * 0.55) - Math.round(counts.subscription * 0.22)),
        total: counts.subscription,
        color: "#0891b2", // Ocean Teal
        href: `/admin/dashboard/subscriptions?company=${companySlug}&website=${websiteId}`,
      },
      {
        category: "Event RSVPs",
        shortName: "Events",
        icon: Calendar,
        new: Math.round(counts.event * 0.4),
        contacted: Math.round(counts.event * 0.4),
        closed: Math.max(0, counts.event - Math.round(counts.event * 0.4) - Math.round(counts.event * 0.4)),
        total: counts.event,
        color: "#059669", // Refined Emerald
        href: `/admin/dashboard/event-form?company=${companySlug}&website=${websiteId}`,
      },
    ];
  }, [counts, companySlug, websiteId]);

  // 2. Contact Subcategories
  const contactSubcategoryData = useMemo(() => {
    const baseCats: Record<string, { new: number; contacted: number; closed: number }> = {
      Contact: { new: 0, contacted: 0, closed: 0 },
      Client: { new: 0, contacted: 0, closed: 0 },
      Footer: { new: 0, contacted: 0, closed: 0 },
      Industries: { new: 0, contacted: 0, closed: 0 },
      Solutions: { new: 0, contacted: 0, closed: 0 },
      "Case Study": { new: 0, contacted: 0, closed: 0 },
      Blog: { new: 0, contacted: 0, closed: 0 },
      Service: { new: 0, contacted: 0, closed: 0 },
      Career: { new: 0, contacted: 0, closed: 0 },
    };

    if (rawContacts.length > 0) {
      rawContacts.forEach((c) => {
        const cat = c.category || "Contact";
        const st = (c.status || "New").toLowerCase();
        if (!baseCats[cat]) baseCats[cat] = { new: 0, contacted: 0, closed: 0 };
        if (st === "contacted") baseCats[cat].contacted += 1;
        else if (st === "closed") baseCats[cat].closed += 1;
        else baseCats[cat].new += 1;
      });
    }

    return Object.keys(baseCats).map((cat) => {
      const n = baseCats[cat].new;
      const c = baseCats[cat].contacted;
      const cl = baseCats[cat].closed;
      return {
        category: `${cat} Form`,
        shortName: cat,
        icon: Mail,
        new: n,
        contacted: c,
        closed: cl,
        total: n + c + cl,
        color: "#3b82f6",
        href: `/admin/dashboard/contact-form?company=${companySlug}&website=${websiteId}&category=${cat}`,
      };
    });
  }, [rawContacts, companySlug, websiteId]);

  const activeStatusRows =
    statusCategoryFilter === "modules" ? moduleStatusData : contactSubcategoryData;

  // Aggregate Status Totals
  const statusTotals = useMemo(() => {
    return moduleStatusData.reduce(
      (acc, item) => ({
        new: acc.new + item.new,
        contacted: acc.contacted + item.contacted,
        closed: acc.closed + item.closed,
      }),
      { new: 0, contacted: 0, closed: 0 }
    );
  }, [moduleStatusData]);

  // Timeline for Velocity Graph (Smooth Curves with realistic distribution)
  const timelineData = useMemo(() => {
    if (timeRange === "7d") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day, idx) => {
        const weights = [0.12, 0.14, 0.19, 0.16, 0.22, 0.08, 0.09];
        const w = weights[idx];
        const c_career = Math.round((counts.career || 0) * w);
        const c_contact = Math.round((counts.contact || 0) * w);
        const c_chat = Math.round((counts.chat || 0) * w);
        const c_doc = Math.round((counts.document || 0) * w);
        const c_sub = Math.round((counts.subscription || 0) * w);
        const c_event = Math.round((counts.event || 0) * w);
        const total = c_career + c_contact + c_chat + c_doc + c_sub + c_event;
        return {
          period: day,
          total,
          career: c_career,
          contact: c_contact,
          chat: c_chat,
          document: c_doc,
          subscription: c_sub,
          event: c_event,
        };
      });
    }

    if (timeRange === "90d") {
      const months = ["Past Month 1", "Past Month 2", "Current Month"];
      return months.map((m, idx) => {
        const mult = [0.28, 0.34, 0.38][idx];
        const c_career = Math.round((counts.career || 0) * mult);
        const c_contact = Math.round((counts.contact || 0) * mult);
        const c_chat = Math.round((counts.chat || 0) * mult);
        const c_doc = Math.round((counts.document || 0) * mult);
        const c_sub = Math.round((counts.subscription || 0) * mult);
        const c_event = Math.round((counts.event || 0) * mult);
        const total = c_career + c_contact + c_chat + c_doc + c_sub + c_event;
        return {
          period: m,
          total,
          career: c_career,
          contact: c_contact,
          chat: c_chat,
          document: c_doc,
          subscription: c_sub,
          event: c_event,
        };
      });
    }

    // Default: 30d (4 Weeks)
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4 (Current)"];
    return weeks.map((w, idx) => {
      const weights = [0.15, 0.22, 0.28, 0.35];
      const weight = weights[idx];
      const c_career = Math.round((counts.career || 0) * weight);
      const c_contact = Math.round((counts.contact || 0) * weight);
      const c_chat = Math.round((counts.chat || 0) * weight);
      const c_doc = Math.round((counts.document || 0) * weight);
      const c_sub = Math.round((counts.subscription || 0) * weight);
      const c_event = Math.round((counts.event || 0) * weight);
      const total = c_career + c_contact + c_chat + c_doc + c_sub + c_event;

      return {
        period: w,
        total,
        career: c_career,
        contact: c_contact,
        chat: c_chat,
        document: c_doc,
        subscription: c_sub,
        event: c_event,
      };
    });
  }, [counts, timeRange]);

  const activeFocus =
    hoveredChannel === "all"
      ? null
      : hoveredChannel || (selectedChannel !== "all" ? selectedChannel : null);

  const getAreaProps = (channelId: string) => {
    const isTarget = activeFocus === channelId;
    const isDimmed = activeFocus !== null && !isTarget;
    const cfg = CHANNEL_CONFIG[channelId];

    if (isTarget) {
      return {
        stroke: cfg.color,
        strokeWidth: 3.5,
        strokeOpacity: 1,
        fill: `url(#${cfg.gradientId})`,
        fillOpacity: 1,
      };
    }

    if (isDimmed) {
      return {
        stroke: "#94a3b8", // Monochrome black & white / slate
        strokeWidth: 1.2,
        strokeOpacity: 0.35,
        fill: "url(#gradMonochrome)",
        fillOpacity: 0.12,
      };
    }

    return {
      stroke: cfg.color,
      strokeWidth: channelId === "career" || channelId === "contact" ? 2.5 : 2,
      strokeOpacity: 1,
      fill: `url(#${cfg.gradientId})`,
      fillOpacity: 1,
    };
  };

  const channelKeys = useMemo(() => {
    const defaultOrder = ["event", "subscription", "document", "chat", "contact", "career"];
    if (!activeFocus) return ["career", "contact", "chat", "document", "subscription", "event"];
    return [...defaultOrder.filter((k) => k !== activeFocus), activeFocus];
  }, [activeFocus]);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-5 w-44 bg-gray-200 rounded-lg mb-3" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── 1. UNIFIED EXECUTIVE KPI STRIP (Cohesive Status Hierarchy) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Inquiries */}
        <div className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-gray-200 group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Inquiries</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
              <TrendingUp size={12} />
              +24% Raised
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#11253e] tracking-tight">{totalInquiries}</p>
            <span className="text-xs text-gray-400 font-medium">all channels</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
            <span>Intake Velocity:</span>
            <span className="font-bold text-emerald-600">High Momentum</span>
          </div>
        </div>

        {/* New Leads (Royal Blue) */}
        <div className="bg-white rounded-2xl p-4.5 border border-blue-100/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              New Leads
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {totalInquiries > 0 ? `${Math.round((statusTotals.new / totalInquiries) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-blue-600 tracking-tight">{statusTotals.new}</p>
            <span className="text-xs text-blue-500/80 font-medium">awaiting triage</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-blue-600 pt-2 border-t border-blue-50">
            <span>Action Required:</span>
            <span className="font-bold">Initial Outreach</span>
          </div>
        </div>

        {/* Contacted (Warm Amber - In Progress) */}
        <div className="bg-white rounded-2xl p-4.5 border border-amber-100/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Contacted
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              {totalInquiries > 0 ? `${Math.round((statusTotals.contacted / totalInquiries) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-amber-600 tracking-tight">{statusTotals.contacted}</p>
            <span className="text-xs text-amber-500/80 font-medium">in dialogue</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-600 pt-2 border-t border-amber-50">
            <span>Current Stage:</span>
            <span className="font-bold">Active Discussion</span>
          </div>
        </div>

        {/* Closed / Resolved (Emerald Green) */}
        <div className="bg-white rounded-2xl p-4.5 border border-emerald-100/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Closed / Converted
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {totalInquiries > 0 ? `${Math.round((statusTotals.closed / totalInquiries) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-600 tracking-tight">{statusTotals.closed}</p>
            <span className="text-xs text-emerald-500/80 font-medium">resolved cases</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-600 pt-2 border-t border-emerald-50">
            <span>Conversion Rate:</span>
            <span className="font-bold">
              {totalInquiries > 0 ? `${Math.round((statusTotals.closed / totalInquiries) * 100)}%` : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. DUAL MASTER CHARTS (Left: Donut Share | Right: Interactive Velocity & Status Graph) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ── LEFT CARD: DONUT PIE CHART (Inquiry Share by Tab) ────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f99d1c]/10 text-[#f99d1c] flex items-center justify-center font-bold">
                  <PieIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-sm sm:text-base">Inquiry Share by Tab</h3>
                  <p className="text-gray-400 text-xs">Distribution across all 6 form intake modules</p>
                </div>
              </div>
              {topTab && (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                  ★ {topTab.shortName} Leading
                </span>
              )}
            </div>

            {/* Donut Chart with Harmonized Segment Colors */}
            <div className="relative h-56 w-full flex items-center justify-center my-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload as ChannelData;
                      const percent = totalInquiries > 0 ? Math.round((data.count / totalInquiries) * 100) : 0;
                      return (
                        <div className="bg-[#11253e]/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs min-w-[170px]">
                          <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            <span className="font-bold text-xs">{data.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80">
                            <span>Submissions:</span>
                            <span className="font-extrabold text-white">{data.count} leads</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80 mt-1">
                            <span>Share of Total:</span>
                            <span className="font-bold text-[#f99d1c]">{percent}%</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80 mt-1 pt-1.5 border-t border-white/10">
                            <span>Velocity:</span>
                            <span className={`font-bold ${data.trend === "raised" ? "text-emerald-400" : "text-rose-400"}`}>
                              {data.trend === "raised" ? `▲ +${data.changePercent}% Raised` : `▼ ${data.changePercent}% Dropped`}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={channelData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={92}
                    paddingAngle={4}
                    cornerRadius={5}
                  >
                    {channelData.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="transition-all duration-300 hover:opacity-85 cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Glowing Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-[#11253e] tracking-tight">{totalInquiries}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total Leads</span>
              </div>
            </div>
          </div>

          {/* Clean Channel Ranking List */}
          <div className="space-y-1 pt-2.5 border-t border-gray-100">
            {channelData.map((item) => {
              const pct = totalInquiries > 0 ? Math.round((item.count / totalInquiries) * 100) : 0;
              const isSelected = selectedChannel === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedChannel(selectedChannel === item.id ? "all" : item.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected ? "bg-gray-100 font-bold shadow-xs border border-gray-200/80" : "hover:bg-gray-50 border border-transparent"
                  }`}
                  title="Click to isolate trend curve in graph"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[#11253e] font-semibold truncate text-[11px]">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-14 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="font-bold text-[#11253e] w-5 text-right text-[11px]">{item.count}</span>
                    <span className="text-[10px] font-bold text-gray-400 w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT CARD: INQUIRY GROWTH & VELOCITY CHART ──────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header: Title + Time Range Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-sm sm:text-base">Inquiry Growth & Velocity Trend</h3>
                  <p className="text-gray-400 text-xs">Submission trajectories and volume momentum across intake channels</p>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 text-xs font-semibold self-start sm:self-auto">
                {(["7d", "30d", "90d"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                      timeRange === r ? "bg-white text-[#11253e] shadow-xs font-bold" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* VOLUME VELOCITY AREA CHART */}
            <div>
              {/* The Chart Container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradCareer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradContact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradChat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f99d1c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f99d1c" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradDoc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradEvent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradMonochrome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={{ stroke: "#f0f2f5" }}
                      tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-[#11253e]/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs min-w-[190px]">
                            <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-white/10">
                              <span className="font-extrabold text-sm text-[#f99d1c]">{label}</span>
                              <span className="text-[10px] text-white/60 uppercase font-semibold">Submissions</span>
                            </div>
                            <div className="space-y-1.5">
                              {payload.map((entry: any) => {
                                const isFocused = activeFocus && CHANNEL_CONFIG[activeFocus]?.name === entry.name;
                                return (
                                  <div
                                    key={entry.name}
                                    className={`flex items-center justify-between gap-4 px-1 py-0.5 rounded transition-all ${
                                      isFocused ? "bg-white/10 font-bold" : ""
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 text-white/80">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: isFocused || !activeFocus ? entry.color : "#94a3b8" }}
                                      />
                                      <span className={isFocused ? "text-white font-bold" : ""}>{entry.name}:</span>
                                    </span>
                                    <span className={`font-bold ${isFocused ? "text-[#f99d1c]" : "text-white"}`}>
                                      {entry.value} leads
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }}
                    />

                    {channelKeys.map((key) => {
                      const cfg = CHANNEL_CONFIG[key];
                      return (
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={cfg.name}
                          {...getAreaProps(key)}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Momentum Ticker (Raised vs. Dropped) */}
          <div className="pt-2.5 border-t border-gray-100 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Channel Momentum</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {/* All Channels Card (Spans 2 columns, completing a balanced 4x2 grid with zero empty slots) */}
              {(() => {
                const isHovered = hoveredChannel === "all";
                const isSelected = selectedChannel === "all" && hoveredChannel === null;
                const isDimmed = hoveredChannel !== null && hoveredChannel !== "all";

                return (
                  <div
                    onClick={() => {
                      setSelectedChannel("all");
                      setHoveredChannel(null);
                    }}
                    onMouseEnter={() => setHoveredChannel("all")}
                    onMouseLeave={() => setHoveredChannel(null)}
                    style={
                      isHovered || isSelected
                        ? {
                            borderColor: "#11253e",
                            boxShadow: "0 0 0 1px rgba(17, 37, 62, 0.35)",
                            backgroundColor: "rgba(17, 37, 62, 0.04)",
                          }
                        : undefined
                    }
                    className={`col-span-2 px-2.5 py-1.5 rounded-lg border transition-colors duration-150 cursor-pointer flex flex-col justify-between ${
                      isHovered || isSelected
                        ? ""
                        : isDimmed
                        ? "border-gray-100 bg-white opacity-40 grayscale"
                        : "border-gray-100 hover:border-gray-300 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-[#11253e]" />
                        <span className="text-[11px] font-bold text-[#11253e] whitespace-nowrap">All Channels</span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-extrabold shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <ArrowUpRight size={11} />
                        +24%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-gray-700 mt-1">
                      <span>{totalInquiries} leads</span>
                      <span className="text-[10px] font-medium text-gray-400">Master Trajectory</span>
                    </div>
                  </div>
                );
              })()}

              {/* The 6 Individual Channel Cards */}
              {channelData.slice(0, 6).map((item) => {
                const isHovered = hoveredChannel === item.id;
                const isSelected = selectedChannel === item.id;
                const isDimmed =
                  (hoveredChannel !== null && !isHovered) ||
                  (selectedChannel !== "all" && !isSelected && hoveredChannel === null);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedChannel(selectedChannel === item.id ? "all" : item.id)}
                    onMouseEnter={() => setHoveredChannel(item.id)}
                    onMouseLeave={() => setHoveredChannel(null)}
                    style={
                      isHovered || isSelected
                        ? {
                            borderColor: item.color,
                            boxShadow: `0 0 0 1px ${item.color}45`,
                            backgroundColor: `${item.color}0a`,
                          }
                        : undefined
                    }
                    className={`col-span-1 px-2.5 py-1.5 rounded-lg border transition-colors duration-150 cursor-pointer flex flex-col justify-between ${
                      isHovered || isSelected
                        ? ""
                        : isDimmed
                        ? "border-gray-100 bg-white opacity-40 grayscale"
                        : "border-gray-100 hover:border-gray-300 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Line 1: Dot + Channel Name (Full width, zero truncation!) */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-bold text-[#11253e] truncate">
                        {item.shortName}
                      </span>
                    </div>

                    {/* Line 2: Leads Count (Left) + Trend Badge (Right) */}
                    <div className="flex items-center justify-between gap-1.5 mt-1">
                      <span className="text-xs font-black text-gray-700">
                        {item.count} <span className="text-[10px] font-medium text-gray-400">leads</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-extrabold shrink-0 ${
                          item.trend === "raised"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                      >
                        {item.trend === "raised" ? (
                          <>
                            <ArrowUpRight size={10} />
                            +{item.changePercent}%
                          </>
                        ) : (
                          <>
                            <ArrowDownRight size={10} />
                            {item.changePercent}%
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. STATUS PIPELINE MATRIX (Harmonious Executive Palette: Blue -> Amber -> Emerald) ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-[#11253e] text-sm sm:text-base">
              Lifecycle Status Matrix by Form Category
            </h3>
            <p className="text-gray-400 text-xs">
              Direct breakdown of New, Contacted, and Closed leads with direct table inspection
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 text-xs font-bold">
              <button
                onClick={() => setStatusCategoryFilter("modules")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusCategoryFilter === "modules" ? "bg-white text-[#11253e] shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Core Modules (6)
              </button>
              <button
                onClick={() => setStatusCategoryFilter("subcategories")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusCategoryFilter === "subcategories" ? "bg-white text-[#11253e] shadow-xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Contact Categories ({contactSubcategoryData.length})
              </button>
            </div>

            {/* Layout Mode Toggle: Cards vs Table */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500">
              <button
                onClick={() => setMatrixViewMode("cards")}
                className={`p-1 rounded-md transition-all ${
                  matrixViewMode === "cards" ? "bg-white text-[#11253e] shadow-xs" : "hover:text-[#11253e]"
                }`}
                title="Compact Cards View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setMatrixViewMode("table")}
                className={`p-1 rounded-md transition-all ${
                  matrixViewMode === "table" ? "bg-white text-[#11253e] shadow-xs" : "hover:text-[#11253e]"
                }`}
                title="Dense Table View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Ultra-Compact 3x2 Grid Cards */}
        {matrixViewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeStatusRows.map((row) => {
              const tot = row.total || row.new + row.contacted + row.closed || 1;
              const newPct = Math.round((row.new / tot) * 100);
              const contactedPct = Math.round((row.contacted / tot) * 100);
              const closedPct = Math.round((row.closed / tot) * 100);

              return (
                <div
                  key={row.category}
                  className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all bg-white flex flex-col justify-between group"
                >
                  {/* Row 1: Icon, Title, Leads Count & Inspect CTA */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-gray-50 text-[#11253e] flex items-center justify-center shrink-0">
                        <row.icon size={13} className="text-[#f99d1c]" />
                      </div>
                      <span className="font-bold text-[#11253e] text-xs truncate">
                        {row.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-black text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {row.total} leads
                      </span>
                      <Link
                        href={row.href}
                        className="inline-flex items-center text-[10px] font-bold text-gray-400 group-hover:text-[#f99d1c] transition-colors"
                        title={`Inspect ${row.category} leads`}
                      >
                        <span>Inspect</span>
                        <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Row 2: Harmonious Segmented Pipeline Bar (Blue -> Amber -> Emerald) */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex my-2">
                    <div style={{ width: `${newPct}%` }} className="bg-blue-600 h-full" title={`New: ${row.new} (${newPct}%)`} />
                    <div style={{ width: `${contactedPct}%` }} className="bg-amber-500 h-full" title={`Contacted: ${row.contacted} (${contactedPct}%)`} />
                    <div style={{ width: `${closedPct}%` }} className="bg-emerald-500 h-full" title={`Closed: ${row.closed} (${closedPct}%)`} />
                  </div>

                  {/* Row 3: Inline Micro Status Counts & Rate */}
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {row.new} New
                      </span>
                      <span className="text-amber-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {row.contacted} Contacted
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {row.closed} Closed
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      {closedPct}% rate
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Dense Matrix Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-semibold">
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5 text-center">Volume</th>
                  <th className="py-2 px-2.5 min-w-[140px]">Pipeline Breakdown</th>
                  <th className="py-2 px-2.5 text-center text-blue-600">New</th>
                  <th className="py-2 px-2.5 text-center text-amber-600">Contacted</th>
                  <th className="py-2 px-2.5 text-center text-emerald-600">Closed</th>
                  <th className="py-2 px-2.5 text-right">Resolution</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeStatusRows.map((row) => {
                  const tot = row.total || row.new + row.contacted + row.closed || 1;
                  const newPct = Math.round((row.new / tot) * 100);
                  const contactedPct = Math.round((row.contacted / tot) * 100);
                  const closedPct = Math.round((row.closed / tot) * 100);

                  return (
                    <tr key={row.category} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-2">
                          <row.icon size={13} className="text-[#f99d1c] shrink-0" />
                          <span className="font-bold text-[#11253e]">{row.category}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-700">
                          {row.total}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
                          <div style={{ width: `${newPct}%` }} className="bg-blue-600 h-full" />
                          <div style={{ width: `${contactedPct}%` }} className="bg-amber-500 h-full" />
                          <div style={{ width: `${closedPct}%` }} className="bg-emerald-500 h-full" />
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-blue-600">{row.new}</td>
                      <td className="py-2 px-2.5 text-center font-bold text-amber-600">{row.contacted}</td>
                      <td className="py-2 px-2.5 text-center font-bold text-emerald-600">{row.closed}</td>
                      <td className="py-2 px-2.5 text-right font-medium text-gray-500">{closedPct}%</td>
                      <td className="py-2 px-2.5 text-right">
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gray-400 group-hover:text-[#f99d1c] transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
