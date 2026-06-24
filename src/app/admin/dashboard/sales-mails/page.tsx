"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  Mail, 
  User, 
  Globe, 
  ExternalLink, 
  Search, 
  Calendar,
  X,
  FileText,
  Download,
  Filter,
  Eye,
  Clock
} from "lucide-react";

interface SalesMail {
  _id: string;
  name: string;
  email: string;
  pageTitle: string;
  pageUrl: string;
  requestedAt: string;
}

export default function SalesMailsPage() {
  const [mails, setMails] = useState<SalesMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMail, setSelectedMail] = useState<SalesMail | null>(null);

  const fetchMails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/all`);
      const data = await response.json();
      if (data.success) {
        setMails(data.mails);
      }
    } catch (error) {
      console.error("Error fetching sales mails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  const filteredMails = mails.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">Sales Mails (Brochures)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tracking {filteredMails.length} brochure requests from solutions pages.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Requested From</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#f99d1c] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Fetching sales logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMails.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <Mail size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No brochure requests found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredMails.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f99d1c]/10 flex items-center justify-center text-[#f99d1c]">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[#11253e] text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-[#f99d1c] bg-[#f99d1c]/10 px-2 py-0.5 rounded-full w-fit">
                          {item.pageTitle}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Globe size={10} />
                          <span className="truncate max-w-[150px]">{item.pageUrl}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-[#11253e] font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(item.requestedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={12} />
                          {new Date(item.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedMail(item)}
                        className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#11253e]/80 blur-sm" onClick={() => setSelectedMail(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#11253e]">Interaction Details</h3>
              <button onClick={() => setSelectedMail(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visitor Name</p>
                  <p className="text-sm font-medium text-[#11253e]">{selectedMail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-medium text-[#11253e]">{selectedMail.email}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Section</p>
                  <p className="text-sm font-medium text-[#f99d1c]">{selectedMail.pageTitle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Referral URL</p>
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.open(selectedMail.pageUrl, '_blank')}>
                    <p className="text-sm font-medium text-[#11253e] truncate flex-1">{selectedMail.pageUrl}</p>
                    <ExternalLink size={14} className="text-[#f99d1c] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#f99d1c]/5 rounded-xl border border-[#f99d1c]/10">
                <FileText className="text-[#f99d1c]" size={20} />
                <div>
                  <p className="text-xs font-bold text-[#11253e]">Solution Brochure Requested</p>
                  <p className="text-[10px] text-gray-500">Automated email with PDF link was triggered.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
