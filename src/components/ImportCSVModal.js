import React, { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';
import { guestsAPI } from '../api';

function ImportCSVModal({ eventId, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setImporting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await guestsAPI.importCSV(eventId, formData);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.error || 'Failed to import CSV');
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample CSV with realistic data
    const template = `name,email,phone,category,plus_ones
John Doe,john.doe@example.com,+91-9876543210,VIP,2
Jane Smith,jane.smith@example.com,+91-9876543211,General,0
Raj Patel,raj.patel@example.com,+91-9876543212,VIP,1
Priya Sharma,priya.sharma@example.com,+91-9876543213,General,0
Mike Johnson,mike.johnson@example.com,+91-9876543214,VVIP,3
Ananya Kumar,ananya.kumar@example.com,+91-9876543215,General,0
David Lee,david.lee@example.com,+91-9876543216,VIP,1
Sarah Williams,sarah.williams@example.com,+91-9876543217,Staff,0
Amit Singh,amit.singh@example.com,+91-9876543218,Press,0
Emily Brown,emily.brown@example.com,+91-9876543219,General,2`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'guest_list_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Import CSV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Download Sample File - Prominent Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Need a template?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Download our sample CSV file with example guest data to see the correct format.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Sample CSV
                </button>
              </div>
            </div>
            
            {/* Sample Preview */}
            <div className="mt-4 bg-white/70 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Sample includes:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ 10 example guests with realistic data</li>
                <li>✓ Different categories (VIP, VVIP, General, Staff, Press)</li>
                <li>✓ Various plus_ones counts</li>
                <li>✓ Proper formatting for names, emails, and phone numbers</li>
              </ul>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Choose CSV file
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">
              CSV Format:
            </p>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <div>name, email, phone, category, plus_ones</div>
              <div className="text-gray-400">Required: name</div>
              <div className="text-gray-400">Optional: email, phone, category, plus_ones</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportCSVModal;
