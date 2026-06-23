"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Mail,
  Linkedin,
  ExternalLink,
  Eye,
  Search,
  Calendar,
  X,
  FileText
} from "lucide-react";

interface CareerApplication {
  _id: string;
  name: string;
  email: string;
  linkedin: string;
  pageTitle: string;
  pageUrl: string;
  appliedAt: string;
}

export default function CareerPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null);

  const fetchApplications = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8000/api/career/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">Career Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and review candidates who applied through the website.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search applicants..."
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Role (Page)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Loading applications...</td>
                </tr>
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#11253e]">{app.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {app.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#11253e] font-medium max-w-[200px] truncate" title={app.pageTitle}>
                          {app.pageTitle.split(' — ')[0]}
                        </span>
                        <a
                          href={app.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#f99d1c] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          View Job Page <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} /> {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-gray-400 hover:text-[#f99d1c] hover:bg-[#f99d1c]/10 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                        <Briefcase className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No applications found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11253e]/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f99d1c] rounded-2xl flex items-center justify-center text-white">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#11253e]">Application Details</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ref: {selectedApp._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#11253e]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-[#11253e] font-bold">{selectedApp.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-[#11253e] font-medium">{selectedApp.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn Profile</p>
                <a
                  href={selectedApp.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f99d1c] font-medium flex items-center gap-2 hover:underline"
                >
                  <Linkedin size={16} /> Open LinkedIn Profile <ExternalLink size={14} />
                </a>
              </div>

              <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Role Context</p>
                  <p className="text-[#11253e] font-bold text-sm leading-snug">{selectedApp.pageTitle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application Source URL</p>
                  <p className="text-gray-500 text-[11px] break-all font-mono leading-relaxed">{selectedApp.pageUrl}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 text-[11px] text-gray-400 font-medium">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Applied on {new Date(selectedApp.appliedAt).toLocaleString()}</span>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">New</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
