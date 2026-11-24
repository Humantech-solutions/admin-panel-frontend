"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, X, ExternalLink } from "lucide-react";

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteName?: string;
  websiteSlug: string;
  isOrgCreation?: boolean;
}

export default function EmbedCodeModal({
  isOpen,
  onClose,
  websiteName,
  websiteSlug,
}: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptUrl = "https://apis.admin.hutechsolutions.in/crm-embed.js";
  const embedCode = `<script src="${scriptUrl}" data-website="${websiteSlug}" async></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#11253e]">
              Website Integration Code
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {websiteName ? `${websiteName} (${websiteSlug})` : `Website slug: ${websiteSlug}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-3 space-y-4 text-xs text-gray-600">
          <p className="leading-relaxed">
            Paste this script immediately before the closing <code className="bg-gray-100 text-[#11253e] px-1.5 py-0.5 rounded font-mono">&lt;/body&gt;</code> tag of your website. It automatically connects all existing forms (Contact, Careers, Quotes) without modifying your design.
          </p>

          {/* Simple Code Box */}
          <div className="bg-[#0f172a] rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-gray-400">Embed Snippet</span>
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f99d1c] hover:bg-[#e08b17] text-white text-xs font-semibold rounded-md transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-sky-300 whitespace-pre-wrap break-words leading-relaxed select-all">
              {embedCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-2">
          <Link
            href={`/docs?slug=${encodeURIComponent(websiteSlug || "")}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#f99d1c] transition-colors"
          >
            <span>Platform guides (WordPress, Next.js)</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#11253e] hover:bg-[#1c3b63] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
