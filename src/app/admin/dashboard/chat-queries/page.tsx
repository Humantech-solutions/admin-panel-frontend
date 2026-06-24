"use client";

import { useEffect, useState } from "react";
import { MessageCircle, User, Globe, Search, Calendar, Clock, X, Phone, Mail } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface ChatQuery {
  _id: string;
  email: string;
  phone?: string;
  query: string;
  pageUrl: string;
  submittedAt: string;
}

export default function ChatQueriesPage() {
  const [queries, setQueries] = useState<ChatQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<ChatQuery | null>(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setQueries(data.queries);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const filteredQueries = queries.filter((item) =>
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">Chat Queries</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredQueries.length} queries received from the website chatbot.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by email or query..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-72 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Query</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#f99d1c] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium">Loading queries...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <MessageCircle size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No chat queries found.</p>
                  </td>
                </tr>
              ) : (
                filteredQueries.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f99d1c]/10 flex items-center justify-center text-[#f99d1c]">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[#11253e] text-sm">{item.email}</p>
                          {item.phone && (
                            <p className="text-gray-400 text-xs">{item.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <p className="text-sm text-[#11253e] truncate">{item.query}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-[#11253e] font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={12} />
                          {new Date(item.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedQuery(item)}
                        className="text-xs font-bold text-[#f99d1c] hover:underline uppercase tracking-wide"
                      >
                        View
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
      {selectedQuery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#11253e]/80 backdrop-blur-sm" onClick={() => setSelectedQuery(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#11253e]">Query Details</h3>
              <button onClick={() => setSelectedQuery(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={10} /> Email
                  </p>
                  <p className="text-sm font-medium text-[#11253e]">{selectedQuery.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Phone size={10} /> Phone
                  </p>
                  <p className="text-sm font-medium text-[#11253e]">{selectedQuery.phone || "—"}</p>
                </div>
              </div>
              <div className="space-y-1 pt-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Query</p>
                <p className="text-sm text-[#11253e] leading-relaxed">{selectedQuery.query}</p>
              </div>
              {selectedQuery.pageUrl && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Globe size={10} /> Page URL
                  </p>
                  <p className="text-xs text-[#11253e] truncate">{selectedQuery.pageUrl}</p>
                </div>
              )}
              <div className="p-3 bg-[#f99d1c]/5 rounded-xl border border-[#f99d1c]/10 text-xs text-gray-500">
                Submitted on {new Date(selectedQuery.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
