import React, { useState } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle } from 'lucide-react';

function CSVImport({ eventId, onImportComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      
      // Check if it's Excel or CSV
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files, show a simpler preview
        setPreview([
          { name: 'Excel file detected', email: 'Processing...', phone: '', category: 'General', plus_ones: 0 },
          { name: 'File will be processed', email: 'on import', phone: '', category: 'General', plus_ones: 0 }
        ]);
        return;
      }
      
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse CSV (simple parsing)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          name: values[headers.indexOf('name')] || '',
          email: values[headers.indexOf('email')] || '',
          phone: values[headers.indexOf('phone')] || '',
          category: values[headers.indexOf('category')] || 'General',
          plus_ones: parseInt(values[headers.indexOf('plus_ones')] || values[headers.indexOf('plusones')] || 0)
        };
      });
      
      setPreview(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setErrors([]);
    
    try {
      // Parse the entire file, not just preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV headers and data
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const allGuests = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            event_id: eventId,
            name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            category: values[headers.indexOf('category')] || 'General',
            plus_ones: parseInt(values[headers.indexOf('plus_ones')] || values[headers.indexOf('plusones')] || 0),
            is_walkin: false
          };
        }).filter(guest => guest.name); // Only include guests with names
        
        // Import guests one by one
        let successCount = 0;
        let failCount = 0;
        
        for (const guestData of allGuests) {
          try {
            // Dynamically import guestsAPI
            const { guestsAPI } = await import('../api');
            await guestsAPI.create(guestData);
            successCount++;
          } catch (err) {
            console.error('Failed to import guest:', guestData.name, err);
            failCount++;
          }
        }
        
        setImporting(false);
        alert(`✅ Successfully imported ${successCount} guests!${failCount > 0 ? `\n⚠️ ${failCount} failed` : ''}`);
        if (onImportComplete) onImportComplete();
        onClose();
      };
      
      reader.readAsText(file);
    } catch (error) {
      setImporting(false);
      setErrors(['Import failed: ' + error.message]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,phone,category,plus_ones\nJohn Doe,john@example.com,+1-555-0100,VIP,1\nJane Smith,jane@example.com,+1-555-0101,General,0\nMike Johnson,mike@example.com,+1-555-0102,Staff,0";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list-template.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Import Guest List</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Need a template?</h3>
                <p className="text-sm text-blue-700">Download our CSV template to get started</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload CSV or Excel File
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: .csv, .xlsx, .xls
                </p>
              </label>
            </div>
          ) : (
            <div>
              {/* File Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">{file.name}</div>
                      <div className="text-sm text-green-700">
                        {preview.length}+ guests detected
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                    }}
                    className="text-green-700 hover:text-green-900"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Name</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-left py-2 px-3">Phone</th>
                        <th className="text-left py-2 px-3">Category</th>
                        <th className="text-left py-2 px-3">+Ones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-3">{row.name}</td>
                          <td className="py-2 px-3">{row.email}</td>
                          <td className="py-2 px-3">{row.phone}</td>
                          <td className="py-2 px-3">{row.category}</td>
                          <td className="py-2 px-3">{row.plus_ones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Found {errors.length} issues</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing || errors.length > 0}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : `Import ${preview.length}+ Guests`}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Required:</strong> name</li>
              <li>• <strong>Optional:</strong> email, phone, category (VIP/General/Staff), plus_ones</li>
              <li>• First row must be headers</li>
              <li>• Use comma (,) as separator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CSVImport;
