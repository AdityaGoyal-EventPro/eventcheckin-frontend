import React, { useState } from 'react';
import { Upload, X, Download, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { validateCSVPhone, cleanPhone } from './phoneUtils';

function ImportCSVModal({ eventId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationResults, setValidationResults] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setErrors(['CSV file is empty or invalid']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = [];
      const parseErrors = [];
      const validations = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        const row = {
          name: values[headers.indexOf('name')] || '',
          email: values[headers.indexOf('email')] || '',
          phone: values[headers.indexOf('phone')] || '',
          category: values[headers.indexOf('category')] || 'General',
          plus_ones: parseInt(values[headers.indexOf('plus ones')] || values[headers.indexOf('plus_ones')]) || 0
        };

        // Validate phone number
        const phoneValidation = validateCSVPhone(row.phone, i);
        
        validations.push({
          row: i,
          phone: row.phone,
          ...phoneValidation
        });

        if (!phoneValidation.isValid) {
          parseErrors.push(phoneValidation.error);
        } else {
          // Use cleaned phone
          row.phone = phoneValidation.cleaned;
        }

        // Validate name
        if (!row.name) {
          parseErrors.push(`Row ${i + 1}: Name is required`);
        }

        data.push(row);
      }

      setPreview(data);
      setErrors(parseErrors);
      setValidationResults(validations);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      alert('Please fix validation errors before importing');
      return;
    }

    setImporting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guests/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          guests: preview
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.guests);
        onClose();
      } else {
        setErrors([data.error || 'Failed to import guests']);
      }
    } catch (error) {
      setErrors(['Failed to connect to server']);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Name,Email,Phone,Category,Plus Ones
John Doe,john@example.com,9876543210,VIP,2
Jane Smith,jane@example.com,8765432109,General,0

INSTRUCTIONS:
- Phone: Enter EXACTLY 10 digits
- NO country code (+91)
- Must start with 6, 7, 8, or 9
- Examples: 9876543210, 8765432109`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list-template.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Import Guests from CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Phone Number Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">📱 Phone Number Format</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>✅ <strong>CORRECT:</strong> 9876543210 (exactly 10 digits)</p>
                  <p>❌ <strong>WRONG:</strong> +919876543210 (no country code)</p>
                  <p>❌ <strong>WRONG:</strong> 987-654-3210 (no dashes)</p>
                  <p className="mt-2 pt-2 border-t border-blue-200">
                    Must start with 6, 7, 8, or 9
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-purple-600 hover:text-purple-700 font-semibold"
              >
                Choose CSV file
              </label>
              <p className="text-sm text-gray-500 mt-2">
                or drag and drop
              </p>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    {errors.length} Error{errors.length > 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-sm text-red-800">Fix these before importing:</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-red-700 ml-8">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                Preview ({preview.length} guest{preview.length > 1 ? 's' : ''})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">+Ones</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((guest, index) => {
                      const validation = validationResults[index];
                      const isValid = validation?.isValid;
                      
                      return (
                        <tr
                          key={index}
                          className={isValid ? 'bg-white' : 'bg-red-50'}
                        >
                          <td className="px-4 py-2 border-t">{guest.name}</td>
                          <td className="px-4 py-2 border-t">{guest.email}</td>
                          <td className="px-4 py-2 border-t font-mono">
                            +91 {guest.phone}
                          </td>
                          <td className="px-4 py-2 border-t">{guest.category}</td>
                          <td className="px-4 py-2 border-t">{guest.plus_ones}</td>
                          <td className="px-4 py-2 border-t">
                            {isValid ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Valid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                Error
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || errors.length > 0 || importing}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : `Import ${preview.length} Guest${preview.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportCSVModal;
