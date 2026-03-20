import { useState } from "react";
import {
  Search, Eye, Ban, MoreHorizontal,
  Users, UserCheck, UserX, Crown,
  X, Mail, Phone, MapPin, Package,
  ShieldCheck, ShieldOff,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const USERS = [
  { _id: "u1", name: "James Kumar",    email: "james@example.com",  phone: "+1 555-0172", role: "user",  status: "active",  joined: "Jan 15, 2024",  orders: 24, spent: 3840.42, avatar: "JK", avatarBg: "bg-primary-100 text-primary-700" },
  { _id: "u2", name: "Sarah Williams", email: "sarah@example.com",  phone: "+1 555-0291", role: "user",  status: "active",  joined: "Feb 3, 2024",   orders: 18, spent: 2210.00, avatar: "SW", avatarBg: "bg-pink-100 text-pink-700"       },
  { _id: "u3", name: "Alex Chen",      email: "alex@example.com",   phone: "+1 555-0384", role: "admin", status: "active",  joined: "Dec 10, 2023",  orders: 31, spent: 5632.00, avatar: "AC", avatarBg: "bg-teal-100 text-teal-700"       },
  { _id: "u4", name: "Priya Nair",     email: "priya@example.com",  phone: "+1 555-0445", role: "user",  status: "active",  joined: "Mar 1, 2024",   orders: 7,  spent: 892.00,  avatar: "PN", avatarBg: "bg-amber-100 text-amber-700"     },
  { _id: "u5", name: "Tom Brooks",     email: "tom@example.com",    phone: "+1 555-0556", role: "user",  status: "banned",  joined: "Nov 22, 2023",  orders: 3,  spent: 267.00,  avatar: "TB", avatarBg: "bg-red-100 text-red-700"         },
  { _id: "u6", name: "Emma Davis",     email: "emma@example.com",   phone: "+1 555-0617", role: "user",  status: "active",  joined: "Feb 14, 2024",  orders: 12, spent: 1890.00, avatar: "ED", avatarBg: "bg-green-100 text-green-700"     },
  { _id: "u7", name: "Raj Patel",      email: "raj@example.com",    phone: "+1 555-0728", role: "user",  status: "active",  joined: "Jan 29, 2024",  orders: 9,  spent: 1340.00, avatar: "RP", avatarBg: "bg-purple-100 text-purple-700"   },
  { _id: "u8", name: "Lisa Wong",      email: "lisa@example.com",   phone: "+1 555-0839", role: "user",  status: "inactive",joined: "Mar 8, 2024",   orders: 2,  spent: 156.00,  avatar: "LW", avatarBg: "bg-orange-100 text-orange-700"   },
];

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
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${user.avatarBg}`}>
            {user.avatar}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[user.status].color}`}>
                {STATUS_CONFIG[user.status].label}
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
          {[
            { icon: Mail,    value: user.email   },
            { icon: Phone,   value: user.phone   },
            { icon: MapPin,  value: "New York, US" },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-2.5 text-sm text-gray-600">
              <Icon size={14} className="text-gray-400 shrink-0" />
              {value}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Joined",  value: user.joined   },
            { label: "Orders",  value: user.orders   },
            { label: "Spent",   value: formatPrice(user.spent) },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 p-5 border-t border-gray-100">
        {user.status !== "banned" ? (
          <button
            onClick={() => { onBan(user._id); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            <Ban size={14} />
            Ban user
          </button>
        ) : (
          <button
            onClick={() => { onBan(user._id); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            <UserCheck size={14} />
            Unban user
          </button>
        )}
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
  const [users,       setUsers]       = useState(USERS);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const [viewUser,    setViewUser]    = useState(null);

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter   !== "all" && u.role   !== roleFilter)   return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const handleBan = (id) => {
    setUsers((p) =>
      p.map((u) =>
        u._id === id
          ? { ...u, status: u.status === "banned" ? "active" : "banned" }
          : u
      )
    );
    const user = users.find((u) => u._id === id);
    toast.success(user?.status === "banned" ? "User unbanned" : "User banned");
  };

  const handleMakeAdmin = (id) => {
    setUsers((p) => p.map((u) => u._id === id ? { ...u, role: "admin" } : u));
    toast.success("User promoted to admin");
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,     label: "Total users",   value: users.length,                                         color: "bg-primary-50 text-primary-600" },
          { icon: UserCheck, label: "Active",         value: users.filter((u) => u.status === "active").length,    color: "bg-green-50 text-green-600"     },
          { icon: Crown,     label: "Admins",         value: users.filter((u) => u.role === "admin").length,       color: "bg-amber-50 text-amber-600"     },
          { icon: UserX,     label: "Banned",         value: users.filter((u) => u.status === "banned").length,    color: "bg-red-50 text-red-500"         },
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
              onChange={(e) => setSearch(e.target.value)}
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["User", "Email", "Role", "Joined", "Orders", "Total spent", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => {
                const statusCfg = STATUS_CONFIG[user.status];
                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.avatarBg}`}>
                          {user.avatar}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user.name}</p>
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
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{user.joined}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">{user.orders}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(user.spent)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
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
                          onClick={() => handleBan(user._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {user.status === "banned" ? <UserCheck size={15} /> : <Ban size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No users found</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {users.length} users
          </p>
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