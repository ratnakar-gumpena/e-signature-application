import React, { useState } from 'react';
import { format } from 'date-fns';
import { Document, Page, pdfjs } from 'react-pdf';
import StatusBadge from './StatusBadge';
import Modal from '../Common/Modal';
import documentService from '../../services/documentService';
import { toast } from 'react-toastify';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentList = ({ documents, onDelete }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleView = async (doc) => {
    try {
      const response = await documentService.getById(doc.id);
      let fileUrl = response.document.original_file_url;

      // Convert relative URL to absolute URL for local development
      if (fileUrl.startsWith('/uploads/')) {
        fileUrl = `http://localhost:8080${fileUrl}`;
      }

      setPdfUrl(fileUrl);
      setSelectedDocument(doc);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to load document');
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const url = await documentService.download(documentId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(documentId);
      } catch (error) {
        // Error already handled by useDocuments hook
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    setPdfUrl(null);
    setNumPages(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No documents found</p>
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
                  onClick={() => handleView(doc)}
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
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDocument?.title || 'Document'}
        size="full"
      >
        <div className="flex flex-col h-[80vh]">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleDownload(selectedDocument?.id)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          </div>
          {pdfUrl && (
            <div className="flex-1 border border-gray-300 rounded-lg flex justify-center overflow-hidden">
              <div className="bg-gray-100 p-4 overflow-auto h-full">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => {
                    console.error('Error loading PDF:', error);
                    toast.error('Failed to load PDF');
                  }}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={800}
                      className="mb-4 shadow-lg"
                    />
                  ))}
                </Document>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentList;
