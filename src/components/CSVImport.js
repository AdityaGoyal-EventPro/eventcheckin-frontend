import React, { useState } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

function CSVImport({ eventId, onImportComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);

  // Smart phone cleaning function
  const cleanPhone = (value) => {
    if (!value) return '';
    
    // Handle Excel number formats (scientific notation)
    if (typeof value === 'number') {
      value = value.toLocaleString('fullwide', { useGrouping: false });
    }
    
    // Convert to string and clean
    let cleaned = String(value)
      .replace(/\D/g, '')      // Remove all non-digits
      .replace(/^91/, '')       // Remove country code if present
      .slice(0, 10);            // Limit to 10 digits
    
    return cleaned;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'xlsx' || fileType === 'xls') {
      // Parse Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          
          const previewData = jsonData.slice(0, 5).map(row => ({
            name: row.Name || row.name || '',
            email: row.Email || row.email || '',
            phone: cleanPhone(row.Phone || row.phone || ''),
            category: row.Category || row.category || 'General',
            plus_ones: parseInt(row['Plus Ones'] || row.plus_ones || row.plus_one || 0)
          }));
          
          setPreview(previewData);
        } catch (error) {
          console.error('Excel parse error:', error);
          setErrors(['Failed to parse Excel file']);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV (simple parsing)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: cleanPhone(values[headers.indexOf('phone')] || ''),
            category: values[headers.indexOf('category')] || 'General',
            plus_ones: parseInt(values[headers.indexOf('plus_ones')] || values[headers.indexOf('plusones')] || 0)
          };
        });
        
        setPreview(data);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    console.log('Starting import for event:', eventId);
    setImporting(true);
    setErrors([]);
    
    try {
      // Import guestsAPI first
      const { guestsAPI } = await import('../api');
      
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (fileType === 'xlsx' || fileType === 'xls') {
        // Parse Excel file for import
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            
            console.log('Excel data parsed:', jsonData.length, 'rows');
            
            const allGuests = jsonData.map(row => ({
              event_id: eventId,
              name: row.Name || row.name || '',
              email: row.Email || row.email || '',
              phone: cleanPhone(row.Phone || row.phone || ''),
              category: row.Category || row.category || 'General',
              plus_ones: parseInt(row['Plus Ones'] || row.plus_ones || row.plus_one || 0),
              is_walkin: false
            })).filter(guest => guest.name); // Only include guests with names
            
            await importGuests(allGuests, guestsAPI);
          } catch (innerError) {
            console.error('Excel import error:', innerError);
            setImporting(false);
            setErrors(['Failed to import Excel file: ' + innerError.message]);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Parse CSV file for import
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target.result;
            console.log('File content:', text.substring(0, 200));
            const lines = text.split('\n').filter(line => line.trim());
            
            // Parse CSV headers and data
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            console.log('Headers found:', headers);
            
            const allGuests = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim());
              return {
                event_id: eventId,
                name: values[headers.indexOf('name')] || '',
                email: values[headers.indexOf('email')] || '',
                phone: cleanPhone(values[headers.indexOf('phone')] || ''),
                category: values[headers.indexOf('category')] || 'General',
                plus_ones: parseInt(values[headers.indexOf('plus_ones')] || values[headers.indexOf('plusones')] || 0),
                is_walkin: false
              };
            }).filter(guest => guest.name); // Only include guests with names
            
            console.log('Parsed guests:', allGuests);
            await importGuests(allGuests, guestsAPI);
          } catch (innerError) {
            console.error('CSV import error:', innerError);
            setImporting(false);
            setErrors(['Parse error: ' + innerError.message]);
          }
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImporting(false);
      setErrors(['Import failed: ' + error.message]);
    }
  };

  const importGuests = async (allGuests, guestsAPI) => {
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    for (const guestData of allGuests) {
      try {
        console.log('Creating guest:', guestData);
        const result = await guestsAPI.create(guestData);
        console.log('Guest created:', result);
        successCount++;
      } catch (err) {
        console.error('Failed to import guest:', guestData.name, err);
        errors.push(`${guestData.name}: ${err.response?.data?.error || err.message}`);
        failCount++;
      }
    }
    
    setImporting(false);
    
    if (errors.length > 0) {
      setErrors(errors);
    }
    
    alert(`✅ Successfully imported ${successCount} guests!${failCount > 0 ? `\n⚠️ ${failCount} failed` : ''}`);
    if (onImportComplete) onImportComplete();
    if (successCount > 0) {
      onClose();
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Phone,Category,Plus Ones
John Doe,john@example.com,9876543210,VIP,1
Jane Smith,jane@example.com,8765432109,General,0
Mike Johnson,mike@example.com,7654321098,Staff,0

Instructions:
- Phone: Enter exactly 10 digits (no +91)
- Phone must start with 6, 7, 8, or 9
- Example: 9876543210`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list-template.csv';
    a.click();
  };

  const downloadExcelTemplate = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Sample data with proper formatting
    const data = [
      ['Name', 'Email', 'Phone', 'Category', 'Plus Ones'],
      ['John Doe', 'john@example.com', '9876543210', 'VIP', 2],
      ['Jane Smith', 'jane@example.com', '8765432109', 'General', 0],
      ['Mike Johnson', 'mike@example.com', '7654321098', 'Staff', 1]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Format Phone column (C) as TEXT to prevent Excel scientific notation
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 2 }); // Column C (Phone)
      if (ws[cellAddress]) {
        ws[cellAddress].z = '@'; // @ = Text format
        ws[cellAddress].t = 's'; // s = string type
      }
    }
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Category
      { wch: 12 }  // Plus Ones
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Guest List');
    
    // Add instructions sheet
    const instructions = [
      ['📱 Phone Number Instructions'],
      [''],
      ['✅ Correct Format: 9876543210'],
      ['❌ Wrong: +919876543210 (no country code)'],
      ['❌ Wrong: 987-654-3210 (no dashes)'],
      [''],
      ['The Phone column is pre-formatted as TEXT.'],
      ['Just type the 10-digit number directly.'],
      ['Must start with 6, 7, 8, or 9']
    ];
    
    const wsInst = XLSX.utils.aoa_to_sheet(instructions);
    wsInst['!cols'] = [{ wch: 45 }];
    
    XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');
    
    // Download
    XLSX.writeFile(wb, 'guest-list-template.xlsx');
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
          {/* Download Templates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Need a template?</h3>
                <p className="text-sm text-blue-700">Download CSV or Excel template to get started</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={downloadExcelTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Phone Number Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 mb-1">📱 Phone Number Format</p>
                <p className="text-yellow-800">
                  Enter <strong>10 digits only</strong> (no +91 country code). Must start with 6, 7, 8, or 9.
                </p>
                <p className="text-yellow-700 mt-1">
                  Example: <code className="bg-yellow-100 px-2 py-0.5 rounded">9876543210</code>
                </p>
              </div>
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
                      setErrors([]);
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
                          <td className="py-2 px-3 font-mono">{row.phone || '-'}</td>
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
                        {errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                        {errors.length > 10 && (
                          <li className="text-red-600">...and {errors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing}
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
            <h3 className="font-semibold text-gray-900 mb-2">File Format Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Required:</strong> Name</li>
              <li>• <strong>Optional:</strong> Email, Phone (10 digits), Category (VIP/General/Staff), Plus Ones</li>
              <li>• First row must be column headers</li>
              <li>• CSV: Use comma (,) as separator</li>
              <li>• Excel: Phone column is auto-formatted as TEXT in our template</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CSVImport;
