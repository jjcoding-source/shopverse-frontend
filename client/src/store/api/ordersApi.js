import api from "@/utils/axiosInstance";

export const ordersAPI = {
  create:       (data)         => api.post("/orders", data),
  getMyOrders:  (params)       => api.get("/orders/my", { params }),
  getOne:       (id)           => api.get(`/orders/${id}`),
  cancel:       (id)           => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, status)   => api.put(`/orders/${id}/status`, { status }),
};