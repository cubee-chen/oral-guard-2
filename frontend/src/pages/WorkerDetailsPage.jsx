// src/pages/WorkerDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientList from '../components/worker/PatientList';
import DutyVerificationList from '../components/facility/DutyVerificationList';
import '../styles/pages/WorkerDetailsPage.css';

const WorkerDetailsPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [patients, setPatients] = useState([]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch worker details and patients
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        setLoading(true);
        
        // Get worker details (using the first patient's data since we don't have a dedicated endpoint)
        const workersResponse = await api.get('/api/facility/workers');
        const workerData = workersResponse.data.workers.find(w => w._id === workerId);
        
        if (!workerData) {
          throw new Error('Worker not found');
        }
        
        setWorker(workerData);
        
        // Get patients for this worker
        const patientsResponse = await api.get(`/api/facility/workers/${workerId}/patients`);
        setPatients(patientsResponse.data.patients);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load worker details. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchWorkerDetails();
  }, [workerId, navigate]);

  // Fetch daily duties for this worker
  useEffect(() => {
    const fetchDailyDuties = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/api/facility/duties/daily?date=${dateStr}`);
        
        // Find duties for this worker
        const workerDuties = response.data.dutyByWorker.find(
          item => item.worker._id === workerId
        );
        
        setDuties(workerDuties ? workerDuties.duties : []);
      } catch (err) {
        console.error('Failed to load daily duties:', err);
        // Don't set error state here to avoid disrupting the whole page
      }
    };

    fetchDailyDuties();
  }, [workerId, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleVerifyDuty = async (dutyId) => {
    try {
      setLoading(true);
      await api.patch(`/api/facility/duties/${dutyId}/verify`);
      
      // Update local state
      setDuties(duties.map(duty => {
        if (duty._id === dutyId) {
          return { ...duty, verified: true };
        }
        return duty;
      }));
      
      setLoading(false);
    } catch (err) {
      setError('Failed to verify duty. Please try again.');
      setLoading(false);
    }
  };

  // Format date for date input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading && !worker) {
    return <LoadingSpinner />;
  }

  return (
    <div className="worker-details-container">
      <Link to="/facility/dashboard" className="back-link">
        ← Back to dashboard
      </Link>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {worker && (
        <div className="worker-profile">
          <div className="worker-header">
            <div className="worker-info-main">
              <h1 className="worker-name">
                {worker.firstName} {worker.lastName}
              </h1>
              <p className="worker-email">{worker.email}</p>
              {worker.specialization && (
                <p className="worker-specialization">
                  Specialization: {worker.specialization}
                </p>
              )}
              {worker.licenseNumber && (
                <p className="worker-license">
                  License: {worker.licenseNumber}
                </p>
              )}
            </div>
            
            <div className="worker-actions">
              <Link
                to={`/facility/workers/${workerId}/add-patient`}
                className="add-patient-btn"
              >
                Add Patient
              </Link>
            </div>
          </div>
          
          <div className="patients-duties-container">
            <div className="patients-section">
              <h2 className="section-title">Patients</h2>
              
              <PatientList
                patients={patients}
                isWorkerView={false}
              />
            </div>
            
            <div className="duties-section">
              <div className="duties-header">
                <h2 className="section-title">Daily Duties</h2>
                <div className="date-selector">
                  <label htmlFor="duty-date-select">Date:</label>
                  <input
                    type="date"
                    id="duty-date-select"
                    value={formatDateForInput(selectedDate)}
                    onChange={handleDateChange}
                    max={formatDateForInput(new Date())}
                  />
                </div>
              </div>
              
              <DutyVerificationList
                duties={duties}
                onVerifyDuty={handleVerifyDuty}
              />
            </div>
          </div>
        </div>
      )}
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

export default WorkerDetailsPage;