import React, { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle } from 'lucide-react';
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
    console.log('Download template clicked!'); // Debug log
    
    try {
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
      
      console.log('Template created, length:', template.length); // Debug log
      
      // Create blob
      const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
      console.log('Blob created, size:', blob.size); // Debug log
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      console.log('URL created:', url); // Debug log
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'guest_list_sample.csv';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      console.log('Link added to DOM'); // Debug log
      
      link.click();
      console.log('Link clicked!'); // Debug log
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Cleanup complete'); // Debug log
      }, 100);
      
      // Show success message
      alert('Sample CSV downloaded! Check your Downloads folder.');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download sample CSV. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Import Guest List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Download Sample */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Step 1: Download Sample CSV
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  First, download our sample file to see the correct format. You can edit this file with your own guest data.
                </p>
                
                <button
                  onClick={downloadTemplate}
                  type="button"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Sample CSV File
                </button>
                
                {/* What's Included */}
                <div className="mt-4 bg-white/80 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Sample file includes:
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>10 example guests</strong> with realistic names and data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>All categories:</strong> VIP, VVIP, General, Staff, Press</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Proper formatting</strong> for Indian phone numbers (+91-XXXXXXXXXX)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Plus ones</strong> ranging from 0 to 3</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Edit & Upload */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  Step 2: Upload Your CSV
                </h3>
                <p className="text-sm text-purple-800 mb-4">
                  After editing the sample file with your guest data, upload it here.
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition bg-white/50">
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
                  >
                    Choose CSV File
                  </label>
                  {file && (
                    <p className="mt-3 text-sm text-purple-800 font-medium">
                      ✓ Selected: {file.name}
                    </p>
                  )}
                  {!file && (
                    <p className="mt-3 text-xs text-purple-600">
                      Click to select your edited CSV file
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CSV Format Guide */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CSV Format Requirements:
            </h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200 font-mono text-xs">
              <div className="text-gray-600 mb-2">Header row (required):</div>
              <div className="text-gray-900 font-semibold mb-3">
                name,email,phone,category,plus_ones
              </div>
              
              <div className="text-gray-600 mb-2">Example data row:</div>
              <div className="text-gray-900">
                John Doe,john@email.com,+91-9876543210,VIP,2
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p>• <strong>name:</strong> Required - Guest's full name</p>
              <p>• <strong>email:</strong> Optional - Valid email address</p>
              <p>• <strong>phone:</strong> Optional - Format: +91-XXXXXXXXXX</p>
              <p>• <strong>category:</strong> Optional - VIP, VVIP, General, Staff, or Press</p>
              <p>• <strong>plus_ones:</strong> Optional - Number (0-10)</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {importing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Importing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Guests
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportCSVModal;
