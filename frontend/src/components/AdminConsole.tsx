"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Clock,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCog,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useAuth, User } from "@/context/AuthContext";

export function AdminConsole() {
  const { usersList, approveUser, rejectUser, updateUserRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const pendingCount = usersList.filter((u) => u.status === "pending").length;
  const approvedCount = usersList.filter((u) => u.status === "approved").length;
  const totalCount = usersList.length;

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (userId: number | string, userName: string) => {
    await approveUser(userId);
    setSuccessToast(`Granted permission to ${userName}. User can now sign in and use the workbench!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleReject = async (userId: number | string, userName: string) => {
    await rejectUser(userId);
    setSuccessToast(`Revoked / Rejected access for ${userName}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191614] flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#5C2817]" />
            <span>Access & Permission Management</span>
          </h2>
          <p className="text-xs text-[#7A7166] mt-0.5">
            Strict On-Premises Role-Based Access Control (RBAC). Only approved users can use the workbench.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F4EDE4] text-[#5C2817] border border-[#E3D7C8] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Clearance Level 4</span>
          </span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E6DDD2] shadow-2xs">
          <div className="text-[11px] font-bold text-[#8A8177] uppercase tracking-wider">
            Total Accounts
          </div>
          <div className="text-2xl font-extrabold text-[#1A1816] mt-1">{totalCount}</div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">In MySQL Database</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-amber-800 mt-0.5">Awaiting Administrator Permission</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized Users</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Full Workbench Access</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E6DDD2] shadow-2xs">
          <div className="text-[11px] font-bold text-[#8A8177] uppercase tracking-wider">
            Security Mode
          </div>
          <div className="text-xs font-bold text-[#5C2817] mt-1.5">100% Air-Gapped</div>
          <div className="text-[10px] text-[#7A7268] mt-0.5">Zero external data egress</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DDD2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C8379] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E8DFD3]">
          {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === filter
                  ? "bg-white text-[#5C2817] shadow-sm"
                  : "text-[#766D63] hover:text-[#1F1D1A]"
              }`}
            >
              {filter === "all"
                ? `All (${totalCount})`
                : filter === "pending"
                ? `Pending (${pendingCount})`
                : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDD2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#ECE5DD] text-[11px] font-bold text-[#7E756B] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Permission Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8C8379]">
                    No users matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = u.status === "pending";
                  const isApproved = u.status === "approved";
                  const isRejected = u.status === "rejected";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        isPending ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#F4EDE4] text-[#5C2817] flex items-center justify-center font-bold text-xs shrink-0 border border-[#E2D6C7]">
                            {u.initials || u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#1A1715] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === "admin" && (
                                <span className="text-[9px] bg-[#5C2817] text-white px-1.5 py-0.2 rounded font-semibold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#867E74]">@{u.username || "user"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#4A443D]">
                        {u.email}
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateUserRole(u.id!, e.target.value as User["role"])
                          }
                          className="bg-[#FAF8F5] border border-[#E2D8CC] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
                        >
                          <option value="engineer">Engineer</option>
                          <option value="analyst">Analyst</option>
                          <option value="auditor">Auditor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Pending Permission</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Approved (Active)</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Access Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(u.id!, u.name)}
                              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Access</span>
                            </button>
                            <button
                              onClick={() => handleReject(u.id!, u.name)}
                              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <button
                            onClick={() => handleReject(u.id!, u.name)}
                            disabled={u.role === "admin" && u.username === "admin"}
                            className="text-xs text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Suspend user access"
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(u.id!, u.name)}
                            className="text-xs text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition font-bold"
                          >
                            Grant Permission
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
