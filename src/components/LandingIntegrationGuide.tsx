"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type PlatformId = "html" | "wordpress" | "nextjs" | "forms";

const platforms: { id: PlatformId; label: string }[] = [
  { id: "html", label: "Plain HTML / Static" },
  { id: "wordpress", label: "WordPress" },
  { id: "nextjs", label: "Next.js & React" },
  { id: "forms", label: "Existing Form Interceptor" },
];

function parseWebsiteInput(raw: string): string {
  const val = raw.trim();
  if (!val) return "";
  let clean = val.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  clean = clean.split("/")[0].split("?")[0].split("#")[0];
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
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function LandingIntegrationGuide() {
  const [websiteSlug, setWebsiteSlug] = useState("my-website");
  const activeSlug = parseWebsiteInput(websiteSlug) || "my-website";
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformId>("html");

  const scriptUrl = "https://apis.admin.hutechsolutions.in/crm-embed.js";
  const snippet = `<script \n  src="${scriptUrl}" \n  data-website="${activeSlug}" \n  async>\n</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integration-docs" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[#f99d1c] font-bold text-xs uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            Universal Embed Code
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#11253e] mb-6 tracking-tight">
            Implement in Any Website <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#11253e] to-[#f99d1c]">
              Without Any Code Change
            </span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            When you onboard a new organization or app in SahajCRM, you are provided with a 1-line embed snippet.
            Simply add that line to your website&apos;s template, and the CRM works automatically.
          </p>
        </div>

        {/* Generator & Code Box */}
        <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xl shadow-gray-200/40 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-[#11253e] uppercase tracking-wider block mb-1">
                Your Website Slug (Assigned During Onboarding)
              </label>
              <p className="text-xs text-gray-400">Type any slug to see your customized embed code.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={websiteSlug}
                onChange={(e) => setWebsiteSlug(e.target.value)}
                placeholder="e.g. https://www.example.com or example"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#11253e] focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 transition-all"
              />
            </div>
          </div>

          <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#1e293b] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">crm-embed.html</span>
              </div>
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f99d1c] hover:bg-[#e08b17] text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="p-6 font-mono text-xs md:text-sm text-[#38bdf8] overflow-x-auto leading-relaxed select-all">
              <pre className="whitespace-pre-wrap break-words">{snippet}</pre>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-600" />
              <span>Zero new UI injected: automatically wires all existing website forms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-600" />
              <span>Automatically captures source page URL, title &amp; metadata</span>
            </div>
          </div>
        </div>

        {/* Installation Instructions by Platform */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-[#11253e] uppercase tracking-wider mb-6">
            <Layers size={16} className="text-[#f99d1c]" />
            Step-by-Step Platform Guides
          </div>

          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-3">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${activePlatform === p.id
                  ? "bg-[#11253e] text-white shadow-md shadow-[#11253e]/20"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* HTML Tab */}
          {activePlatform === "html" && (
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-gray-200/70 space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base font-bold text-[#11253e]">For HTML, Shopify, Webflow, or Wix:</h4>
              <ol className="space-y-3 text-sm text-gray-600 list-decimal pl-5">
                <li>
                  Open your root HTML template (e.g. <code>index.html</code>, or <code>theme.liquid</code> in Shopify).
                </li>
                <li>
                  Paste the generated <code>&lt;script&gt;</code> code snippet right before the closing <code>&lt;/body&gt;</code> tag.
                </li>
                <li>
                  Save and deploy. The script will automatically scan and wire all existing forms across your website!
                </li>
              </ol>
            </div>
          )}

          {/* WordPress Tab */}
          {activePlatform === "wordpress" && (
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-gray-200/70 space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base font-bold text-[#11253e]">For WordPress Sites:</h4>
              <ol className="space-y-3 text-sm text-gray-600 list-decimal pl-5">
                <li>
                  In your WordPress admin dashboard, install a plugin like <strong>WPCode</strong> (or any &quot;Insert Headers and Footers&quot; plugin).
                </li>
                <li>
                  Go to <strong>Code Snippets &gt; Header &amp; Footer</strong> in the sidebar.
                </li>
                <li>
                  Paste the embed code into the <strong>Footer</strong> box and click <strong>Save Changes</strong>.
                </li>
              </ol>
            </div>
          )}

          {/* Next.js Tab */}
          {activePlatform === "nextjs" && (
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-gray-200/70 space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base font-bold text-[#11253e]">For Next.js (App Router):</h4>
              <p className="text-sm text-gray-600">
                In your <code>app/layout.tsx</code> or <code>app/layout.jsx</code>, add the Next.js <code>Script</code> component:
              </p>
              <div className="bg-[#0f172a] text-[#38bdf8] p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${scriptUrl}"
          data-website="${websiteSlug || "my-website"}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}</pre>
              </div>
            </div>
          )}

          {/* Form Interceptor Tab */}
          {activePlatform === "forms" && (
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-gray-200/70 space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base font-bold text-[#11253e]">Zero-Code Existing Form Interception:</h4>
              <p className="text-sm text-gray-600">
                The embed script automatically scans and intercepts all existing forms on your website (Contact Us, Careers / Job Applications with resume upload, Newsletter boxes, and Sales Quote forms). <strong>No HTML changes required!</strong>
              </p>
              <p className="text-xs text-gray-500">
                (Optional) If you have a custom form where you want to explicitly enforce the category, you can optionally include <code>data-crm=&quot;contact|career|newsletter|quote&quot;</code>:
              </p>
              <div className="bg-[#0f172a] text-[#38bdf8] p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`<!-- Any existing form automatically works without adding or modifying classes/attributes -->
<form>
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Email Address" required />
  <input type="tel" name="phone" placeholder="Phone Number" />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send Message</button>
</form>`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Link to Full Documentation Portal */}
        <div className="mt-16 text-center">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#11253e] hover:bg-[#1c3b63] text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#11253e]/20 transition-all hover:-translate-y-0.5"
          >
            <span>Open Interactive API &amp; Embed Documentation Portal</span>
            <ExternalLink size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
