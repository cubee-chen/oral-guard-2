// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient', // Default role
    specialization: '',
    licenseNumber: '',
    dateOfBirth: ''
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { register } = useAuth();
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
    
    if (formData.role === 'worker' && (!formData.specialization || !formData.licenseNumber)) {
      setFormError('Specialization and license number are required for care workers');
      return false;
    }
    
    if (formData.role === 'facility' && !formData.licenseNumber) {
      setFormError('License or registration number is required for facilities');
      return false;
    }
    
    if (formData.role === 'patient' && !formData.dateOfBirth) {
      setFormError('Date of birth is required for patients');
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
      setIsSubmitting(true);
      // Remove confirmPassword as it's not needed in API call
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      setRegistrationSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join OralGuard today</p>
        
        {formError && <div className="error-message">{formError}</div>}
        {registrationSuccess && (
          <div className="success-message">
            Registration successful! Redirecting to login...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">I am a*</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="patient">Patient</option>
              <option value="worker">Care Worker</option>
              <option value="facility">Care Facility</option>
            </select>
          </div>
          
          {formData.role === 'worker' && (
            <>
              <div className="form-group">
                <label htmlFor="specialization">Specialization*</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="E.g., Oral Care, Geriatric Care"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="licenseNumber">License/Certificate Number*</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter your license or certification number"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </>
          )}
          
          {formData.role === 'facility' && (
            <div className="form-group">
              <label htmlFor="licenseNumber">Facility Registration Number*</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter your facility registration number"
                disabled={isSubmitting}
                required
              />
            </div>
          )}
          
          {formData.role === 'patient' && (
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth*</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;