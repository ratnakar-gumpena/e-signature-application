import React, { useState } from 'react';
import Button from '../Common/Button';
import CreateTemplateModal from './CreateTemplateModal';

const Templates = () => {
  const [activeView, setActiveView] = useState('my-templates');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full mb-4"
        >
          Create Template
        </Button>

        <div className="space-y-2">
          <button
            onClick={() => setActiveView('my-templates')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
              activeView === 'my-templates'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Templates
          </button>

          <button
            onClick={() => setActiveView('deleted')}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
              activeView === 'deleted'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Deleted Templates
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-auto">
        {activeView === 'my-templates' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Templates</h1>
            <p className="text-gray-600">No templates found</p>
          </div>
        )}

        {activeView === 'deleted' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Deleted Templates</h1>
            <p className="text-gray-600">No deleted templates</p>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Templates;
