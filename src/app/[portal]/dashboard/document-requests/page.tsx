"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, FileText, Calendar, Mail, User, Phone, Download, Eye, X, MessageSquare, Clock, Globe, ExternalLink, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export default function DocumentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/documents/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching document requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">
            Document Requests
          </h1>
          <p className="text-gray-500 mt-1">
            View all document download requests across your websites.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Document</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Loading document requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No document requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* INQUIRY / User Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{item.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">{item.email}</span>
                        {item.phone && <span className="text-[11px] text-gray-400 font-medium">{item.phone}</span>}
                      </div>
                    </td>

                    {/* SOURCE CONTEXT / Requested Document */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-xs text-[#11253e] font-bold truncate transition-all" title={item.documentName}>
                          {item.documentName || "Brochure"}
                        </span>
                        {item.websiteId && (
                          <span className="text-[10px] text-gray-400 font-mono truncate hover:text-[#f99d1c] transition-colors" title={item.websiteId.name}>
                            {item.websiteId.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold tracking-wider uppercase">
                        Document
                      </span>
                    </td>

                    {/* STATUS / Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#11253e]">
                          {new Date(item.createdAt || item.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(item.createdAt || item.requestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => setSelectedRequest(item)}
                          className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} className="text-[#f99d1c]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">Document Request Details</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Company: {selectedRequest.companyId?.name || "General"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
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
                      <p className="text-[#11253e] font-bold text-sm">{selectedRequest.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                      <p className="text-[#11253e] font-medium text-sm">{selectedRequest.email}</p>
                    </div>
                  </div>

                  {selectedRequest.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Phone size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                        <p className="text-[#11253e] font-medium text-sm">{selectedRequest.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Received At</p>
                      <p className="text-[#11253e] font-medium text-sm">{new Date(selectedRequest.createdAt || selectedRequest.requestedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Message Content */}
              <div className="md:col-span-7 bg-[#11253e] text-white rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FileText size={80} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Requested Document</h4>
                    <p className="text-xl font-bold tracking-tight">{selectedRequest.documentName || "Brochure"}</p>
                  </div>
                  
                  {selectedRequest.websiteId && (
                    <div>
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Source Website</h4>
                      <p className="text-white/80 font-medium text-sm">
                        {selectedRequest.websiteId.name}
                      </p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/10">
                    {selectedRequest.document ? (
                      <a 
                        href={selectedRequest.document} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#f99d1c] hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#f99d1c]/20"
                      >
                        <Download size={18} />
                        View / Download Document
                      </a>
                    ) : (
                      <p className="text-white/50 italic text-sm">No document link available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
