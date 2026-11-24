"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  CheckCircle2,
  Sparkles,
  Mail,
  FileText,
  Code2,
  Building2,
  Activity,
  Check,
  Copy,
  Send,
  Inbox,
  ChevronDown,
  Laptop,
} from "lucide-react";
import LandingIntegrationGuide from "@/components/LandingIntegrationGuide";

export default function LandingPage() {
  const [copiedHeroCode, setCopiedHeroCode] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Live Simulator state
  const [simName, setSimName] = useState("Alex Johnson");
  const [simEmail, setSimEmail] = useState("alex@innovate.co");
  const [simMsg, setSimMsg] = useState("Interested in the enterprise multi-tenant plan.");
  const [simWebsite, setSimWebsite] = useState("nabhira.com");
  const [simulatedLeads, setSimulatedLeads] = useState([
    { id: 1, name: "Sarah Lin", email: "sarah.l@acme.inc", origin: "hutechsolutions.in", category: "Careers", time: "2m ago", status: "New" },
    { id: 2, name: "Marcus Vance", email: "m.vance@vortex.io", origin: "nabhira.com", category: "Sales Inquiry", time: "8m ago", status: "Reviewed" },
    { id: 3, name: "Elena Rostova", email: "elena@fintech.de", origin: "globalretail.com", category: "Quote Request", time: "14m ago", status: "Contacted" },
  ]);
  const [simSuccess, setSimSuccess] = useState(false);

  const heroSnippet = `<script src="https://apis.admin.hutechsolutions.in/crm-embed.js" data-website="your-slug" async></script>`;

  const copyHeroSnippet = () => {
    navigator.clipboard.writeText(heroSnippet);
    setCopiedHeroCode(true);
    setTimeout(() => setCopiedHeroCode(false), 2000);
  };

  const handleSimulateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) return;

    const newLead = {
      id: Date.now(),
      name: simName.trim(),
      email: simEmail.trim(),
      origin: simWebsite,
      category: "Contact Form",
      time: "Just now",
      status: "New",
    };

    setSimulatedLeads([newLead, ...simulatedLeads.slice(0, 4)]);
    setSimSuccess(true);
    setTimeout(() => setSimSuccess(false), 3000);
  };

  const faqs = [
    {
      q: "How does the 1-line universal embed script work?",
      a: "When you onboard a company and register a website in SahajCRM, you receive a generated <script> tag with your unique data-website slug. You paste this single tag into your website template right before the closing </body> tag. It immediately scans your entire website, detects every existing form (Contact, Careers, Subscriptions, Sales Quotes), and connects them to your CRM endpoints without altering your design or injecting unwanted floating buttons.",
    },
    {
      q: "Can I connect my existing HTML contact forms without replacing them?",
      a: "Yes! In fact, you don't even need to modify your HTML. The embed script automatically scans and identifies all existing forms and inputs on your site. For contact forms, job applications with resume uploads, newsletter signups, or quote requests, it automatically maps the inputs and sends the data straight to your CRM dashboard with zero JavaScript changes.",
    },
    {
      q: "How does multi-tenant data isolation work?",
      a: "Each organization in SahajCRM has its own isolated tenant space, custom user accounts, assigned websites, and independent notification channels. Superadmins can manage all portals from a centralized cockpit, while company admins and editors only access their designated organization.",
    },
    {
      q: "Can each organization use its own custom SMTP server for branded emails?",
      a: "Yes. SahajCRM supports granular department-level SMTP configurations (Sales, Careers, Contact, and Admin). You can connect custom Gmail, Outlook, Amazon SES, or SendGrid credentials per company or fall back to platform defaults.",
    },
    {
      q: "Where can I view the API documentation and test endpoints?",
      a: "You can visit our dedicated documentation portal at /docs. It includes an interactive embed snippet generator, routing guides for existing forms, and complete documentation for REST endpoints (/api/contact/submit, /api/career/apply, etc.).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#11253e] font-sans selection:bg-[#f99d1c] selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-[#f99d1c]/10 via-[#11253e]/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-blue-100/30 blur-3xl rounded-full" />
        <div className="absolute top-[1200px] -right-48 w-[600px] h-[600px] bg-[#f99d1c]/5 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />
      </div>

      {/* Floating Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <nav className="h-16 px-6 bg-white/80 backdrop-blur-xl border border-slate-200/70 rounded-2xl shadow-sm flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#11253e] to-[#1c3b63] rounded-xl flex items-center justify-center shadow-md shadow-[#11253e]/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-lg">S</span>
              </div>
              <span className="text-xl font-black text-[#11253e] tracking-tight">
                SahajCRM<span className="text-[#f99d1c]">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7 font-semibold text-sm text-slate-500">
              <a href="#features" className="hover:text-[#11253e] transition-colors">Features</a>
              <a href="#simulator" className="hover:text-[#11253e] transition-colors">Live Demo</a>
              <a href="#how-it-works" className="hover:text-[#11253e] transition-colors">How It Works</a>
              <Link 
                href="/docs" 
                className="text-[#11253e] hover:text-[#f99d1c] transition-colors flex items-center gap-1.5 font-bold"
              >
                <span className="w-2 h-2 rounded-full bg-[#f99d1c] animate-pulse"></span>
                Embed &amp; Docs
              </Link>
              <a href="#faqs" className="hover:text-[#11253e] transition-colors">FAQs</a>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="hidden sm:inline-flex px-4 py-2 text-xs md:text-sm font-bold text-[#11253e] hover:bg-slate-100 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2 text-xs md:text-sm font-bold text-white bg-[#11253e] hover:bg-[#1c3b63] rounded-xl shadow-md shadow-[#11253e]/20 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-8 text-xs font-bold text-[#11253e] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f99d1c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f99d1c]"></span>
            </span>
            <span className="text-slate-500 font-medium">SahajCRM 2.0:</span>
            <span>Universal Embeddable Engine</span>
            <span className="text-[#f99d1c]">•</span>
            <Link href="/docs" className="text-[#f99d1c] hover:underline flex items-center gap-1 font-bold">
              View Specs <ArrowRight size={12} />
            </Link>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#11253e] tracking-tight leading-[1.12] max-w-5xl mx-auto mb-8">
            The Multi-Tenant CRM Engine for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#11253e] via-[#1c3b63] to-[#f99d1c]">
              Modern Enterprises.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-10">
            Centrally manage dozens of companies, websites, and lead streams from one pane of glass. 
            Integrate any frontend in seconds with a <strong>1-line universal embed tag</strong> — zero backend code required.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 font-black text-white bg-[#f99d1c] hover:bg-[#e08b17] rounded-2xl shadow-xl shadow-[#f99d1c]/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-2.5 text-base"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-8 py-4 font-bold text-[#11253e] bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-base"
            >
              <Code2 size={18} className="text-[#f99d1c]" />
              Explore Integration Docs
            </Link>
          </div>

          {/* 1-Line Snippet Quick Bar */}
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-lg shadow-slate-200/40 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 pl-3 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-mono font-bold text-slate-400 shrink-0">Quick Embed:</span>
              <code className="text-xs font-mono text-[#11253e] truncate">
                {heroSnippet}
              </code>
            </div>
            <button
              onClick={copyHeroSnippet}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#f99d1c] hover:text-white text-[#11253e] rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
            >
              {copiedHeroCode ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedHeroCode ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Hero Dashboard Interactive Showcase */}
          <div className="mt-16 max-w-6xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#11253e]/20 via-[#f99d1c]/30 to-[#11253e]/20 rounded-3xl blur-xl opacity-60"></div>
            
            <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden text-left">
              {/* Fake Browser Chrome */}
              <div className="h-11 px-5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-mono text-slate-400 ml-3">admin.sahajcrm.com/dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Socket Sync
                  </span>
                  <span className="hidden sm:inline">Tenant: <strong>Hutech Group</strong></span>
                </div>
              </div>

              {/* Showcase Grid */}
              <div className="p-6 md:p-8 bg-[#fafbfc] grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Mini Sidebar */}
                <div className="lg:col-span-3 space-y-4 hidden md:block">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Organization</p>
                    <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-[#11253e] text-white flex items-center justify-center font-bold text-xs">
                        H
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#11253e] truncate">Hutech Solutions</p>
                        <p className="text-[10px] text-slate-400">3 Websites Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Connected Apps</p>
                    {["hutechsolutions.in", "nabhira.com", "globalretail.store"].map((site) => (
                      <div key={site} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                        <span className="font-semibold text-slate-600 truncate">{site}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "Total Leads", val: "4,892", change: "+18.4%", icon: Users },
                      { label: "Active Apps", val: "14", change: "+2 this mo", icon: Globe },
                      { label: "Response SLA", val: "1.8 hrs", change: "-34%", icon: Zap },
                      { label: "Email Delivery", val: "99.9%", change: "Healthy", icon: Mail },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[11px] font-bold uppercase">{stat.label}</span>
                          <stat.icon size={14} className="text-[#f99d1c]" />
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-[#11253e]">{stat.val}</p>
                        <span className="text-[11px] font-bold text-emerald-600">{stat.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Simulated Live Leads Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#f99d1c]" />
                        <span className="text-xs font-bold text-[#11253e] uppercase tracking-wider">Live Inbound Leads</span>
                      </div>
                      <span className="text-xs text-slate-400">Real-time Origin Resolution</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {simulatedLeads.slice(0, 3).map((lead) => (
                        <div key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#11253e]/5 text-[#11253e] font-bold flex items-center justify-center shrink-0">
                              {lead.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-[#11253e]">{lead.name}</p>
                              <p className="text-slate-400 text-[11px]">{lead.email}</p>
                            </div>
                          </div>

                          <div className="hidden sm:block text-right">
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                              {lead.origin}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{lead.category}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {lead.status}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden md:inline">{lead.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Proof Metrics Bar */}
      <section className="py-12 border-y border-slate-200/80 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-5xl font-black text-[#11253e] tracking-tight">10M+</p>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Inquiries Processed</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-black text-[#f99d1c] tracking-tight">&lt; 2 min</p>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Setup / Embed Time</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-black text-[#11253e] tracking-tight">99.98%</p>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Uptime &amp; Delivery SLA</p>
            </div>
            <div>
              <p className="text-3xl md:text-5xl font-black text-[#11253e] tracking-tight">Zero</p>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Backend Code Needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold text-[#f99d1c] uppercase tracking-wider">Fast &amp; Frictionless</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#11253e] mt-2 mb-4 tracking-tight">
              Up and running in 3 simple steps
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              No SDK packages to compile, no complex API authorization exchanges. Just plug and play.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#11253e] text-white font-black text-xl flex items-center justify-center mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#11253e] mb-3">Onboard Your Organization</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Add your company name and register websites under it. Customize department notification emails and SMTP settings.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
                <Building2 size={16} className="text-[#f99d1c]" />
                <span>Assigns unique isolated tenant space</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#f99d1c] text-white font-black text-xl flex items-center justify-center mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#11253e] mb-3">Copy 1-Line Embed Snippet</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Paste the generated script tag right before the closing <code>&lt;/body&gt;</code> tag in your HTML, Next.js, WordPress, or Shopify site.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
                <Code2 size={16} className="text-[#f99d1c]" />
                <span>Zero-code automatic form detection &amp; wiring</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30 flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#11253e] text-white font-black text-xl flex items-center justify-center mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#11253e] mb-3">Stream Leads Automatically</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Inquiries immediately flow into your CRM with origin headers, automated thank-you emails, and team alerts dispatched.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
                <Inbox size={16} className="text-[#f99d1c]" />
                <span>Real-time dashboard + automated notifications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section ("Try It Live") */}
      <section id="simulator" className="py-24 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#f99d1c] uppercase tracking-wider flex items-center justify-center gap-1.5 mb-2">
              <Sparkles size={14} /> Interactive Live Sandbox
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#11253e] tracking-tight">
              Test Lead Capture in Action
            </h2>
            <p className="text-slate-500 text-base md:text-lg mt-3">
              Simulate submitting an inquiry from a connected website. Watch how SahajCRM captures, tags, and stores it in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Simulator */}
            <div className="lg:col-span-5 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Laptop size={18} className="text-[#f99d1c]" />
                  <span className="text-xs font-bold text-[#11253e] uppercase tracking-wider">Client Website Simulation</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Embed Active</span>
              </div>

              <form onSubmit={handleSimulateLead} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Originating Website
                  </label>
                  <select 
                    value={simWebsite} 
                    onChange={(e) => setSimWebsite(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c]"
                  >
                    <option value="nabhira.com">nabhira.com (Company: Nabhira Tech)</option>
                    <option value="hutechsolutions.in">hutechsolutions.in (Company: Hutech)</option>
                    <option value="globalretail.store">globalretail.store (Company: Global Retail)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Visitor Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={simName} 
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c]"
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Visitor Email *
                  </label>
                  <input 
                    type="email" 
                    value={simEmail} 
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c]"
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Inquiry Message
                  </label>
                  <textarea 
                    value={simMsg} 
                    onChange={(e) => setSimMsg(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#f99d1c] hover:bg-[#e08b17] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send size={14} />
                  <span>Simulate Form Submission</span>
                </button>

                {simSuccess && (
                  <p className="text-xs font-bold text-emerald-600 text-center animate-in fade-in">
                    ✅ Lead received! Check the CRM table on the right.
                  </p>
                )}
              </form>
            </div>

            {/* Simulated Live Inbox */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Inbox size={18} className="text-[#11253e]" />
                  <span className="text-xs font-bold text-[#11253e] uppercase tracking-wider">SahajCRM Inbound Queue</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Listener
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {simulatedLeads.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#11253e]/5 text-[#11253e] flex items-center justify-center font-bold text-xs">
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#11253e]">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.email}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        {item.origin}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.category}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-orange-50 text-[#f99d1c] border border-orange-200">
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Grid Core Features Section */}
      <section id="features" className="py-24 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold text-[#f99d1c] uppercase tracking-wider">Enterprise Architecture</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#11253e] mt-2 mb-4 tracking-tight">
              Engineered for Complete Scale
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Designed from the ground up for agencies, conglomerates, and platforms managing multiple digital properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1 (Large) */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#11253e] flex items-center justify-center mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#11253e] mb-3">Multi-Tenant Organization Hierarchy</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Maintain full company isolation while managing everything through a master cockpit. 
                  Every company can own multiple websites, independent team members, and customized notification addresses.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">🏢 Granular Company Partitioning</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">🔒 Tenant Data Isolation</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">🌐 Unlimited Websites per Org</span>
              </div>
            </div>

            {/* Bento 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f99d1c] flex items-center justify-center mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#11253e] mb-3">Department-Level SMTP Routing</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Route sales alerts to sales@, career applications to hr@, and inquiries through custom SMTP mailboxes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Supports custom SSL/TLS credentials</span>
              </div>
            </div>

            {/* Bento 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#11253e] mb-3">Bank-Grade RBAC &amp; MFA</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Superadmin, Company Admin, Editor, and Viewer permission tiers. Integrated TOTP authenticator and OTP security.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Enforced 2FA &amp; auto-provisioning</span>
              </div>
            </div>

            {/* Bento 4 (Large) */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#11253e] mb-3">Resume &amp; Document S3 Pipeline</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Job applications automatically stream candidate resumes (.pdf, .doc) directly into secured AWS S3 buckets. 
                  HR teams can download candidate resumes and track applicants directly from the CRM portal.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">☁️ Automated AWS S3 Sync</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">📑 Brochure Downloads</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">🛡️ Virus &amp; Extension Validation</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Embed Code & Integration Guide */}
      <LandingIntegrationGuide />

      {/* FAQs Section */}
      <section id="faqs" className="py-24 bg-white border-t border-slate-200/80 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#f99d1c] uppercase tracking-wider">Got Questions?</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#11253e] mt-2 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-2">
              Everything you need to know about the product and installation.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={faq.q}
                className="bg-slate-50 rounded-2xl border border-slate-200/70 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm md:text-base text-[#11253e] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? "rotate-180 text-[#f99d1c]" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-200/40 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400">
              Need technical support or custom enterprise integrations?{" "}
              <Link href="/docs" className="text-[#f99d1c] font-bold hover:underline">
                Read the Developer Documentation
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 bg-[#11253e] text-white relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#f99d1c]/25 via-transparent to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-900/30 to-transparent blur-3xl rounded-full" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-[#f99d1c]" /> Instant Provisioning
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Ready to streamline your enterprise CRM?
          </h2>
          
          <p className="text-base md:text-lg text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create an organization, connect your websites, and start collecting high-intent inquiries in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-9 py-4 font-black text-[#11253e] text-base bg-[#f99d1c] hover:bg-[#e08b17] rounded-2xl shadow-xl shadow-[#f99d1c]/20 transition-all hover:-translate-y-1"
            >
              Create Your Portal Now
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-9 py-4 font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all"
            >
              Read Docs &amp; Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#11253e] rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
              S
            </div>
            <span className="text-lg font-black text-[#11253e] tracking-tight">
              SahajCRM<span className="text-[#f99d1c]">.</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 SahajCRM Platform. Engineered for enterprise lead operations.
          </p>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <Link href="/" className="hover:text-[#11253e]">Home</Link>
            <Link href="/docs" className="hover:text-[#11253e]">Documentation</Link>
            <Link href="/login" className="hover:text-[#11253e]">Sign In</Link>
            <Link href="/register" className="hover:text-[#11253e]">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
