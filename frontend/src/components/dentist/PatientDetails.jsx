// components/dentist/PatientDetails.jsx
import React, { useState } from 'react';
import PatientRecordChart from '../common/PatientRecordChart';

const PatientDetails = ({ patient, uploads, record, onAddComment }) => {
  const [selectedUpload, setSelectedUpload] = useState(uploads.length > 0 ? uploads[0] : null);
  const [comment, setComment] = useState('');

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim() && selectedUpload) {
      onAddComment(selectedUpload._id, comment);
      setComment('');
    }
  };

  const getImageUrl = (imageId) => {
    return `/api/upload/image/${imageId}`;
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          {patient.firstName} {patient.lastName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1"><span className="font-medium">Email:</span> {patient.email}</p>
            {patient.dateOfBirth && (
              <p className="mb-1">
                <span className="font-medium">Date of Birth:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Oral Health Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Oral Health Progress</h3>
        {record && record.entries.length > 0 ? (
          <PatientRecordChart record={record} />
        ) : (
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-500">No data available for this patient yet.</p>
          </div>
        )}
      </div>

      {/* Uploads Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Uploaded Images</h3>
        
        {uploads.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-500">No uploads available for this patient yet.</p>
          </div>
        ) : (
          <div>
            {/* Upload selection tabs */}
            <div className="flex overflow-x-auto border-b mb-6">
              {uploads.map(upload => (
                <button
                  key={upload._id}
                  className={`px-4 py-2 whitespace-nowrap ${
                    selectedUpload && selectedUpload._id === upload._id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  {new Date(upload.uploadDate).toLocaleDateString()}
                  {!upload.reviewedByDentist && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedUpload && (
              <div>
                {/* Images display */}
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
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Plaque Coverage</p>
                        <p className="text-lg font-medium">
                          {selectedUpload.analysisResults.plaqueCoverage?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Gingival Inflammation</p>
                        <p className="text-lg font-medium">
                          {selectedUpload.analysisResults.gingivalInflammation?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-sm text-gray-500">Tartar</p>
                        <p className="text-lg font-medium">
                          {selectedUpload.analysisResults.tartar?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comment section */}
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Dentist Notes</h4>
                  {selectedUpload.comment ? (
                    <div className="bg-blue-50 p-4 rounded mb-4">
                      <p>{selectedUpload.comment.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Last updated: {new Date(selectedUpload.comment.updatedAt || selectedUpload.comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">No notes yet. Add your observations below.</p>
                  )}

                  <form onSubmit={handleSubmitComment}>
                    <textarea
                      className="w-full border rounded p-2 mb-2"
                      rows="4"
                      placeholder="Add your observations and recommendations for the patient..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                      disabled={!comment.trim()}
                    >
                      {selectedUpload.comment ? 'Update Notes' : 'Add Notes'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
