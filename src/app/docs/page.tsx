"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Copy,
  Check,
  Layers,
  Sparkles,
  Terminal,
  CheckCircle2,
  Mail,
  Briefcase,
  Send,
  FileCheck,
  ShieldCheck,
  Zap,
} from "lucide-react";

type PlatformKey = "html" | "wordpress" | "nextjs" | "shopify" | "webflow";

function parseWebsiteInput(raw: string): string {
  const val = raw.trim();
  if (!val) return "";

  // Strip protocol and www
  let clean = val.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  // Strip paths, query strings, hashes
  clean = clean.split("/")[0].split("?")[0].split("#")[0];

  // If it's a domain with a dot, e.g. "sahajdesign.com" or "sahajdesign.co.in"
  if (clean.includes(".")) {
    const parts = clean.split(".");
    if (parts.length === 2) {
      return parts[0].toLowerCase().replace(/[^a-z0-9-]/g, "");
    } else if (parts.length > 2) {
      if (["co", "com", "org", "net", "gov"].includes(parts[parts.length - 2])) {
        return parts[parts.length - 3]?.toLowerCase().replace(/[^a-z0-9-]/g, "") || parts[0];
      }
      return parts[parts.length - 2]?.toLowerCase().replace(/[^a-z0-9-]/g, "") || parts[0];
    }
  }

  // If it's a slug or brand name like "Sahaj Design" or "sahaj-design"
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function DocsPage() {
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("html");

  // Read ?slug= from URL if opened from dashboard/onboarding modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const slugParam = params.get("slug");
      if (slugParam) {
        setInputValue(slugParam.trim());
      }
    }
  }, []);

  const scriptUrl = "https://apis.admin.hutechsolutions.in/crm-embed.js";
  const parsedSlug = parseWebsiteInput(inputValue);
  const displaySlug = parsedSlug || "YOUR_WEBSITE_SLUG";
  const standardSnippet = `<script \n  src="${scriptUrl}" \n  data-website="${displaySlug}" \n  async>\n</script>`;

  const copyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#f99d1c] selection:text-white">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#11253e] to-[#1e3c63] rounded-xl flex items-center justify-center shadow-lg shadow-[#11253e]/20">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-black text-[#11253e] tracking-tight">
              SahajCRM<span className="text-[#f99d1c]">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-gray-500">
            <Link href="/#features" className="hover:text-[#11253e] transition-colors">
              Features
            </Link>
            <Link
              href="/docs"
              className="text-[#11253e] font-bold flex items-center gap-1.5 border-b-2 border-[#f99d1c] pb-0.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#f99d1c]"></span>
              Embed &amp; Docs
            </Link>
            <Link href="/#simulator" className="hover:text-[#11253e] transition-colors">
              Live Demo
            </Link>
            <Link href="/#faqs" className="hover:text-[#11253e] transition-colors">
              FAQs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex px-5 py-2.5 font-bold text-[#11253e] hover:bg-gray-50 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 font-bold text-white bg-[#11253e] hover:bg-[#1e3c63] rounded-xl shadow-lg shadow-[#11253e]/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative pt-32 pb-14 lg:pt-40 lg:pb-16 overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#f99d1c]/10 to-transparent blur-3xl -z-10 rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[#f99d1c] font-bold text-xs uppercase tracking-wider mb-6">
            <Sparkles size={13} />
            Universal Zero-Code Form Engine
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#11253e] tracking-tight leading-[1.15] mb-6">
            Automatically Connect All Existing Website Forms <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#11253e] to-[#f99d1c]">
              With 1 Line of Code
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed mb-8">
            Add a single script tag before the closing <code className="text-[#11253e] font-bold">&lt;/body&gt;</code> tag of your website.
            The script scans your entire website and automatically wires your <strong>existing</strong> contact forms, job applications, newsletter boxes, and quote forms to SahajCRM.
            <br className="hidden sm:block" />
            <span className="text-[#11253e] font-bold">No new forms created. No floating buttons injected. Zero changes to your existing HTML.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#embed-snippet"
              className="px-6 py-3 font-bold text-white bg-[#f99d1c] hover:bg-[#e08b17] rounded-xl shadow-lg shadow-[#f99d1c]/20 transition-all hover:-translate-y-0.5"
            >
              View 1-Line Embed Snippet
            </a>
            <a
              href="#auto-detected-forms"
              className="px-6 py-3 font-bold text-[#11253e] bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
            >
              <Zap size={16} className="text-[#f99d1c]" />
              <span>See How Auto-Detection Works</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Documentation Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* 1. Universal Embed Snippet Quickstart */}
        <section id="embed-snippet" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f99d1c] uppercase tracking-wider mb-2">
            <Code2 size={16} />
            The 1-Line Universal Script
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11253e] mb-2">
            Add to Any Website Template
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-3xl">
            Each company and website in your CRM receives a unique <code className="font-bold text-[#11253e]">data-website</code> slug.
            Paste this snippet right before the closing <code className="font-bold text-[#11253e]">&lt;/body&gt;</code> tag. It runs silently in the background, listening to form submissions and syncing leads to your CRM dashboard.
          </p>

          {/* Slug Personalization Helper */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#11253e] uppercase tracking-wider">
                Personalize Code Snippets
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Paste your website URL (e.g. <code className="text-[#11253e] font-semibold">https://www.sahajdesign.com</code>) or slug:
              </p>
              {parsedSlug && (
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="font-semibold text-slate-400">Assigned CRM Slug:</span>
                  <span className="font-mono font-bold text-[#f99d1c] bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                    data-website=&quot;{displaySlug}&quot;
                  </span>
                </div>
              )}
            </div>
            <div className="w-full md:w-80">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. https://www.sahajdesign.com or sahajdesign"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Snippet Code Box */}
          <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e293b] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">crm-embed.html</span>
              </div>
              <button
                onClick={() => copyCode(standardSnippet)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f99d1c] hover:bg-[#e08b17] text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Snippet"}</span>
              </button>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm text-[#38bdf8] overflow-x-auto leading-relaxed select-all">
              <pre className="whitespace-pre-wrap break-words">{standardSnippet}</pre>
            </div>
          </div>

          {/* Quick Checklist */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span><strong>Zero new UI injected:</strong> No floating buttons or popups</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span><strong>Auto-scans existing forms:</strong> Contact, careers, newsletter, quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span><strong>Context capture:</strong> Page URL, title, and referrer tracked automatically</span>
            </div>
          </div>
        </section>

        {/* 2. How Auto-Detection Works */}
        <section id="auto-detected-forms" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f99d1c] uppercase tracking-wider mb-2">
            <ShieldCheck size={16} />
            Smart Form Recognition
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11253e] mb-2">
            How Existing Forms Are Automatically Routed
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-3xl">
            When you add the 1-line script, it inspects every <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">&lt;form&gt;</code> on your site and automatically routes its submission to the matching CRM endpoint. You don&apos;t need to rename fields or rewrite code.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Form */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-base">Contact &amp; Inquiry Forms</h3>
                  <p className="text-xs text-gray-500">Wired to <code className="text-[#11253e] font-mono">/api/contact/submit</code></p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Forms containing inputs for name, email, phone, and a message/textarea are automatically treated as inquiries. The script captures field values and dispatches email notifications to your sales/admin team.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Auto-detected: Inputs matching name, email, phone, message
              </div>
            </div>

            {/* Careers Form */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-base">Career &amp; Job Applications</h3>
                  <p className="text-xs text-gray-500">Wired to <code className="text-[#11253e] font-mono">/api/career/apply</code></p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Any form containing a file upload field (<code className="bg-white px-1 py-0.5 rounded text-xs">&lt;input type=&quot;file&quot;&gt;</code>) or words like career, apply, or job is submitted as a job application with resume file upload.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Auto-detected: File upload (resume/CV) + applicant info
              </div>
            </div>

            {/* Newsletter Form */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-base">Newsletter &amp; Subscriptions</h3>
                  <p className="text-xs text-gray-500">Wired to <code className="text-[#11253e] font-mono">/api/subscriptions/subscribe</code></p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Single-field email forms (like &quot;Subscribe to our newsletter&quot; in website footers or popups) are automatically recognized and added to your CRM subscriber lists.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Auto-detected: 1-2 input forms focused on email
              </div>
            </div>

            {/* Sales & Quotes */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f99d1c] flex items-center justify-center font-bold">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#11253e] text-base">Sales &amp; Quotation Requests</h3>
                  <p className="text-xs text-gray-500">Wired to <code className="text-[#11253e] font-mono">/api/sales/brochure</code></p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Forms designed for requesting quotes, pricing brochures, product demos, or proposals are captured and sent to the sales department.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Auto-detected: Forms referencing quotes, sales, or demos
              </div>
            </div>

          </div>

          {/* Safety Rule */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <span className="font-bold shrink-0">🛡️ Safe by Design:</span>
            <span>
              The script automatically ignores login forms, password reset fields, and search bars (<code className="bg-white/80 px-1 py-0.5 rounded">input[type=&quot;password&quot;]</code> and <code className="bg-white/80 px-1 py-0.5 rounded">role=&quot;search&quot;</code>). It will only sync legitimate lead capture forms.
            </span>
          </div>
        </section>

        {/* 3. Platform Installation Guides */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f99d1c] uppercase tracking-wider mb-2">
            <Layers size={16} />
            Installation by Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11253e] mb-2">
            Where to Paste the Script
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Choose your website technology below to see exactly where to insert the 1-line script tag. All forms on your site will automatically connect:
          </p>

          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
            {[
              { id: "html", label: "Plain HTML / Static" },
              { id: "wordpress", label: "WordPress" },
              { id: "nextjs", label: "Next.js & React" },
              { id: "shopify", label: "Shopify" },
              { id: "webflow", label: "Webflow" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id as PlatformKey)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activePlatform === p.id
                    ? "bg-[#11253e] text-white shadow-lg shadow-[#11253e]/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Tab: HTML */}
          {activePlatform === "html" && (
            <div className="space-y-4 text-sm text-gray-600">
              <h3 className="text-lg font-bold text-[#11253e]">Static HTML Setup:</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Open your root <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">index.html</code> or global template file.</li>
                <li>Paste the script snippet immediately before the closing <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">&lt;/body&gt;</code> tag:</li>
              </ol>

              <div className="bg-[#0f172a] text-[#38bdf8] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`  <!-- SahajCRM Universal Form Engine -->
  <script src="${scriptUrl}" data-website="${displaySlug}" async></script>
</body>
</html>`}</pre>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Save and refresh your site. All contact, career, and newsletter forms will now automatically submit into SahajCRM.
              </p>
            </div>
          )}

          {/* Tab: WordPress */}
          {activePlatform === "wordpress" && (
            <div className="space-y-4 text-sm text-gray-600">
              <h3 className="text-lg font-bold text-[#11253e]">WordPress Setup:</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Log in to your WordPress Admin dashboard.</li>
                <li>Go to <strong>Plugins &gt; Add New</strong> and install the <strong>WPCode</strong> plugin (or any &quot;Insert Headers and Footers&quot; plugin).</li>
                <li>Go to <strong>Code Snippets &gt; Header &amp; Footer</strong> in the left sidebar.</li>
                <li>Paste your embed snippet into the <strong>Footer</strong> box:</li>
              </ol>

              <div className="bg-[#0f172a] text-[#38bdf8] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`<script src="${scriptUrl}" data-website="${displaySlug}" async></script>`}</pre>
              </div>

              <p className="text-xs text-gray-500">
                Click <strong>Save Changes</strong>. All forms created with Contact Form 7, WPForms, Elementor, or custom themes will now auto-sync with your CRM.
              </p>
            </div>
          )}

          {/* Tab: Next.js */}
          {activePlatform === "nextjs" && (
            <div className="space-y-4 text-sm text-gray-600">
              <h3 className="text-lg font-bold text-[#11253e]">Next.js (App Router) Setup:</h3>
              <p>In your root <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">app/layout.tsx</code> or <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">app/layout.jsx</code>, import and render Next.js <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">Script</code>:</p>
              
              <div className="bg-[#0f172a] text-[#38bdf8] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${scriptUrl}"
          data-website="${displaySlug}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}</pre>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                The script includes an automatic MutationObserver, so even dynamically rendered client components and popup modal forms are intercepted seamlessly.
              </p>
            </div>
          )}

          {/* Tab: Shopify */}
          {activePlatform === "shopify" && (
            <div className="space-y-4 text-sm text-gray-600">
              <h3 className="text-lg font-bold text-[#11253e]">Shopify Store Setup:</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>In your Shopify Admin, navigate to <strong>Online Store &gt; Themes</strong>.</li>
                <li>Click the <strong>&quot;...&quot;</strong> icon next to your active theme and click <strong>Edit code</strong>.</li>
                <li>Under the <strong>Layout</strong> directory, open <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">theme.liquid</code>.</li>
                <li>Scroll down to the bottom, paste the snippet right before <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">&lt;/body&gt;</code>, and click <strong>Save</strong>:</li>
              </ol>

              <div className="bg-[#0f172a] text-[#38bdf8] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`<script src="${scriptUrl}" data-website="${displaySlug}" async></script>`}</pre>
              </div>
            </div>
          )}

          {/* Tab: Webflow */}
          {activePlatform === "webflow" && (
            <div className="space-y-4 text-sm text-gray-600">
              <h3 className="text-lg font-bold text-[#11253e]">Webflow Setup:</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Open your Webflow Project Settings.</li>
                <li>Navigate to the <strong>Custom Code</strong> tab.</li>
                <li>Paste the script snippet in the <strong>Footer Code</strong> box:</li>
              </ol>

              <div className="bg-[#0f172a] text-[#38bdf8] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`<script src="${scriptUrl}" data-website="${displaySlug}" async></script>`}</pre>
              </div>

              <p className="text-xs text-gray-500">
                Publish your Webflow site. All Webflow contact and newsletter forms will now route to your CRM.
              </p>
            </div>
          )}
        </section>

        {/* 4. Direct API Access */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f99d1c] uppercase tracking-wider mb-2">
            <Terminal size={16} />
            Direct API Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#11253e] mb-2">
            Programmatic REST Endpoints
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            For developers who prefer writing custom fetch, Axios, or backend HTTP requests without using the script tag:
          </p>

          <div className="space-y-4">
            {[
              {
                method: "POST",
                path: "https://apis.admin.hutechsolutions.in/api/contact/submit",
                desc: "Submits general inquiries with automatic tenant resolution & departmental email alerts.",
                payload: "{ name, email, phone, subject, message, websiteSlug }",
              },
              {
                method: "POST",
                path: "https://apis.admin.hutechsolutions.in/api/career/apply",
                desc: "Accepts job applications with resume file upload (PDF/DOC) sent via multipart/form-data.",
                payload: "FormData: { name, email, phone, resume, websiteSlug, pageTitle, pageUrl }",
              },
              {
                method: "POST",
                path: "https://apis.admin.hutechsolutions.in/api/subscriptions/subscribe",
                desc: "Registers newsletter subscribers with automatic verification and welcome email.",
                payload: "{ email, websiteSlug }",
              },
              {
                method: "POST",
                path: "https://apis.admin.hutechsolutions.in/api/sales/brochure",
                desc: "Submits requests for sales brochures, quotes, and pricing proposals.",
                payload: "{ name, email, phone, companyName, websiteSlug }",
              },
            ].map((ep) => (
              <div key={ep.path} className="p-4 rounded-2xl bg-slate-50 border border-gray-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#11253e] text-white font-mono text-xs font-bold">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#11253e] break-all">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{ep.desc}</p>
                </div>
                <div className="font-mono text-[11px] text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 max-w-md overflow-x-auto shrink-0">
                  {ep.payload}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#11253e] tracking-tight">
              SahajCRM<span className="text-[#f99d1c]">.</span>
            </span>
          </div>
          <p className="text-gray-400 font-medium text-sm">
            Copyright 2026 SahajCRM. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <Link href="/" className="hover:text-[#11253e]">Home</Link>
            <Link href="/docs" className="hover:text-[#11253e]">Documentation</Link>
            <Link href="/login" className="hover:text-[#11253e]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
