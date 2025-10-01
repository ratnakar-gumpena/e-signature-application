import api from './api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const documentService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/documents?${params}`);
    return response.data.documents;
  },

  async getById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async create(data) {
    let formData = data;
    if (!(data instanceof FormData)) {
      formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.document;
  },

  async update(id, data) {
    const response = await api.put(`/documents/${id}`, data);
    return response.data.document;
  },

  async delete(id) {
    await api.delete(`/documents/${id}`);
  },

  async send(documentId, recipients) {
    const response = await api.post(`/documents/${documentId}/send`, { recipients });
    return response.data;
  },

  async getRecipients(documentId) {
    const response = await api.get(`/documents/${documentId}/recipients`);
    return response.data.recipients;
  },

  async resend(documentId, recipientId) {
    const response = await api.post(`/documents/${documentId}/resend`, { recipientId });
    return response.data;
  },

  async download(documentId) {
    const response = await api.get(`/documents/${documentId}/download`);
    return response.data.downloadUrl;
  },

  async void(documentId) {
    const response = await api.post(`/documents/${documentId}/void`);
    return response.data;
  },

  async getForSigning(token) {
    const response = await axios.get(`${API_URL}/sign/${token}`);
    return response.data;
  },

  async submitSignature(token, signatures) {
    const response = await axios.post(`${API_URL}/sign/${token}`, { signatures });
    return response.data;
  },

  async getSigningStatus(token) {
    const response = await axios.get(`${API_URL}/sign/${token}/status`);
    return response.data;
  }
};

export default documentService;
