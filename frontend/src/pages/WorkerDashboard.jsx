// src/pages/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientList from '../components/worker/PatientList';
import DailyDutiesList from '../components/worker/DailyDutiesList';
import '../styles/pages/WorkerDashboard.css';

const WorkerDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [todayDuties, setTodayDuties] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch patients and today's duties on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get patients
        const patientsResponse = await api.get('/api/worker/patients');
        setPatients(patientsResponse.data.patients);
        
        // Get today's duties from facility API
        const today = new Date().toISOString().split('T')[0];
        const dutiesResponse = await api.get(`/api/facility/duties/daily?date=${today}`);
        
        // Find duties for this worker
        const allDuties = [];
        dutiesResponse.data.dutyByWorker.forEach(item => {
          allDuties.push(...item.duties);
        });
        
        setTodayDuties(allDuties);
        
        // Calculate completion stats
        const completed = allDuties.filter(duty => duty.completed).length;
        setCompletedCount(completed);
        setTotalCount(allDuties.length);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleCompleteDuty = async (dutyId) => {
    try {
      setLoading(true);
      await api.patch(`/api/worker/duties/${dutyId}/complete`);
      
      // Update local state
      setTodayDuties(todayDuties.map(duty => {
        if (duty._id === dutyId) {
          return { ...duty, completed: true };
        }
        return duty;
      }));
      
      // Update completion stats
      setCompletedCount(prev => prev + 1);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to mark duty as completed. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !patients.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Care Worker Dashboard</h1>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="summary-stats">
        <div className="stat-card">
          <h3 className="stat-title">Today's Progress</h3>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="stat-value">{completedCount} of {totalCount} patients</p>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="sidebar">
          <div className="patients-header">
            <h2 className="section-title">Your Patients</h2>
          </div>
          
          <PatientList 
            patients={patients} 
            isWorkerView={true}
          />
        </div>
        
        <div className="main-content">
          <div className="duties-section">
            <h2 className="section-title">Today's Duties</h2>
            
            <DailyDutiesList 
              duties={todayDuties}
              onCompleteDuty={handleCompleteDuty}
            />
          </div>
        </div>
      </div>
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

export default WorkerDashboard;