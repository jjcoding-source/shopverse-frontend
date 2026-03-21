import api from "@/utils/axiosInstance";

export const categoriesAPI = {
  getAll:  ()           => api.get("/categories"),
  getOne:  (id)         => api.get(`/categories/${id}`),
  create:  (data)       => api.post("/categories", data),
  update:  (id, data)   => api.put(`/categories/${id}`, data),
  delete:  (id)         => api.delete(`/categories/${id}`),
};