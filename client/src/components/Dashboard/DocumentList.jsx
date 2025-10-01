import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import Button from '../Common/Button';
import documentService from '../../services/documentService';
import { toast } from 'react-toastify';

const DocumentList = ({ documents }) => {
  const navigate = useNavigate();

  const handleDownload = async (documentId) => {
    try {
      const url = await documentService.download(documentId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No documents found</p>
        <Button className="mt-4" onClick={() => navigate('/documents/new')}>
          Create Your First Document
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipients
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doc.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.signed_recipients || 0} / {doc.total_recipients || 0} signed
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(doc.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  View
                </button>
                {doc.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;
