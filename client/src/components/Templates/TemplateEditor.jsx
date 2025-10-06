import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'react-toastify';
import { Save, X } from 'lucide-react';
import DraggableField from './DraggableField';
import PlacedField from './PlacedField';
import Button from '../Common/Button';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const TemplateEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { templateData } = location.state || {};

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [placedFields, setPlacedFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(
    templateData?.recipients?.[0] || null
  );
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);

  const fieldIdCounter = useRef(0);

  // Convert PDF file to URL
  React.useEffect(() => {
    if (templateData?.pdfFile) {
      const url = URL.createObjectURL(templateData.pdfFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [templateData?.pdfFile]);

  // Redirect if no template data
  React.useEffect(() => {
    if (!templateData) {
      toast.error('No template data found');
      navigate('/templates');
    }
  }, [templateData, navigate]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleDrop = (e, pageNumber) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('fieldType');

    if (!fieldType) return;

    if (!selectedRecipient) {
      toast.error('Please select a recipient first');
      return;
    }

    // Get drop position relative to the PDF page
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Default field dimensions
    const defaultWidth = fieldType === 'signature' || fieldType === 'initial' ? 200 : 150;
    const defaultHeight = fieldType === 'signature' || fieldType === 'initial' ? 80 : 40;

    const newField = {
      id: `field-${fieldIdCounter.current++}`,
      type: fieldType,
      page: pageNumber,
      x,
      y,
      width: defaultWidth,
      height: defaultHeight,
      recipientEmail: selectedRecipient.email,
      recipientName: selectedRecipient.name,
      required: true,
    };

    setPlacedFields([...placedFields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleUpdateField = (fieldId, updates) => {
    setPlacedFields(
      placedFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleDeleteField = (fieldId) => {
    setPlacedFields(placedFields.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleSave = async () => {
    if (placedFields.length === 0) {
      toast.error('Please add at least one field to the template');
      return;
    }

    // TODO: Implement save functionality with API call
    console.log('Template Data:', templateData);
    console.log('Placed Fields:', placedFields);

    toast.success('Template saved successfully');
    navigate('/templates');
  };

  const handleClose = () => {
    if (placedFields.length > 0) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        navigate('/templates');
      }
    } else {
      navigate('/templates');
    }
  };

  if (!templateData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Toolbox Panel */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fields</h3>

        {/* Recipient Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Recipient
          </label>
          <select
            value={selectedRecipient?.email || ''}
            onChange={(e) => {
              const recipient = templateData.recipients.find(
                (r) => r.email === e.target.value
              );
              setSelectedRecipient(recipient);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {templateData.recipients.map((recipient) => (
              <option key={recipient.email} value={recipient.email}>
                {recipient.name}
              </option>
            ))}
          </select>
        </div>

        {/* Draggable Fields */}
        <div className="space-y-3">
          <DraggableField type="signature" />
          <DraggableField type="initial" />
          <DraggableField type="date_signed" />
          <DraggableField type="name" />
          <DraggableField type="title" />
          <DraggableField type="text" />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Tip:</strong> Drag fields from here and drop them on the PDF to add them to your template.
          </p>
        </div>
      </div>

      {/* Center PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {templateData.name}
            </h2>
            {templateData.description && (
              <p className="text-sm text-gray-600 mt-1">
                {templateData.description}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button type="button" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        {/* PDF Viewer with Drop Zones */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          {pdfUrl && (
            <div className="flex flex-col items-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('Error loading PDF:', error);
                  toast.error('Failed to load PDF');
                }}
              >
                {Array.from(new Array(numPages), (el, index) => {
                  const pageNumber = index + 1;
                  const pageFields = placedFields.filter(
                    (field) => field.page === pageNumber
                  );

                  return (
                    <div key={`page_${pageNumber}`} className="mb-8">
                      <div className="relative inline-block bg-white shadow-lg">
                        <Page
                          pageNumber={pageNumber}
                          width={pageWidth}
                          onLoadSuccess={(page) => {
                            setPageWidth(page.width);
                          }}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                        {/* Drop Zone Overlay */}
                        <div
                          className="absolute inset-0"
                          onDrop={(e) => handleDrop(e, pageNumber)}
                          onDragOver={handleDragOver}
                        >
                          {/* Placed Fields */}
                          {pageFields.map((field) => (
                            <PlacedField
                              key={field.id}
                              field={field}
                              onUpdate={handleUpdateField}
                              onDelete={handleDeleteField}
                              isSelected={selectedFieldId === field.id}
                              onSelect={setSelectedFieldId}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-600">
                        Page {pageNumber} of {numPages}
                      </div>
                    </div>
                  );
                })}
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>

        {selectedFieldId ? (
          <div className="space-y-4">
            {(() => {
              const selectedField = placedFields.find((f) => f.id === selectedFieldId);
              if (!selectedField) return null;

              return (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <input
                      type="text"
                      value={selectedField.type}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient
                    </label>
                    <select
                      value={selectedField.recipientEmail}
                      onChange={(e) => {
                        const recipient = templateData.recipients.find(
                          (r) => r.email === e.target.value
                        );
                        handleUpdateField(selectedFieldId, {
                          recipientEmail: recipient.email,
                          recipientName: recipient.name,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {templateData.recipients.map((recipient) => (
                        <option key={recipient.email} value={recipient.email}>
                          {recipient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page
                    </label>
                    <input
                      type="number"
                      value={selectedField.page}
                      min={1}
                      max={numPages}
                      onChange={(e) => {
                        handleUpdateField(selectedFieldId, {
                          page: parseInt(e.target.value),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedField.required}
                      onChange={(e) => {
                        handleUpdateField(selectedFieldId, {
                          required: e.target.checked,
                        });
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="required" className="text-sm font-medium text-gray-700">
                      Required Field
                    </label>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDeleteField(selectedFieldId)}
                    className="w-full"
                  >
                    Delete Field
                  </Button>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Select a field to view its properties</p>
          </div>
        )}

        {/* Template Info */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Template Info</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Total Fields:</span>{' '}
              <span className="font-medium">{placedFields.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Recipients:</span>{' '}
              <span className="font-medium">{templateData.recipients.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Pages:</span>{' '}
              <span className="font-medium">{numPages || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
