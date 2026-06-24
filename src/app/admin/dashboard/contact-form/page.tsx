"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import {
  MessageSquare,
  Mail,
  User,
  Globe,
  ExternalLink,
  Eye,
  Search,
  Calendar,
  X,
  Clock,
  Tag,
  CheckCircle2
} from "lucide-react";

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  pageTitle: string;
  pageUrl: string;
  category: string;
  status: string;
  submittedAt: string;
}

function ContactDashboardContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const projectFilter = searchParams.get('project') || 'nabhira';

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (projectFilter) params.append('project', projectFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      const url = `${API_BASE_URL}/api/contact/all?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [categoryFilter, projectFilter]);

  const filteredInquiries = inquiries.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      await fetch(`${API_BASE_URL}/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchInquiries();
      if (selectedInquiry?._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            {projectFilter.charAt(0).toUpperCase() + projectFilter.slice(1)} - {categoryFilter ? `${categoryFilter} Inquiries` : "All Contact Inquiries"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing {filteredInquiries.length} results {categoryFilter && `for ${categoryFilter}`}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Context</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading inquiries...</td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{item.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">{item.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-xs text-[#11253e] font-bold truncate transition-all" title={item.pageTitle}>
                          {item.pageTitle || "Quick Contact"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate hover:text-[#f99d1c] transition-colors" title={item.pageUrl}>
                          {item.pageUrl ? new URL(item.pageUrl).pathname : "No URL Captured"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                        ${item.category === 'Contact' ? 'bg-indigo-50 text-indigo-600' :
                          item.category === 'Client' ? 'bg-purple-50 text-purple-600' :
                            item.category === 'Footer' ? 'bg-teal-50 text-teal-600' :
                              'bg-gray-100 text-gray-600'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                          ${item.status === 'New' ? 'bg-orange-50 text-orange-600' :
                          item.status === 'Contacted' ? 'bg-blue-50 text-blue-600' :
                            'bg-green-50 text-green-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInquiry(item)}
                        className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                        <MessageSquare className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No inquiries found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">Inquiry Details</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Category: {selectedInquiry.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#11253e]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Left Column: Client Info */}
              <div className="md:col-span-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                      <p className="text-[#11253e] font-bold text-sm">{selectedInquiry.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                      <p className="text-[#11253e] font-medium text-sm">{selectedInquiry.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Received At</p>
                      <p className="text-[#11253e] font-medium text-sm">{new Date(selectedInquiry.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={12} /> Source Page
                    </p>
                    <p className="text-[#11253e] font-bold text-[11px] leading-snug">{selectedInquiry.pageTitle || "Quick Contact"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source URL</p>
                    <a
                      href={selectedInquiry.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f99d1c] text-[10px] break-all font-mono hover:underline flex items-center gap-1"
                    >
                      View Source <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Action Status</p>
                  <div className="flex gap-2">
                    {['New', 'Contacted', 'Closed'].map(st => (
                      <button
                        key={st}
                        onClick={() => updateStatus(selectedInquiry._id, st)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all
                            ${selectedInquiry.status === st
                            ? 'bg-[#11253e] text-white border-[#11253e]'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-[#f99d1c] hover:text-[#f99d1c]'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Message Content */}
              <div className="md:col-span-7 bg-[#11253e] text-white rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageSquare size={80} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Subject</h4>
                    <p className="text-lg font-bold tracking-tight">{selectedInquiry.subject}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Inquiry Message</h4>
                    <p className="text-white/80 font-light leading-relaxed text-sm whitespace-pre-wrap italic">
                      "{selectedInquiry.message}"
                    </p>
                  </div>

                  {selectedInquiry.status === 'Closed' && (
                    <div className="flex items-center gap-2 text-[#f99d1c] pt-4">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Inquiry Handled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Dashboard...</div>}>
      <ContactDashboardContent />
    </Suspense>
  )
}
