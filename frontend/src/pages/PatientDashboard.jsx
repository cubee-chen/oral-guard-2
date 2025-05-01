// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientRecordChart from '../components/common/PatientRecordChart';
import UploadHistory from '../components/patient/UploadHistory';
import '../styles/pages/PatientDashboard.css';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Get profile, uploads, and record data in parallel
        const [profileRes, uploadsRes, recordRes] = await Promise.all([
          api.get('/api/patient/profile'),
          api.get('/api/patient/uploads'),
          api.get('/api/patient/record')
        ]);
        
        setProfile(profileRes.data.patient);
        setUploads(uploadsRes.data.uploads);
        setRecord(recordRes.data.record);
        
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

  const chartData = React.useMemo(()=>{
    if(!record || !record.entries.length) return null;
    return {
      dates:                record.entries.map(e=>e.date),
      plaqueCoverage:       record.entries.map(e=>e.plaqueCoverage*100), // % scale
      gingivalInflammation: record.entries.map(e=>e.gingivalInflammation*100),
      tartar:               record.entries.map(e=>e.tartar*100)
    };
  }, [record]);

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
          <Link 
            to="/patient/upload"
            className="upload-button"
          >
            Upload New Images
          </Link>
        </div>
        <p className="welcome-message">
          Track your oral health progress and get professional feedback from your dentist.
        </p>
      </div>
        
      {/* Oral Health Record Chart */}
      <div className="health-metrics">
        <div className="metrics-header">
          <h2 className="metrics-title">Oral Health Status</h2>
        </div>
        {chartData ? (
          <PatientRecordChart recordData={chartData} />
        ) : (
          <div className="no-data-message">
            <p>
              No data available yet. Upload your first set of images to begin tracking.
            </p>
          </div>
        )}
      </div>
        
      {/* Upload History */}
      <div className="history-section">
        <h2 className="history-header">Upload History</h2>
        {uploads && uploads.length > 0 ? (
          <UploadHistory uploads={uploads} />
        ) : (
          <div className="no-data-message">
            <p>
              No uploads yet. Upload your first set of images to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;