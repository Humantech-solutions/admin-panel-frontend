"use client";

import { useState, useEffect, Suspense } from "react";
import {
  UserPlus,
  Users,
  Loader2,
  Mail,
  Shield,
  Briefcase,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  status: "active" | "invited" | "inactive";
  joinedAt?: string;
}

const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access to all features", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "manager", label: "Manager", desc: "Can manage forms and content", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "viewer", label: "Viewer", desc: "Read-only access", color: "bg-gray-50 text-gray-700 border-gray-200" },
] as const;

function authHeaders() {
  const token = sessionStorage.getItem("adminToken");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({ name: "", email: "", role: "viewer" as Employee["role"] });
  const [formError, setFormError] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          const mapped: Employee[] = data.users.map((u: any) => ({
            id: u._id || u.id,
            name: u.name || u.email.split("@")[0],
            email: u.email,
            role: (u.role || "viewer") as Employee["role"],
            status: (u.status || "active") as Employee["status"],
            joinedAt: u.createdAt,
          }));
          setEmployees(mapped);
        } else {
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", email: "", role: "viewer" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({ name: emp.name, email: emp.email, role: emp.role });
    setFormError("");
    setShowModal(true);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) { setFormError("Full name is required."); return; }
    if (!form.email.trim()) { setFormError("Email is required."); return; }

    setSaving(true);
    try {
      const endpoint = editTarget ? `${API_BASE_URL}/api/users/${editTarget.id}` : `${API_BASE_URL}/api/users/invite`;
      const method = editTarget ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
        showSuccess(editTarget ? `${form.name}'s details updated.` : `Invitation sent to ${form.email}!`);
        setShowModal(false);
      } else {
        setFormError(data.message || "Operation failed.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
        showSuccess(`${deleteTarget.name} has been removed.`);
      }
      setDeleteTarget(null);
    } catch {
      console.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (status: Employee["status"]) => {
    if (status === "active") return "bg-green-50 text-green-700 border border-green-200";
    if (status === "invited") return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    return "bg-gray-50 text-gray-500 border border-gray-200";
  };

  const roleBadge = (role: Employee["role"]) =>
    ROLES.find((r) => r.value === role)?.color ?? "bg-gray-50 text-gray-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11253e]">Employees & Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Onboard team members — they'll receive a first-time password via email.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#f99d1c] hover:bg-[#e88f10] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#f99d1c]/30 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Onboard Employee
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 text-sm font-medium animate-in fade-in">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: employees.length, icon: <Users size={20} />, color: "bg-blue-50 text-blue-600" },
          { label: "Active", value: employees.filter(e => e.status === "active").length, icon: <CheckCircle2 size={20} />, color: "bg-green-50 text-green-600" },
          { label: "Invited (Pending)", value: employees.filter(e => e.status === "invited").length, icon: <Mail size={20} />, color: "bg-yellow-50 text-yellow-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-[#11253e] mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Users className="text-gray-300" size={28} />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium text-sm">No employees yet</p>
                        <p className="text-gray-400 text-xs mt-1">Click "Onboard Employee" to invite your first team member.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#11253e] to-[#1a3d66] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {emp.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#11253e] text-sm">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleBadge(emp.role)}`}>
                        {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(emp.status)}`}>
                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-2 text-gray-400 hover:text-[#11253e] hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove"
                        >
                          <Trash2 size={15} />
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

      {/* Onboard / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#11253e]">
                  {editTarget ? "Edit Employee" : "Onboard New Employee"}
                </h2>
                {!editTarget && (
                  <p className="text-xs text-gray-400 mt-0.5">A first-time password will be sent to their email.</p>
                )}
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[#11253e] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Aria Singh"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g., alex@company.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Access Role</label>
                <div className="space-y-2 mt-2">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.role === role.value
                          ? "border-[#f99d1c] bg-[#f99d1c]/5"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.value}
                        onChange={() => setForm({ ...form, role: role.value })}
                        className="accent-[#f99d1c]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#11253e]">{role.label}</p>
                        <p className="text-xs text-gray-400">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#f99d1c] hover:bg-[#e8900f] text-white font-bold rounded-xl shadow-lg shadow-[#f99d1c]/30 transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : editTarget ? "Save Changes" : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#11253e]">Remove Employee</h3>
              <p className="text-gray-500 text-sm mt-2">
                Are you sure you want to remove <span className="font-semibold text-[#11253e]">{deleteTarget.name}</span>? They will lose all access immediately.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#f99d1c]" size={32} />
      </div>
    }>
      <EmployeesContent />
    </Suspense>
  );
}
