// components/patient/UploadHistory.jsx
import React, { useState } from 'react';

const UploadHistory = ({ uploads }) => {
  const [selectedUpload, setSelectedUpload] = useState(uploads[0] || null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imageId) => {
    return `/api/upload/image/${imageId}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            Unknown
          </span>
        );
    }
  };

  return (
    <div>
      {/* Upload history table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dentist Review
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uploads.map((upload) => (
              <tr
                key={upload._id}
                className={selectedUpload?._id === upload._id ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(upload.uploadDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(upload.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {upload.reviewedByDentist ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Reviewed
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedUpload(upload)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected upload details */}
      {selectedUpload && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">
            Upload from {formatDate(selectedUpload.uploadDate)}
          </h3>
          
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h4 className="font-medium mb-2">Left Profile</h4>
              <img
                src={getImageUrl(selectedUpload.processedLeftImage || selectedUpload.leftProfileImage)}
                alt="Left profile"
                className="w-full rounded border"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Front View</h4>
              <img
                src={getImageUrl(selectedUpload.processedFrontalImage || selectedUpload.frontalImage)}
                alt="Front view"
                className="w-full rounded border"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Right Profile</h4>
              <img
                src={getImageUrl(selectedUpload.processedRightImage || selectedUpload.rightProfileImage)}
                alt="Right profile"
                className="w-full rounded border"
              />
            </div>
          </div>
          
          {/* Analysis results */}
          {selectedUpload.status === 'completed' && selectedUpload.analysisResults && (
            <div className="bg-white p-4 rounded mb-6 shadow-sm">
              <h4 className="font-medium mb-3">Analysis Results</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded shadow-sm border">
                  <p className="text-sm text-gray-500">Plaque Coverage</p>
                  <p className="text-lg font-medium">
                    {selectedUpload.analysisResults.plaqueCoverage?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded shadow-sm border">
                  <p className="text-sm text-gray-500">Gingival Inflammation</p>
                  <p className="text-lg font-medium">
                    {selectedUpload.analysisResults.gingivalInflammation?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded shadow-sm border">
                  <p className="text-sm text-gray-500">Tartar</p>
                  <p className="text-lg font-medium">
                    {selectedUpload.analysisResults.tartar?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Dentist comment */}
          <div className="mb-3">
            <h4 className="font-medium mb-2">Dentist Notes</h4>
            {selectedUpload.comment ? (
              <div className="bg-white p-4 rounded border">
                <p>{selectedUpload.comment.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(selectedUpload.comment.updatedAt || selectedUpload.comment.createdAt)}
                </p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-500">No dentist notes available yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;