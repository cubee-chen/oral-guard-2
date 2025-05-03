// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientRecordChart from '../components/common/PatientRecordChart';
import AIRecommendations from '../components/common/AIRecommendations';
import '../styles/pages/PatientDashboard.css';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const navigate = useNavigate();

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Get profile, duties, and record data in parallel
        const [profileRes, dutiesRes, recordRes] = await Promise.all([
          api.get('/api/patient/profile'),
          api.get('/api/patient/duties/history'),
          api.get('/api/patient/record')
        ]);
        
        setProfile(profileRes.data.patient);
        setUploads(dutiesRes.data.duties || []);
        setRecord(recordRes.data.record);
        
        // Set the most recent upload as selected by default
        if (dutiesRes.data.duties && dutiesRes.data.duties.length > 0) {
          setSelectedUpload(dutiesRes.data.duties[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load your data. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchPatientData();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Transform the data for chart display
  const chartData = React.useMemo(() => {
    if (!record || !record.entries || record.entries.length === 0) return null;
    
    return {
      dates: record.entries.map(entry => entry.date),
      hygieneScores: record.entries.map(entry => entry.hygieneScore)
    };
  }, [record]);

  // Handle upload selection
  const handleUploadSelect = (upload) => {
    setSelectedUpload(upload);
  };

  if (loading && !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Patient Dashboard</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="welcome-card">
        <div className="welcome-header">
          <h2 className="welcome-title">Welcome, {profile?.firstName}</h2>
        </div>
        <p className="welcome-message">
          Track your oral health progress and get professional feedback from your care worker.
        </p>
        {profile?.worker && (
          <div className="care-worker-info">
            <p>Your care worker: <strong>{profile.worker.firstName} {profile.worker.lastName}</strong></p>
          </div>
        )}
      </div>
        
      {/* Oral Health Record Chart */}
      <div className="health-metrics">
        <div className="metrics-header">
          <h2 className="metrics-title">Oral Health History</h2>
        </div>
        {chartData ? (
          <PatientRecordChart recordData={chartData} />
        ) : (
          <div className="no-data-message">
            <p>
              No data available yet. Your care worker will upload your first oral assessment soon.
            </p>
          </div>
        )}
      </div>
        
      {/* Latest Assessment */}
      {selectedUpload && (
        <div className="latest-assessment">
          <h2 className="section-header">Latest Assessment ({formatDate(selectedUpload.date)})</h2>
          
          <div className="assessment-details">
            <div className="score-card">
              <h3>Oral Hygiene Score</h3>
              <div className={`score-value ${getScoreClass(selectedUpload.hygieneScore)}`}>
                {selectedUpload.hygieneScore}/100
              </div>
            </div>
            
            {selectedUpload._id && (
              <AIRecommendations uploadId={selectedUpload._id} />
            )}
          </div>
        </div>
      )}
      
      {/* Care History */}
      <div className="care-history">
        <h2 className="section-header">Care History</h2>
        {uploads && uploads.length > 0 ? (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Care Worker</th>
                  <th>Hygiene Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload) => (
                  <tr 
                    key={upload._id}
                    className={selectedUpload?._id === upload._id ? 'selected' : ''}
                  >
                    <td>{formatDate(upload.date)}</td>
                    <td>{upload.worker?.firstName} {upload.worker?.lastName}</td>
                    <td>
                      {upload.hygieneScore ? (
                        <span className={`score-badge ${getScoreClass(upload.hygieneScore)}`}>
                          {upload.hygieneScore}/100
                        </span>
                      ) : (
                        <span className="no-score">Not assessed</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleUploadSelect(upload)}
                        className="view-button"
                      >
                        {selectedUpload?._id === upload._id ? 'Selected' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data-message">
            <p>No care records available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine class based on score
const getScoreClass = (score) => {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
};

export default PatientDashboard;