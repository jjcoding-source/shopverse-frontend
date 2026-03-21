import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, Ban, Users, UserCheck,
  UserX, Crown, X, Mail, Phone,
  MapPin, Package, ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { adminAPI } from "@/store/api/adminApi";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  active:   { label: "Active",   color: "bg-green-50 text-green-600" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-500"  },
  banned:   { label: "Banned",   color: "bg-red-50 text-red-500"     },
};

const UserDetailModal = ({ user, onClose, onBan, onMakeAdmin }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">User details</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                user.isActive ? STATUS_CONFIG.active.color : STATUS_CONFIG.banned.color
              }`}>
                {user.isActive ? "Active" : "Banned"}
              </span>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                  <Crown size={9} />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400 shrink-0" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Phone size={14} className="text-gray-400 shrink-0" />
              {user.phone}
            </div>
          )}
          {user.address?.city && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              {user.address.city}, {user.address.country}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Joined",  value: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
            { label: "Role",    value: user.role || "user" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-gray-900 capitalize">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 p-5 border-t border-gray-100">
        <button
          onClick={() => { onBan(user._id, user.isActive); onClose(); }}
          className={`flex-1 flex items-center justify-center gap-2 font-medium py-2.5 rounded-xl transition-colors text-sm ${
            user.isActive
              ? "bg-red-50 hover:bg-red-100 text-red-600"
              : "bg-green-50 hover:bg-green-100 text-green-600"
          }`}
        >
          {user.isActive ? <><Ban size={14} /> Ban user</> : <><UserCheck size={14} /> Unban user</>}
        </button>
        {user.role !== "admin" && (
          <button
            onClick={() => { onMakeAdmin(user._id); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            <ShieldCheck size={14} />
            Make admin
          </button>
        )}
      </div>
    </div>
  </div>
);

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [viewUser,     setViewUser]     = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, currentPage],
    queryFn:  () =>
      adminAPI.getUsers({
        page:   currentPage,
        limit:  10,
        search: search || undefined,
      }).then((r) => r.data),
  });

  const users      = data?.users      || [];
  const total      = data?.total      || 0;
  const totalPages = data?.totalPages || 1;

  // Client-side role filter
  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const handleBan = async (id, isCurrentlyActive) => {
    try {
      await adminAPI.updateUser(id, { isActive: !isCurrentlyActive });
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-stats"]);
      toast.success(isCurrentlyActive ? "User banned" : "User unbanned");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleMakeAdmin = async (id) => {
    try {
      await adminAPI.updateUser(id, { role: "admin" });
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User promoted to admin");
    } catch {
      toast.error("Failed to update user role");
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,     label: "Total users",  value: total,                                              color: "bg-primary-50 text-primary-600" },
          { icon: UserCheck, label: "Active",        value: users.filter((u) => u.isActive).length,            color: "bg-green-50 text-green-600"     },
          { icon: Crown,     label: "Admins",        value: users.filter((u) => u.role === "admin").length,    color: "bg-amber-50 text-amber-600"     },
          { icon: UserX,     label: "Banned",        value: users.filter((u) => !u.isActive).length,           color: "bg-red-50 text-red-500"         },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-80 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
          >
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["User", "Email", "Role", "Joined", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {user.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-primary-50 text-primary-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {user.role === "admin" && <Crown size={9} />}
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.isActive ? STATUS_CONFIG.active.color : STATUS_CONFIG.banned.color
                      }`}>
                        {user.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewUser(user)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleBan(user._id, user.isActive)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={user.isActive ? "Ban user" : "Unban user"}
                        >
                          {user.isActive ? <Ban size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {total} users
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-primary-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {viewUser && (
        <UserDetailModal
          user={viewUser}
          onClose={() => setViewUser(null)}
          onBan={handleBan}
          onMakeAdmin={handleMakeAdmin}
        />
      )}
    </div>
  );
};

export default AdminUsers;