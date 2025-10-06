import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { toast } from 'react-toastify';

const CreateTemplateModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [recipients, setRecipients] = useState([
    { role: '', name: '', email: '', action: 'needs-to-sign' }
  ]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const fileInputRef = React.useRef(null);

  // Auto-populate email subject when template name changes
  React.useEffect(() => {
    if (templateName) {
      setEmailSubject(`Complete with E-signature: ${templateName}`);
    } else {
      setEmailSubject('');
    }
  }, [templateName]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFiles([...files, selectedFile]);
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (index, field, value) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  const handleAddRecipient = () => {
    setRecipients([...recipients, { role: '', name: '', email: '', action: 'needs-to-sign' }]);
  };

  const handleRemoveRecipient = (index) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (files.length === 0) {
      toast.error('Please add at least one document');
      return;
    }

    // Validate recipients
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (!recipient.name.trim()) {
        toast.error(`Please enter name for recipient ${i + 1}`);
        return;
      }
      if (!recipient.email.trim()) {
        toast.error(`Please enter email for recipient ${i + 1}`);
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.email)) {
        toast.error(`Please enter a valid email for recipient ${i + 1}`);
        return;
      }
    }

    // Navigate to template editor with data
    navigate('/templates/editor', {
      state: {
        templateData: {
          name: templateName,
          description: templateDescription,
          pdfFile: files[0],
          recipients: recipients,
          emailSubject: emailSubject,
          emailMessage: emailMessage
        }
      }
    });

    handleClose();
  };

  const handleClose = () => {
    setTemplateName('');
    setTemplateDescription('');
    setFiles([]);
    setRecipients([{ role: '', name: '', email: '', action: 'needs-to-sign' }]);
    setEmailSubject('');
    setEmailMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Template" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
            Template Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter template name"
            required
          />
        </div>

        <div>
          <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Template Description
          </label>
          <textarea
            id="templateDescription"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter template description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documents <span className="text-red-600">*</span>
          </label>

          {/* Add Document Button */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center flex-1">
                    <svg
                      className="w-8 h-8 text-red-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recipients Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Add Recipients <span className="text-red-600">*</span>
          </label>

          {recipients.map((recipient, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-primary-500 bg-gray-50 rounded-r-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={recipient.role}
                    onChange={(e) => handleRecipientChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Signer, Approver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={recipient.name}
                      onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter recipient name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => handleRecipientChange(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select
                      value={recipient.action}
                      onChange={(e) => handleRecipientChange(index, 'action', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="needs-to-sign">Needs to Sign</option>
                      <option value="receives-copy">Receives Copy</option>
                    </select>
                  </div>

                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddRecipient}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Recipient
          </button>
        </div>

        {/* Add Message Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Add Message
          </label>

          <div className="space-y-4">
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Email subject"
                />
                <div className="absolute right-3 top-2 text-xs text-gray-400">
                  {emailSubject.length}/100
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="emailMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Email Message
              </label>
              <div className="relative">
                <textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  maxLength={10000}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter Message"
                />
                <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {emailMessage.length}/10000
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Template
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTemplateModal;
