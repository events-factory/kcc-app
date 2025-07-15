'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FiUpload,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  attendeeService,
  BulkUploadData,
  CreateAttendeeData as ImportedCreateAttendeeData,
  BulkUploadResponse,
} from '@/services/attendee-service';
import { eventService } from '@/services/event-service';
import { Event } from '@/types';

// Define type for preview data
type PreviewRow = Record<string, string | number | null>;

// Define required fields for attendees
type RequiredField = 'badgeId';
type OptionalField = 'firstName' | 'lastName' | 'email';

const REQUIRED_FIELDS: RequiredField[] = ['badgeId'];
const OPTIONAL_FIELDS: OptionalField[] = ['firstName', 'lastName', 'email'];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export default function UploadPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadResult, setUploadResult] = useState<{
    createdCount: number;
    errorCount: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);

  // Field mapping: key is the field name, value is the column from the file
  const [fieldMapping, setFieldMapping] = useState<
    Record<RequiredField | OptionalField, string>
  >({
    firstName: '',
    lastName: '',
    email: '',
    badgeId: '',
  });

  // Load the current event
  useEffect(() => {
    if (eventId) {
      eventService
        .getEvent(eventId)
        .then((event) => {
          setCurrentEvent(event);
        })
        .catch(console.error);
    }
  }, [eventId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setFileColumns(headers);

          // Auto-map common column names
          const autoMapping: Record<string, string> = {};
          headers.forEach((header) => {
            const lowerHeader = header.toLowerCase();
            if (
              lowerHeader.includes('badge') ||
              lowerHeader.includes('id') ||
              lowerHeader === 'badgeid'
            ) {
              autoMapping.badgeId = header;
            } else if (lowerHeader.includes('first') || lowerHeader === 'firstname') {
              autoMapping.firstName = header;
            } else if (
              lowerHeader.includes('last') ||
              lowerHeader === 'lastname'
            ) {
              autoMapping.lastName = header;
            } else if (lowerHeader.includes('email')) {
              autoMapping.email = header;
            }
          });

          setFieldMapping((prev) => ({ ...prev, ...autoMapping }));

          // Create preview data (first 5 rows)
          const previewRows = jsonData.slice(1, 6).map((rowData: unknown) => {
            const row = rowData as unknown[];
            const rowObject: PreviewRow = {};
            headers.forEach((header, index) => {
              const cellValue = row[index];
              rowObject[header] =
                cellValue === undefined || cellValue === null
                  ? null
                  : typeof cellValue === 'string' ||
                    typeof cellValue === 'number'
                  ? cellValue
                  : String(cellValue);
            });
            return rowObject;
          });
          setPreviewData(previewRows);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert("Error parsing file. Please make sure it's a valid Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFieldMappingChange = (
    field: RequiredField | OptionalField,
    column: string
  ) => {
    setFieldMapping((prev) => ({ ...prev, [field]: column }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !eventId) return;

    // Validate required field mappings
    const missingRequiredFields = REQUIRED_FIELDS.filter(
      (field) => !fieldMapping[field]
    );
    if (missingRequiredFields.length > 0) {
      alert(
        `Please map the following required fields: ${missingRequiredFields.join(
          ', '
        )}`
      );
      return;
    }

    setUploadStatus('uploading');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1) as unknown[][];

          const attendeesToCreate: ImportedCreateAttendeeData[] = [];
          const errors: Array<{ row: number; error: string }> = [];

          dataRows.forEach((row: unknown[], index) => {
            const rowData: Record<string, unknown> = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = row[colIndex];
            });

            // Map fields based on user selection
            const attendeeData: ImportedCreateAttendeeData = {
              eventId: eventId,
              badgeId: '',
              firstName: '',
              lastName: '',
              email: '',
            };

            // Map required fields
            REQUIRED_FIELDS.forEach((field) => {
              const column = fieldMapping[field];
              if (column && rowData[column]) {
                if (field === 'badgeId') {
                  attendeeData.badgeId = String(rowData[column]).trim();
                }
              }
            });

            // Map optional fields
            OPTIONAL_FIELDS.forEach((field) => {
              const column = fieldMapping[field];
              if (column && rowData[column]) {
                if (field === 'firstName') {
                  attendeeData.firstName = String(rowData[column]).trim();
                } else if (field === 'lastName') {
                  attendeeData.lastName = String(rowData[column]).trim();
                } else if (field === 'email') {
                  attendeeData.email = String(rowData[column]).trim();
                }
              }
            });

            // Validate required fields - badgeId is required
            const missingFields = REQUIRED_FIELDS.filter(
              (field) => !attendeeData[field]
            );
            if (missingFields.length > 0) {
              errors.push({
                row: index + 2, // +2 because row 1 is header and we're 0-indexed
                error: `Missing required fields: ${missingFields.join(', ')}`,
              });
              return;
            }

            attendeesToCreate.push(attendeeData);
          });

          if (attendeesToCreate.length === 0) {
            setUploadStatus('error');
            setUploadResult({
              createdCount: 0,
              errorCount: errors.length,
              errors,
            });
            return;
          }

          // Use bulk upload instead of individual uploads
          try {
            const bulkData: BulkUploadData = {
              attendeesData: attendeesToCreate,
              eventId: eventId,
            };

            const result: BulkUploadResponse =
              await attendeeService.bulkUploadAttendees(bulkData);

            setUploadResult({
              createdCount: result.createdCount,
              errorCount: result.errorCount,
              errors: result.errors,
            });

            setUploadStatus(result.errorCount === 0 ? 'success' : 'error');
          } catch (error) {
            console.error('Bulk upload error:', error);
            setUploadStatus('error');
            setUploadResult({
              createdCount: 0,
              errorCount: 1,
              errors: [{ row: 0, error: 'Failed to upload attendees' }],
            });
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadStatus('error');
          setUploadResult({
            createdCount: 0,
            errorCount: 1,
            errors: [{ row: 0, error: 'Failed to process file' }],
          });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setPreviewData([]);
    setFileColumns([]);
    setFieldMapping({
      badgeId: '',
      firstName: '',
      lastName: '',
      email: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/events/${eventId}`}>
            <Button
              variant="ghost"
              className="mb-2 -ml-3 flex items-center gap-1"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Upload Attendees</h1>
          {currentEvent && (
            <p className="text-gray-600">Event: {currentEvent.name}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">Upload Excel File</h2>

        {uploadStatus === 'idle' && (
          <>
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400"
              >
                <FiUpload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  Excel files (.xlsx, .xls) only
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm">
                  <strong>Selected file:</strong> {selectedFile.name}
                </p>
              </div>
            )}
          </>
        )}

        {/* Field Mapping Section */}
        {fileColumns.length > 0 && uploadStatus === 'idle' && (
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-medium">Map Fields</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {ALL_FIELDS.map((field) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {REQUIRED_FIELDS.includes(field as RequiredField) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    value={fieldMapping[field]}
                    onChange={(e) =>
                      handleFieldMappingChange(field, e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {fileColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        {previewData.length > 0 && uploadStatus === 'idle' && (
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-medium">Preview (First 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {fileColumns.map((column) => (
                      <th
                        key={column}
                        className="border border-gray-300 px-3 py-2 text-left text-sm font-medium"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {fileColumns.map((column) => (
                        <td
                          key={column}
                          className="border border-gray-300 px-3 py-2 text-sm"
                        >
                          {row[column] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        {uploadStatus === 'idle' && selectedFile && (
          <div className="flex gap-3">
            <Button onClick={handleUpload} className="flex items-center gap-2">
              <FiUpload className="h-4 w-4" />
              Upload Attendees
            </Button>
            <Button variant="outline" onClick={resetUpload}>
              Reset
            </Button>
          </div>
        )}

        {/* Upload Status */}
        {uploadStatus === 'uploading' && (
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="mt-2">Uploading attendees...</p>
          </div>
        )}

        {uploadStatus === 'success' && uploadResult && (
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Upload Successful!</h3>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Successfully created {uploadResult.createdCount} attendees.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href={`/dashboard/events/${eventId}`}>
                <Button className="flex items-center gap-2">
                  View Event Dashboard
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={resetUpload}>
                Upload Another File
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && uploadResult && (
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="font-medium text-red-800">
              Upload Completed with Errors
            </h3>
            <p className="mt-2 text-sm text-red-700">
              Created {uploadResult.createdCount} attendees,{' '}
              {uploadResult.errorCount} errors.
            </p>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-800">Errors:</h4>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">
                      Row {error.row}: {error.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={resetUpload}>
                Try Again
              </Button>
              <Link href={`/dashboard/events/${eventId}`}>
                <Button>Go to Event Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
