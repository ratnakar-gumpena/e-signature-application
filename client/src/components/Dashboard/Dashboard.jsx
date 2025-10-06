import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentList from './DocumentList';
import Button from '../Common/Button';
import Loader from '../Common/Loader';

const Dashboard = () => {
  const [filter, setFilter] = useState('');
  const { documents, loading, deleteDocument } = useDocuments({ status: filter });
  const navigate = useNavigate();

  const stats = {
    total: documents.length,
    completed: documents.filter(d => d.status === 'completed').length,
    pending: documents.filter(d => d.status === 'sent' || d.status === 'viewed').length,
    draft: documents.filter(d => d.status === 'draft').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your documents and track their status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-600">{stats.draft}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
            <Button onClick={() => navigate('/documents/new')}>
              New Document
            </Button>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === '' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'sent' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'completed' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'draft' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : (
          <DocumentList documents={documents} onDelete={deleteDocument} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
