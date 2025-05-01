// components/dentist/PatientDetails.jsx
import React, { useState } from 'react';
import PatientRecordChart from '../common/PatientRecordChart';
import { API_HOST } from '../../utils/apiHost';
import '../../styles/pages/PatientDetailsPage.css';
import LazyImage from '../common/LazyImage';

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

  const getImageUrl = (id) => `${API_HOST}/api/upload/image/${id}`;

  return (
    <div className="patient-details">
      <div className="patient-header">
        <h2 className="patient-name">
          {patient.firstName} {patient.lastName}
        </h2>
        <div className="patient-info-grid">
          <div className="patient-info-item">
            <span className="info-label">Email:</span> {patient.email}
          </div>
          {patient.dateOfBirth && (
            <div className="patient-info-item">
              <span className="info-label">Date of Birth:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Oral Health Chart */}
      <div className="chart-section">
        <h3 className="section-title">Oral Health Progress</h3>
        {record && record.entries.length > 0 ? (
          <PatientRecordChart recordData={record} />
        ) : (
          <div className="chart-placeholder">
            <p>No data available for this patient yet.</p>
          </div>
        )}
      </div>

      {/* Uploads Section */}
      <div className="uploads-section">
        <h3 className="section-title">Uploaded Images</h3>
        
        {uploads.length === 0 ? (
          <div className="empty-uploads">
            <p>No uploads available for this patient yet.</p>
          </div>
        ) : (
          <div>
            {/* Upload selection tabs */}
            <div className="upload-tabs">
              {uploads.map(upload => (
                <button
                  key={upload._id}
                  className={`upload-tab-button ${
                    selectedUpload && selectedUpload._id === upload._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  {new Date(upload.uploadDate).toLocaleDateString()}
                  {!upload.reviewedByDentist && (
                    <span className="new-badge">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedUpload && (
              <div>
                {/* Images display */}
                <div className="image-grid">
                  <div className="image-container">
                    <h4 className="image-title">Left Profile</h4>
                    <div className="image-wrapper">
                      <LazyImage
                        src={getImageUrl(selectedUpload.processedLeftImage || selectedUpload.leftProfileImage)}
                        alt="Left profile"
                        className="patient-image"
                      />
                    </div>
                  </div>
                  <div className="image-container">
                    <h4 className="image-title">Front View</h4>
                    <div className="image-wrapper">
                      <LazyImage
                        src={getImageUrl(selectedUpload.processedFrontalImage || selectedUpload.frontalImage)}
                        alt="Front view"
                        className="patient-image"
                      />
                    </div>
                  </div>
                  <div className="image-container">
                    <h4 className="image-title">Right Profile</h4>
                    <div className="image-wrapper">
                      <LazyImage
                        src={getImageUrl(selectedUpload.processedRightImage || selectedUpload.rightProfileImage)}
                        alt="Right profile"
                        className="patient-image"
                      />
                    </div>
                  </div>
                </div>

                {/* Analysis results */}
                {selectedUpload.status === 'completed' && selectedUpload.analysisResults && (
                  <div className="analysis-results">
                    <h4 className="analysis-title">Analysis Results</h4>
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <p className="metric-label">Plaque Coverage</p>
                        <p className="metric-value">
                          {selectedUpload.analysisResults.plaqueCoverage?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="metric-card">
                        <p className="metric-label">Gingival Inflammation</p>
                        <p className="metric-value">
                          {selectedUpload.analysisResults.gingivalInflammation?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="metric-card">
                        <p className="metric-label">Tartar</p>
                        <p className="metric-value">
                          {selectedUpload.analysisResults.tartar?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comment section */}
                <div className="comments-section">
                  <h4 className="comments-title">Dentist Notes</h4>
                  {selectedUpload.comment ? (
                    <div className="comment-box">
                      <p className="comment-text">{selectedUpload.comment.content}</p>
                      <p className="comment-meta">
                        Last updated: {new Date(selectedUpload.comment.updatedAt || selectedUpload.comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="no-comments">No notes yet. Add your observations below.</p>
                  )}

                  <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                      className="comment-textarea"
                      rows="4"
                      placeholder="Add your observations and recommendations for the patient..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button
                      type="submit"
                      className="submit-comment"
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