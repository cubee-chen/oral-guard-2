// src/pages/AddWorker.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages/AddForm.css';

const AddWorker = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    specialization: '',
    licenseNumber: ''
  });
  
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
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
      const { confirmPassword, ...workerData } = formData;
      
      // Add worker to facility via API
      await api.post('/api/facility/workers', workerData);
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to facility dashboard after a delay
      setTimeout(() => {
        navigate('/facility/dashboard');
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add worker');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <Link to="/facility/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1 className="form-title">Add New Care Worker</h1>
      </div>
      
      <div className="form-card">
        {formError && <div className="alert alert-error">{formError}</div>}
        
        {success ? (
          <div className="success-message">
            <h2>Worker Added Successfully!</h2>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-section">
              <h2 className="section-title">Worker Information</h2>
              
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
                  <label htmlFor="specialization" className="form-label">Specialization</label>
                  <input 
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="E.g., Oral Care, Elder Care"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="licenseNumber" className="form-label">License/Certificate Number</label>
                  <input 
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter license or certificate number"
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
                The worker will use these credentials to log into the system.
              </p>
            </div>
            
            <div className="form-actions">
              <Link to="/facility/dashboard" className="cancel-button">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Add Worker'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddWorker;