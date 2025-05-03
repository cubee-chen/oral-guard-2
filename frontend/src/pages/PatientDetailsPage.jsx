// src/pages/PatientDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIRecommendations from '../components/common/AIRecommendations';
import { API_HOST } from '../utils/apiHost';
import '../styles/pages/PatientDetailsPage.css';

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { isWorker } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [duty, setDuty] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpload, setSelectedUpload] = useState(null);

  // Fetch patient details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        
        // Different API endpoints based on role
        const endpoint = isWorker 
          ? `/api/worker/patients/${patientId}`
          : `/api/facility/patients/${patientId}`;
        
        const response = await api.get(endpoint);
        
        setPatient(response.data.patient);
        setDuty(response.data.todayDuty);
        setUploads(response.data.uploads || []);
        
        // Set latest upload as selected
        if (response.data.uploads && response.data.uploads.length > 0) {
          setSelectedUpload(response.data.uploads[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient details. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchPatientDetails();
  }, [patientId, navigate, isWorker]);

  const handleCompleteDuty = async () => {
    if (!duty) return;
    
    try {
      setLoading(true);
      await api.patch(`/api/worker/duties/${duty._id}/complete`);
      
      // Update local state
      setDuty({
        ...duty,
        completed: true
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to mark duty as completed. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (id) => `${API_HOST}/api/upload/image/${id}`;

  if (loading && !patient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="patient-details-container">
      <Link 
        to={isWorker ? "/worker/dashboard" : "/facility/dashboard"} 
        className="back-link"
      >
        ← Back to dashboard
      </Link>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {patient && (
        <>
          <div className="patient-header">
            <h1 className="patient-name">
              {patient.firstName} {patient.lastName}
            </h1>
            
            <div className="patient-info-grid">
              <div className="patient-info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{patient.email}</span>
              </div>
              
              {patient.dateOfBirth && (
                <div className="patient-info-item">
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">{formatDate(patient.dateOfBirth)}</span>
                </div>
              )}
            </div>
            
            {isWorker && duty && (
              <div className="patient-care-actions">
                <div className="duty-status">
                  <span className="status-label">Today's Care Status:</span>
                  {duty.completed ? (
                    <span className="status-badge status-completed">
                      Completed
                    </span>
                  ) : (
                    <span className="status-badge status-pending">
                      Pending
                    </span>
                  )}
                  
                  {duty.verified && (
                    <span className="status-badge status-verified">
                      Verified by Facility
                    </span>
                  )}
                </div>
                
                <div className="action-buttons">
                  {!duty.completed && (
                    <button
                      onClick={handleCompleteDuty}
                      className="complete-duty-btn"
                      disabled={duty.completed}
                    >
                      Mark Care as Completed
                    </button>
                  )}
                  
                  <Link
                    to={`/worker/patients/${patientId}/upload`}
                    className="upload-images-btn"
                  >
                    Upload Oral Images
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Latest assessment and uploads section */}
          <div className="uploads-section">
            <h2 className="section-title">Oral Care Assessments</h2>
            
            {uploads.length > 0 ? (
              <>
                <div className="upload-tabs">
                  {uploads.map((upload, index) => (
                    <button
                      key={upload._id}
                      className={`upload-tab-button ${selectedUpload?._id === upload._id ? 'active' : ''}`}
                      onClick={() => setSelectedUpload(upload)}
                    >
                      {formatDate(upload.uploadDate)}
                      {index === 0 && <span className="new-badge">Latest</span>}
                    </button>
                  ))}
                </div>
                
                {selectedUpload && (
                  <div className="upload-details">
                    {/* Images grid */}
                    <div className="image-grid">
                      {selectedUpload.leftProfileImage && (
                        <div className="image-container">
                          <h3 className="image-title">Left Profile</h3>
                          <div className="image-wrapper">
                            <img 
                              src={getImageUrl(selectedUpload.processedLeftImage || selectedUpload.leftProfileImage)} 
                              alt="Left profile" 
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedUpload.frontalImage && (
                        <div className="image-container">
                          <h3 className="image-title">Front View</h3>
                          <div className="image-wrapper">
                            <img 
                              src={getImageUrl(selectedUpload.processedFrontalImage || selectedUpload.frontalImage)} 
                              alt="Front view" 
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedUpload.rightProfileImage && (
                        <div className="image-container">
                          <h3 className="image-title">Right Profile</h3>
                          <div className="image-wrapper">
                            <img 
                              src={getImageUrl(selectedUpload.processedRightImage || selectedUpload.rightProfileImage)} 
                              alt="Right profile" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Analysis results */}
                    {selectedUpload.hygieneScore && (
                      <div className="analysis-results">
                        <h3 className="analysis-title">Analysis Results</h3>
                        <div className="metrics-grid">
                          <div className="metric-card">
                            <p className="metric-label">Oral Hygiene Score</p>
                            <p className={`metric-value ${getScoreClass(selectedUpload.hygieneScore)}`}>
                              {selectedUpload.hygieneScore}/100
                            </p>
                          </div>
                        </div>
                        
                        {/* AI Recommendations */}
                        {selectedUpload._id && (
                          <AIRecommendations uploadId={selectedUpload._id} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-uploads">
                <p>No oral assessments available for this patient yet.</p>
                {isWorker && (
                  <p>
                    <Link
                      to={`/worker/patients/${patientId}/upload`}
                      className="upload-link"
                    >
                      Upload the first assessment
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

// Helper function to get class based on score
const getScoreClass = (score) => {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
};

export default PatientDetailsPage;