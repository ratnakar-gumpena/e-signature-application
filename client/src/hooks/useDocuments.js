import { useState, useEffect, useCallback } from 'react';
import documentService from '../services/documentService';
import { toast } from 'react-toastify';

export const useDocuments = (filters = {}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll(filters);
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (data) => {
    try {
      const document = await documentService.create(data);
      setDocuments(prev => [document, ...prev]);
      toast.success('Document created successfully');
      return document;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create document');
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (err) {
      toast.error('Failed to delete document');
      throw err;
    }
  };

  const sendDocument = async (id, recipients) => {
    try {
      await documentService.send(id, recipients);
      await fetchDocuments();
      toast.success('Document sent successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send document');
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    deleteDocument,
    sendDocument
  };
};
