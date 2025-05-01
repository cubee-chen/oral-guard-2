// src/pages/PatientUpload.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages/PatientUpload.css';

const PatientUpload = () => {
  const [files, setFiles] = useState({
    leftProfileImage: null,
    frontalImage: null,
    rightProfileImage: null
  });
  const [previews, setPreviews] = useState({
    leftProfileImage: null,
    frontalImage: null,
    rightProfileImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (selectedFiles && selectedFiles[0]) {
      // Create file URL for preview
      const fileUrl = URL.createObjectURL(selectedFiles[0]);
      
      // Update files and previews
      setFiles(prevFiles => ({
        ...prevFiles,
        [name]: selectedFiles[0]
      }));
      
      setPreviews(prevPreviews => ({
        ...prevPreviews,
        [name]: fileUrl
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all images are provided
    if (!files.leftProfileImage || !files.frontalImage || !files.rightProfileImage) {
      setError('All three images are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('leftProfileImage', files.leftProfileImage);
      formData.append('frontalImage', files.frontalImage);
      formData.append('rightProfileImage', files.rightProfileImage);
      
      // Submit to API
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Images uploaded successfully! Processing will begin shortly.');
      setLoading(false);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <Link to="/patient/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1 className="upload-title">Upload Oral Images</h1>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <div className="upload-card">
        <div className="instruction-section">
          <h2 className="section-title">Instructions</h2>
          <p className="upload-instructions">
            Please upload three clear images of your mouth in the following positions:
          </p>
          <ol className="instruction-list">
            <li>Left side profile (cheek side)</li>
            <li>Front view (showing front teeth)</li>
            <li>Right side profile (cheek side)</li>
          </ol>
          <p className="upload-instructions">
            For best results, please ensure:
          </p>
          <ul className="tips-list">
            <li>Good lighting</li>
            <li>Clear focus on the teeth and gums</li>
            <li>Mouth is open enough to see teeth and gums clearly</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="uploads-grid">
            {/* Left Profile Image */}
            <div className="upload-box">
              <h3 className="upload-box-title">Left Side Profile</h3>
              <div className="upload-preview">
                {previews.leftProfileImage ? (
                  <>
                    <img
                      src={previews.leftProfileImage}
                      alt="Left profile preview"
                    />
                  </>
                ) : (
                  <div className="no-image">
                    No image selected
                  </div>
                )}
              </div>
              <div className={`file-input-wrapper ${files.leftProfileImage ? 'has-file' : ''}`}>
                <input
                  type="file"
                  name="leftProfileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-input-button">
                  {files.leftProfileImage ? 'Change Image' : 'Select Image'}
                </div>
              </div>
            </div>
            
            {/* Frontal Image */}
            <div className="upload-box">
              <h3 className="upload-box-title">Front View</h3>
              <div className="upload-preview">
                {previews.frontalImage ? (
                  <img
                    src={previews.frontalImage}
                    alt="Front view preview"
                  />
                ) : (
                  <div className="no-image">
                    No image selected
                  </div>
                )}
              </div>
              <div className={`file-input-wrapper ${files.frontalImage ? 'has-file' : ''}`}>
                <input
                  type="file"
                  name="frontalImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-input-button">
                  {files.frontalImage ? 'Change Image' : 'Select Image'}
                </div>
              </div>
            </div>
            
            {/* Right Profile Image */}
            <div className="upload-box">
              <h3 className="upload-box-title">Right Side Profile</h3>
              <div className="upload-preview">
                {previews.rightProfileImage ? (
                  <img
                    src={previews.rightProfileImage}
                    alt="Right profile preview"
                  />
                ) : (
                  <div className="no-image">
                    No image selected
                  </div>
                )}
              </div>
              <div className={`file-input-wrapper ${files.rightProfileImage ? 'has-file' : ''}`}>
                <input
                  type="file"
                  name="rightProfileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-input-button">
                  {files.rightProfileImage ? 'Change Image' : 'Select Image'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </form>
      </div>
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

export default PatientUpload;