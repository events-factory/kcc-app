"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiUpload, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import * as XLSX from 'xlsx';

// Define type for event data
type Event = {
  id: string;
  name: string;
  attendeeLimit: number;
  registered: number;
};

// Define type for preview data
type PreviewRow = Record<string, string | number | null>;

// Define required fields for attendees
type RequiredField = 'badgeId' | 'firstName' | 'lastName' | 'email';

const REQUIRED_FIELDS: RequiredField[] = ['badgeId', 'firstName', 'lastName', 'email'];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  
  // Field mapping: key is the required field, value is the column from the file
  const [fieldMapping, setFieldMapping] = useState<Record<RequiredField, string>>({
    badgeId: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  // Process step tracking
  const [uploadStep, setUploadStep] = useState<'select' | 'map' | 'review'>('select');

  // Fetch events (mocked for now - would be API call in production)
  useEffect(() => {
    // In a real application, this would be an API call
    const mockEvents = [
      {
        id: '1',
        name: 'Annual Conference 2025',
        attendeeLimit: 150,
        registered: 120,
      },
      { id: '2', name: 'Tech Summit', attendeeLimit: 100, registered: 85 },
    ];
    
    setEvents(mockEvents);
  }, []);

  // Try to automatically map columns based on common names
  const autoMapColumns = (columns: string[]) => {
    const mapping = {...fieldMapping};
    
    columns.forEach(column => {
      const lowerColumn = column.toLowerCase();
      
      if (lowerColumn.includes('badge') || lowerColumn.includes('id')) {
        mapping.badgeId = column;
      } 
      else if (lowerColumn.includes('first') || lowerColumn === 'fname' || lowerColumn === 'firstname') {
        mapping.firstName = column;
      }
      else if (lowerColumn.includes('last') || lowerColumn === 'lname' || lowerColumn === 'lastname') {
        mapping.lastName = column;
      }
      else if (lowerColumn.includes('email') || lowerColumn.includes('mail')) {
        mapping.email = column;
      }
    });
    
    setFieldMapping(mapping);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus("idle");
    
    // Reset column mapping state
    setFileColumns([]);
    setFieldMapping({
      badgeId: '',
      firstName: '',
      lastName: '',
      email: '',
    });
    
    // Check if file is CSV or Excel
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      handleCsvPreview(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      handleExcelPreview(file);
    } else {
      setUploadStatus("error");
      alert("Unsupported file format. Please upload a CSV or Excel file.");
      setSelectedFile(null);
    }
  };

  const handleCsvPreview = (file: File) => {
    // Preview the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const csvText = event.target.result.toString();
      const lines = csvText.split("\n");
      
      if (lines.length > 0) {
        const headers = lines[0].split(",").map(header => header.trim());
        setFileColumns(headers);
        
        // Try to auto-map columns
        autoMapColumns(headers);
        
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(",").map(value => value.trim());
          return headers.reduce<Record<string, string>>((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        
        setPreviewData(data);
        
        // Move to mapping step if we have data to work with
        if (data.length > 0) {
          setUploadStep('map');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExcelPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        // Parse Excel file
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });
        
        if (jsonData.length > 0) {
          // First row contains headers
          const headers = Object.keys(jsonData[0]).length > 0 
            ? Object.values(jsonData[0]).map(String) 
            : [];
          setFileColumns(headers);
          
          // Try to auto-map columns
          autoMapColumns(headers);
          
          // Process data rows (limited to 5 rows for preview)
          const rows = jsonData.slice(1, 6).map(row => {
            const rowData = Object.values(row);
            return headers.reduce<Record<string, string | number>>((obj, header, index) => {
              obj[header] = rowData[index] || '';
              return obj;
            }, {});
          });
          
          setPreviewData(rows);
          
          // Move to mapping step if we have data to work with
          if (rows.length > 0) {
            setUploadStep('map');
          }
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the file format.');
      }
    };
    
    // Use arraybuffer for Excel files
    reader.readAsBinaryString(file);
  };

  const handleFieldMappingChange = (field: RequiredField, column: string) => {
    setFieldMapping({
      ...fieldMapping,
      [field]: column
    });
  };

  const isFieldMappingComplete = () => {
    // Check if all required fields have been mapped
    return REQUIRED_FIELDS.every(field => fieldMapping[field] !== '');
  };

  const moveToReviewStep = () => {
    if (isFieldMappingComplete()) {
      setUploadStep('review');
    } else {
      alert('Please map all required fields before proceeding.');
    }
  };

  const backToMapStep = () => {
    setUploadStep('map');
  };

  const backToSelectStep = () => {
    setUploadStep('select');
    setSelectedFile(null);
    setPreviewData([]);
    setFileColumns([]);
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedEvent) {
      alert("Please select both an event and a file before uploading");
      return;
    }

    if (!isFieldMappingComplete()) {
      alert("Please map all required fields before uploading");
      return;
    }

    setUploadStatus("uploading");

    // Simulating upload with setTimeout
    // In a real app, you would send the file, event ID, and field mapping to the server
    setTimeout(() => {
      setUploadStatus("success");
    }, 1500);
  };

  // Generates a transformed preview with the mapped columns
  const getMappedPreview = () => {
    if (previewData.length === 0) return [];
    
    return previewData.map(row => {
      const mappedRow: Record<string, string | number | null> = {};
      
      REQUIRED_FIELDS.forEach(field => {
        const sourceColumn = fieldMapping[field];
        mappedRow[field] = sourceColumn ? row[sourceColumn] : null;
      });
      
      return mappedRow;
    });
  };

  const renderSelectStep = () => (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        {/* Event Selection Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Event
          </label>
          <select 
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Attendee File
          </label>
          <p className="text-sm text-gray-500">
            File should contain columns for: Badge ID, First Name, Last Name, Email
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex-1">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV or Excel files (.xlsx, .xls)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-center h-32 text-gray-500">
            Select a file to continue
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapStep = () => (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Map File Columns</h2>
      <p className="text-sm text-gray-500 mb-6">
        Match your file columns to the required fields. All fields are mandatory.
      </p>

      <div className="space-y-4 mb-8">
        {REQUIRED_FIELDS.map((field) => (
          <div key={field} className="flex items-center">
            <div className="w-1/4">
              <label className="block text-sm font-medium">
                {field === 'badgeId' ? 'Badge ID' : 
                 field === 'firstName' ? 'First Name' : 
                 field === 'lastName' ? 'Last Name' : 'Email'}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="w-24 flex items-center justify-center">
              <FiArrowRight className="text-gray-400" />
            </div>
            
            <div className="flex-1">
              <select
                value={fieldMapping[field]}
                onChange={(e) => handleFieldMappingChange(field, e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                required
              >
                <option value="">-- Select column --</option>
                {fileColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Preview of raw data with horizontal scroll */}
      <div className="mt-8">
        <h3 className="font-medium mb-3">File Preview:</h3>
        <div className="overflow-x-auto border rounded-md" style={{ maxWidth: '100%' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fileColumns.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {fileColumns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {row[column]?.toString() || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          variant="ghost" 
          onClick={backToSelectStep}
        >
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={moveToReviewStep} 
          disabled={!isFieldMappingComplete()}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const mappedPreview = getMappedPreview();
    
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Review & Upload</h2>

        <div className="mb-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-3">Upload Details:</h3>
            <p className="text-sm mb-2">
              <strong>Event:</strong> {events.find(e => e.id === selectedEvent)?.name}
            </p>
            <p className="text-sm mb-4">
              <strong>File:</strong> {selectedFile?.name} ({(selectedFile?.size || 0 / 1024).toFixed(2)} KB)
            </p>
          </div>
        </div>

        {/* Preview of mapped data with horizontal scroll */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Data Preview (After Mapping):</h3>
          <div className="overflow-x-auto border rounded-md" style={{ maxWidth: '100%' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {REQUIRED_FIELDS.map((field) => (
                    <th
                      key={field}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {field === 'badgeId' ? 'Badge ID' : 
                       field === 'firstName' ? 'First Name' : 
                       field === 'lastName' ? 'Last Name' : 'Email'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappedPreview.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {REQUIRED_FIELDS.map((field, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {row[field]?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="ghost"
            onClick={backToMapStep}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload List"}
          </Button>
        </div>
        
        {uploadStatus === "success" && (
          <div className="mt-4 flex items-center justify-center text-sm text-green-600 p-3 bg-green-50 rounded-md">
            <FiCheckCircle className="mr-2" />
            Upload Successful!
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Attendee List</h1>
      
      {/* Progress tabs - styled to match the screenshot */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-6 py-2 text-sm font-medium border-b-2 -mb-px ${
            uploadStep === 'select' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
          onClick={() => uploadStep !== 'select' && backToSelectStep()}
        >
          1. Select File
        </button>
        <button 
          className={`px-6 py-2 text-sm font-medium border-b-2 -mb-px ${
            uploadStep === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          } ${uploadStep === 'select' ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={() => uploadStep === 'review' && backToMapStep()}
          disabled={uploadStep === 'select'}
        >
          2. Map Columns
        </button>
        <button 
          className={`px-6 py-2 text-sm font-medium border-b-2 -mb-px ${
            uploadStep === 'review' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          } cursor-not-allowed ${uploadStep !== 'review' ? 'opacity-50' : ''}`}
          disabled={uploadStep !== 'review'}
        >
          3. Review & Upload
        </button>
      </div>

      {uploadStep === 'select' && renderSelectStep()}
      {uploadStep === 'map' && renderMapStep()}
      {uploadStep === 'review' && renderReviewStep()}
    </div>
  );
}
