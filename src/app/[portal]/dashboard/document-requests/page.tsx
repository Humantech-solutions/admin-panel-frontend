"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, FileText, Calendar, Mail, User, Phone, Download } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export default function DocumentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-[11px] font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Requested Document</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#f99d1c] animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Loading document requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No document requests found.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#11253e] flex items-center gap-2">
                        <User size={14} className="text-gray-400" /> {item.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Mail size={14} className="text-gray-400" /> {item.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs">
                        <FileText size={12} />
                        {item.documentName || 'Brochure'}
                      </span>
                      {item.websiteId && (
                        <div className="text-xs text-gray-500 mt-2">
                          Portal: <span className="font-medium text-gray-700">{item.websiteId.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.phone ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="text-gray-400" /> {item.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(item.createdAt || item.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 ml-6 mt-0.5">
                        {new Date(item.createdAt || item.requestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.document && (
                        <a 
                          href={item.document} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f99d1c]/10 text-[#f99d1c] hover:bg-[#f99d1c] hover:text-white rounded-lg transition-colors text-xs font-semibold"
                        >
                          <Download size={14} /> View File
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
