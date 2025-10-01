import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import documentService from '../../services/documentService';
import SignatureCanvas from './SignatureCanvas';
import Button from '../Common/Button';
import Loader from '../Common/Loader';
import { toast } from 'react-toastify';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SigningPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [signatures, setSignatures] = useState({});
  const [currentField, setCurrentField] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDocument = async () => {
    try {
      const data = await documentService.getForSigning(token);
      setDocumentData(data);

      const initialSignatures = {};
      data.placements.forEach(placement => {
        if (placement.field_type === 'date') {
          initialSignatures[placement.id] = {
            placementId: placement.id,
            value: new Date().toLocaleDateString()
          };
        }
      });
      setSignatures(initialSignatures);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load document');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSignature = (placementId, data) => {
    setSignatures(prev => ({
      ...prev,
      [placementId]: {
        placementId,
        signatureData: data.signatureData,
        value: data.value
      }
    }));
    setCurrentField(null);
  };

  const handleSubmit = async () => {
    const requiredFields = documentData.placements.filter(p => p.is_required);
    const missingFields = requiredFields.filter(f => !signatures[f.id]);

    if (missingFields.length > 0) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const signatureArray = Object.values(signatures);
      await documentService.submitSignature(token, signatureArray);
      toast.success('Document signed successfully!');
      navigate(`/sign/${token}/complete`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading document..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{documentData.document.title}</h1>
          {documentData.document.message && (
            <p className="mt-2 text-gray-600">{documentData.document.message}</p>
          )}
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Recipient: {documentData.recipient.name}</span>
            <span>•</span>
            <span>{documentData.placements.filter(p => p.is_required).length} required fields</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="pdf-viewer">
            <Document
              file={documentData.document.fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={800}
                  className="mb-4"
                />
              ))}
            </Document>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Signature Fields</h2>
          <div className="space-y-4">
            {documentData.placements.map((placement) => (
              <div
                key={placement.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium capitalize">{placement.field_type}</span>
                    {placement.is_required && (
                      <span className="ml-2 text-red-500 text-sm">*</span>
                    )}
                    {placement.field_label && (
                      <span className="ml-2 text-sm text-gray-500">({placement.field_label})</span>
                    )}
                  </div>
                  {signatures[placement.id] ? (
                    <span className="text-green-600 text-sm">✓ Completed</span>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setCurrentField(placement)}
                    >
                      Fill
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader size="small" /> : 'Submit Signature'}
            </Button>
          </div>
        </div>

        {currentField && (
          <SignatureCanvas
            field={currentField}
            onSave={(data) => handleSignature(currentField.id, data)}
            onClose={() => setCurrentField(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SigningPage;
