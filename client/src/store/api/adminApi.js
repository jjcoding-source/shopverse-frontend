import api from "@/utils/axiosInstance";

export const adminAPI = {
  getStats:       ()           => api.get("/admin/stats"),
  getUsers:       (params)     => api.get("/admin/users",      { params }),
  updateUser:     (id, data)   => api.put(`/admin/users/${id}`, data),
  getOrders:      (params)     => api.get("/admin/orders",     { params }),
  getRevenue:     ()           => api.get("/admin/analytics/revenue"),
  getAnalytics:   ()           => api.get("/admin/analytics"),
};