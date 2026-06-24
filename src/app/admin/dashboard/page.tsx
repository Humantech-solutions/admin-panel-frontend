"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const project = searchParams.get("project") || "nabhira";

  const cards = [
    { label: "Contact Form", desc: "View & manage contact enquiries", icon: "✉️", href: `/admin/dashboard/contact-form?project=${project}`, color: "from-blue-500/10 to-blue-600/5", border: "border-blue-200" },
    { label: "Event Form", desc: "Add and track upcoming events", icon: "📅", href: `/admin/dashboard/event-form?project=${project}`, color: "from-purple-500/10 to-purple-600/5", border: "border-purple-200" },
    { label: "Career", desc: "Manage job openings & listings", icon: "💼", href: `/admin/dashboard/career?project=${project}`, color: "from-green-500/10 to-green-600/5", border: "border-green-200" },
    { label: "Career Mails", desc: "Review incoming job applications", icon: "📬", href: `/admin/dashboard/career-mails?project=${project}`, color: "from-orange-500/10 to-orange-600/5", border: "border-orange-200" },
    { label: "Chatbot", desc: "Set up & monitor chatbot responses", icon: "💬", href: `/admin/dashboard/chatbot?project=${project}`, color: "from-pink-500/10 to-pink-600/5", border: "border-pink-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#11253e] to-[#1a3d66] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#f99d1c]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <p className="text-[#f99d1c] text-sm font-semibold tracking-widest uppercase mb-1">Admin Portal</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, Admin 👋</h1>
          <p className="text-white/60 text-sm max-w-lg">
            Manage contact submissions, events, job listings, career applications, and chatbot interactions from this central dashboard.
          </p>
        </div>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className={`block bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{card.icon}</div>
              <div className="flex-1">
                <h3 className="text-[#11253e] font-semibold text-base">{card.label}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{card.desc}</p>
              </div>
              <svg
                width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-gray-400 group-hover:text-[#11253e] group-hover:translate-x-1 transition-all mt-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
