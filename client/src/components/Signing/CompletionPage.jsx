import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Common/Button';

const CompletionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Document Signed Successfully!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for signing the document. All parties will be notified once the document is fully executed.
        </p>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          You will receive a copy of the signed document via email.
        </p>
      </div>
    </div>
  );
};

export default CompletionPage;
