// components/patient/UploadHistory.jsx
import React, { useState, useEffect } from 'react';
import { API_HOST } from '../../utils/apiHost';
import '../../styles/pages/PatientDashboard.css';

const UploadHistory = ({ uploads }) => {
  const [selectedUpload, setSelectedUpload] = useState(uploads[0] || null);
  const [list, setList] = useState(uploads);

  /* keep querying backend while at least one item is still working */
  useEffect(() => {
      const needPolling = list.some(u => ['pending','processing'].includes(u.status));
      if (!needPolling) return;
  
      const id = setInterval(async () => {
        try {
          const { data } = await api.get('/api/patient/uploads');
          setList(data.uploads);
        } catch { /* ignore */ }
      }, 3000);               // 3-second interval
  
      return () => clearInterval(id);
    }, [list]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (id) => `${API_HOST}/api/upload/image/${id}`;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return (
        <span className="status-badge status-processing">
           <svg className="animate-spin" viewBox="0 0 24 24" width="12" height="12"><circle cx="12" cy="12" r="10" strokeWidth="4" fill="none"/></svg>
            Processing
           </span>
        );
      case 'pending':
        return (
          <span className="status-badge status-pending">
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="status-badge status-completed">
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="status-badge status-failed">
            Failed
          </span>
        );
      default:
        return (
          <span className="status-badge">
            Unknown
          </span>
        );
    }
  };

  const handleToggle = (upload) => {
    setSelectedUpload(prev => 
      prev && prev._id === upload._id ? null : upload
    );
  };

  return (
    <div className="history-section">
      {/* Upload history table */}
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Dentist Review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload) => (
              <tr
                key={upload._id}
                className={selectedUpload?._id === upload._id ? 'selected' : ''}
              >
                <td>{formatDate(upload.uploadDate)}</td>
                <td>{getStatusBadge(upload.status)}</td>
                <td>
                  {upload.reviewedByDentist ? (
                    <span className="status-badge status-completed">
                      Reviewed
                    </span>
                  ) : (
                    <span className="status-badge">
                      Pending
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleToggle(upload)}
                    className="view-button"
                  >
                    {
                      selectedUpload?._id === upload._id ? 'Hide' : 'View'
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected upload details */}
      {selectedUpload && (
        <div className="upload-details">
          <h3 className="details-header">
            Upload from {formatDate(selectedUpload.uploadDate)}
          </h3>
          
          {/* Images */}
          <div className="images-grid">
            <div className="image-item">
              <h4 className="image-title">Left Profile</h4>
              <div className="image-frame">
                {selectedUpload.processedLeftImage ? (
                  <img
                    src={getImageUrl(selectedUpload.processedLeftImage)}
                    alt="Left profile"
                  />
                ) : (
                  <div className="image-placeholder">Processing...</div>
                )}
              </div>
            </div>
            <div className="image-item">
              <h4 className="image-title">Front View</h4>
              <div className="image-frame">
                {selectedUpload.processedFrontalImage ? (
                  <img
                    src={getImageUrl(selectedUpload.processedFrontalImage)}
                    alt="Front view"
                  />
                ) : (
                  <div className="image-placeholder">Processing...</div>
                )}
              </div>
            </div>
            <div className="image-item">
              <h4 className="image-title">Right Profile</h4>
              <div className="image-frame">
                {selectedUpload.processedRightImage ? (
                  <img
                    src={getImageUrl(selectedUpload.processedRightImage)}
                    alt="Right profile"
                  />
                ) : (
                  <div className="image-placeholder">Processing...</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Analysis results */}
          {selectedUpload.status === 'completed' && selectedUpload.analysisResults && (
            <div className="analysis-section">
              <h4 className="analysis-title">Analysis Results</h4>
              <div className="metrics-grid">
                <div className="metric-box">
                  <p className="metric-name">Plaque Coverage</p>
                  <p className="metric-value">
                    {selectedUpload.analysisResults.plaqueCoverage?.toFixed(1)}%
                  </p>
                </div>
                <div className="metric-box">
                  <p className="metric-name">Gingival Inflammation</p>
                  <p className="metric-value">
                    {selectedUpload.analysisResults.gingivalInflammation?.toFixed(1)}%
                  </p>
                </div>
                <div className="metric-box">
                  <p className="metric-name">Tartar</p>
                  <p className="metric-value">
                    {selectedUpload.analysisResults.tartar?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Dentist comment */}
          <div className="dentist-notes">
            <h4 className="notes-title">Dentist Notes</h4>
            {selectedUpload.comment ? (
              <div className="notes-content">
                <p className="notes-text">{selectedUpload.comment.content}</p>
                <p className="notes-timestamp">
                  {formatDate(selectedUpload.comment.updatedAt || selectedUpload.comment.createdAt)}
                </p>
              </div>
            ) : (
              <div className="notes-content">
                <p className="no-notes">No dentist notes available yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;