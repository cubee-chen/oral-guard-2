// src/pages/AddPatient.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages/AddForm.css';

const AddPatient = () => {
  const { workerId } = useParams();
  const [workerInfo, setWorkerInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Fetch worker info
  useEffect(() => {
    const fetchWorkerInfo = async () => {
      try {
        const response = await api.get('/api/facility/workers');
        const worker = response.data.workers.find(w => w._id === workerId);
        
        if (worker) {
          setWorkerInfo(worker);
        } else {
          setFormError('Worker not found');
        }
      } catch (err) {
        setFormError('Failed to load worker information');
        
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };
    
    fetchWorkerInfo();
  }, [workerId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      setFormError('Please fill all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Remove confirmPassword as it's not needed in API call
      const { confirmPassword, ...patientData } = formData;
      
      // Add patient to worker via API
      await api.post(`/api/facility/workers/${workerId}/patients`, patientData);
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to worker details page after a delay
      setTimeout(() => {
        navigate(`/facility/workers/${workerId}`);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add patient');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <Link to={`/facility/workers/${workerId}`} className="back-link">
          ← Back to Worker Details
        </Link>
        <h1 className="form-title">
          Add New Patient {workerInfo && `for ${workerInfo.firstName} ${workerInfo.lastName}`}
        </h1>
      </div>
      
      <div className="form-card">
        {formError && <div className="alert alert-error">{formError}</div>}
        
        {success ? (
          <div className="success-message">
            <h2>Patient Added Successfully!</h2>
            <p>Redirecting to worker details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-section">
              <h2 className="section-title">Patient Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name*</label>
                  <input 
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name*</label>
                  <input 
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email*</label>
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">Date of Birth*</label>
                  <input 
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="form-input"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2 className="section-title">Account Credentials</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password*</label>
                  <input 
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create a password"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password*</label>
                  <input 
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
              
              <p className="form-helper-text">
                The patient will use these credentials to log into the system.
              </p>
            </div>
            
            <div className="form-actions">
              <Link to={`/facility/workers/${workerId}`} className="cancel-button">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Add Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPatient;