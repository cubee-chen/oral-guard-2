// src/pages/FacilityDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WorkerList from '../components/facility/WorkerList';
import HygieneStatsChart from '../components/facility/HygieneStatsChart';
import '../styles/pages/FacilityDashboard.css';

const FacilityDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hygieneStats, setHygieneStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch workers on component mount
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/facility/workers');
        setWorkers(response.data.workers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load workers. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchWorkers();
  }, [navigate]);

  // Fetch hygiene statistics when selected date changes
  useEffect(() => {
    const fetchHygieneStats = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/api/facility/statistics/hygiene?date=${dateStr}`);
        setHygieneStats(response.data);
      } catch (err) {
        console.error('Failed to load hygiene statistics:', err);
        // Don't set error state here to avoid disrupting the whole dashboard
      }
    };

    fetchHygieneStats();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleRemoveWorker = async (workerId) => {
    try {
      setLoading(true);
      await api.delete(`/api/facility/workers/${workerId}`);
      setWorkers(workers.filter(worker => worker._id !== workerId));
      setLoading(false);
    } catch (err) {
      setError('Failed to remove worker. Please try again.');
      setLoading(false);
    }
  };

  // Format date for date input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading && !workers.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Facility Dashboard</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="dashboard-content">
        <div className="sidebar">
          <div className="worker-list-header">
            <h2 className="worker-list-title">Care Workers</h2>
            <Link 
              to="/facility/add-worker"
              className="add-worker-btn"
            >
              Add Worker
            </Link>
          </div>
          
          <WorkerList 
            workers={workers} 
            onRemoveWorker={handleRemoveWorker}
          />
        </div>
        
        <div className="main-content">
          <div className="hygiene-stats-section">
            <div className="stats-header">
              <h2 className="stats-title">Daily Oral Hygiene Statistics</h2>
              <div className="date-selector">
                <label htmlFor="date-select">Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={formatDateForInput(selectedDate)}
                  onChange={handleDateChange}
                  max={formatDateForInput(new Date())}
                />
              </div>
            </div>
            
            {hygieneStats ? (
              <div className="stats-content">
                <div className="stats-summary">
                  <div className="stat-card">
                    <h3 className="stat-title">Patients Cared For</h3>
                    <p className="stat-value">{hygieneStats.totalPatients}</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-title">Average Hygiene Score</h3>
                    <p className="stat-value">{hygieneStats.averageScore}/100</p>
                  </div>
                </div>
                
                <HygieneStatsChart data={hygieneStats.chartData} />
              </div>
            ) : (
              <div className="no-data-message">
                <p>No hygiene data available for this date.</p>
              </div>
            )}
          </div>
          
          <div className="daily-duties-section">
            <h2 className="section-title">
              Daily Duties Status
            </h2>
            <p className="section-description">
              Select a worker from the list to view and verify their daily duties.
            </p>
          </div>
        </div>
      </div>
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

export default FacilityDashboard;