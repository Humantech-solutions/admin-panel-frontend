"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  User,
  Globe,
  ExternalLink,
  Search,
  Calendar,
  X,
  Clock,
  Briefcase,
  FileText,
  Download,
  Filter
} from "lucide-react";

interface CareerMail {
  _id: string;
  name: string;
  email: string;
  type: 'application' | 'brochure';
  linkedin?: string;
  pageTitle: string;
  pageUrl: string;
  appliedAt: string;
  createdAt: string;
}

export default function CareerMailsPage() {
  const [inquiries, setInquiries] = useState<CareerMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMail, setSelectedMail] = useState<CareerMail | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8000/api/career/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.applications);
      }
    } catch (error) {
      console.error("Error fetching career mails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">Career Mails</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tracking {filteredInquiries.length} interactions from the careers page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f99d1c]/20 focus:border-[#f99d1c] w-full md:w-64 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#f99d1c] appearance-none cursor-pointer pr-10 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a0aec0\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="all">All Types</option>
            <option value="application">Applications</option>
            <option value="brochure">Brochure Downloads</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Context</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading career mails...</td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{item.name}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{item.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                        ${item.type === 'application' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {item.type || 'application'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-xs text-[#11253e] font-medium truncate" title={item.pageTitle}>
                          {item.pageTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate">{item.pageUrl ? new URL(item.pageUrl).pathname : "/careers"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedMail(item)}
                        className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 text-gray-300">
                        <Mail size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No career mails found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  {selectedMail.type === 'application' ? <Briefcase size={20} /> : <Download size={20} />}
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">
                    {selectedMail.type === 'application' ? 'Job Application' : 'Brochure Request'}
                  </h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Candidate: {selectedMail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-[#11253e] font-bold text-sm">{selectedMail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-[#11253e] font-medium text-sm">{selectedMail.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted At</p>
                  <p className="text-[#11253e] font-medium text-sm">
                    {new Date(selectedMail.appliedAt || selectedMail.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedMail.linkedin && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn Profile</p>
                    <a href={selectedMail.linkedin} target="_blank" className="text-[#f99d1c] text-sm hover:underline flex items-center gap-1">
                      View Profile <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Globe size={12} /> Source Context
                  </div>
                  <p className="text-[#11253e] font-bold text-sm tracking-tight">{selectedMail.pageTitle}</p>
                  <p className="text-gray-400 text-[11px] font-mono break-all">{selectedMail.pageUrl}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-[#11253e] text-white py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest">
                  Send Response
                </button>
                <button className="px-6 border border-gray-100 rounded-2xl text-gray-400 hover:text-[#f99d1c] hover:border-[#f99d1c] transition-all">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
