import api from "@/utils/axiosInstance";

export const reviewsAPI = {
  getByProduct:  (productId, params) => api.get(`/reviews/${productId}`, { params }),
  canReview:     (productId)         => api.get(`/reviews/${productId}/can-review`),
  create:        (productId, data)   => api.post(`/reviews/${productId}`, data),
  markHelpful:   (id)                => api.put(`/reviews/${id}/helpful`),
  delete:        (id)                => api.delete(`/reviews/${id}`),
};