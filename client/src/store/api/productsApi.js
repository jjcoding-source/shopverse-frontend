import api from "@/utils/axiosInstance";

export const productsAPI = {
  getAll:     (params) => api.get("/products", { params }),
  getOne:     (id)     => api.get(`/products/${id}`),
  getFeatured:()       => api.get("/products/featured"),
  getRelated: (id)     => api.get(`/products/${id}/related`),
  create:     (data)   => api.post("/products", data),
  update:     (id, data) => api.put(`/products/${id}`, data),
  delete:     (id)     => api.delete(`/products/${id}`),
};