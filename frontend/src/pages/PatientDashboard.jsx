import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientRecordChart from '../components/common/PatientRecordChart';
import UploadHistory from '../components/patient/UploadHistory';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">       
          <div className="mt-6">
            <Link 
              to="/patient/upload"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center px-4 py-2 rounded"
            >
              Upload New Images
            </Link>
          </div>
        </div>
        
        {/* Oral Health Record Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Oral Health Status</h2>
          {chartData ? (
            <PatientRecordChart recordData={chartData} />
          ) : (
            <div className="bg-gray-100 p-6 rounded text-center">
              <p className="text-gray-500">
                No data available yet. Upload your first set of images to begin tracking.
              </p>
            </div>
          )}
        </div>
        
        {/* Upload History */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload History</h2>
          {uploads && uploads.length > 0 ? (
            <UploadHistory uploads={uploads} />
          ) : (
            <div className="bg-gray-100 p-6 rounded text-center">
              <p className="text-gray-500">
                No uploads yet. Upload your first set of images to begin.
              </p>
            </div>
          )}
        </div>
      </div>
  )
};

export default PatientDashboard;