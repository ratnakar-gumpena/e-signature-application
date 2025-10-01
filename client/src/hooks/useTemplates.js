import { useState, useEffect, useCallback } from 'react';
import templateService from '../services/templateService';
import { toast } from 'react-toastify';

export const useTemplates = (filters = {}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await templateService.getAll(filters);
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (formData) => {
    try {
      const template = await templateService.create(formData);
      setTemplates(prev => [template, ...prev]);
      toast.success('Template created successfully');
      return template;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id, data) => {
    try {
      const updated = await templateService.update(id, data);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Template updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await templateService.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (err) {
      toast.error('Failed to delete template');
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
