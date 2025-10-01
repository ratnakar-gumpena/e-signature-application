import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import Modal from '../Common/Modal';
import Button from '../Common/Button';

const SignatureCanvas = ({ field, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [signaturePad, setSignaturePad] = useState(null);
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    if (canvasRef.current && (field.field_type === 'signature' || field.field_type === 'initial')) {
      const pad = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
      setSignaturePad(pad);

      return () => {
        pad.off();
      };
    }
  }, [field.field_type]);

  const handleClear = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
    setTextValue('');
  };

  const handleSave = () => {
    if (field.field_type === 'signature' || field.field_type === 'initial') {
      if (signaturePad.isEmpty()) {
        alert('Please provide a signature first');
        return;
      }
      const signatureData = signaturePad.toDataURL();
      onSave({ signatureData });
    } else {
      if (!textValue.trim()) {
        alert('Please enter a value');
        return;
      }
      onSave({ value: textValue });
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Fill ${field.field_type} field`}>
      <div className="space-y-4">
        {(field.field_type === 'signature' || field.field_type === 'initial') && (
          <>
            <p className="text-sm text-gray-600">
              Draw your {field.field_type} in the box below
            </p>
            <canvas
              ref={canvasRef}
              className="signature-canvas w-full h-64"
            />
          </>
        )}

        {field.field_type === 'text' && (
          <>
            <label className="block text-sm font-medium text-gray-700">
              {field.field_label || 'Text'}
            </label>
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </>
        )}

        {field.field_type === 'date' && (
          <>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SignatureCanvas;
