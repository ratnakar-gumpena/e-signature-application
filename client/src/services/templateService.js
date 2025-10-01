import api from './api';

const templateService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/templates?${params}`);
    return response.data.templates;
  },

  async getById(id) {
    const response = await api.get(`/templates/${id}`);
    return response.data.template;
  },

  async create(formData) {
    const response = await api.post('/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.template;
  },

  async update(id, data) {
    const response = await api.put(`/templates/${id}`, data);
    return response.data.template;
  },

  async delete(id) {
    await api.delete(`/templates/${id}`);
  },

  async getPlacements(templateId) {
    const response = await api.get(`/templates/${templateId}/placements`);
    return response.data.placements;
  },

  async savePlacements(templateId, placements) {
    const response = await api.post(`/templates/${templateId}/placements`, placements);
    return response.data.placements;
  },

  async updatePlacement(templateId, placementId, data) {
    const response = await api.put(`/templates/${templateId}/placements/${placementId}`, data);
    return response.data.placement;
  },

  async deletePlacement(templateId, placementId) {
    await api.delete(`/templates/${templateId}/placements/${placementId}`);
  }
};

export default templateService;
