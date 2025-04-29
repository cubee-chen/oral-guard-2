import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/patient/dashboard" className="text-blue-500 mr-4">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Upload Oral Images</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <p className="text-gray-700">
            Please upload three clear images of your mouth in the following positions:
          </p>
          <ol className="list-decimal list-inside mt-2 text-gray-700">
            <li>Left side profile (cheek side)</li>
            <li>Front view (showing front teeth)</li>
            <li>Right side profile (cheek side)</li>
          </ol>
          <p className="mt-2 text-gray-700">
            For best results, please ensure:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Good lighting</li>
            <li>Clear focus on the teeth and gums</li>
            <li>Mouth is open enough to see teeth and gums clearly</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Profile Image */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Left Side Profile</h3>
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 mb-3 rounded">
                {previews.leftProfileImage ? (
                  <img
                    src={previews.leftProfileImage}
                    alt="Left profile preview"
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    No image selected
                  </div>
                )}
              </div>
              <input
                type="file"
                name="leftProfileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            {/* Frontal Image */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Front View</h3>
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 mb-3 rounded">
                {previews.frontalImage ? (
                  <img
                    src={previews.frontalImage}
                    alt="Front view preview"
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    No image selected
                  </div>
                )}
              </div>
              <input
                type="file"
                name="frontalImage"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            {/* Right Profile Image */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Right Side Profile</h3>
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 mb-3 rounded">
                {previews.rightProfileImage ? (
                  <img
                    src={previews.rightProfileImage}
                    alt="Right profile preview"
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    No image selected
                  </div>
                )}
              </div>
              <input
                type="file"
                name="rightProfileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
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