// src/pages/PatientProfile.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/pages/PatientProfile.css';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/patient/profile');
        setProfile(data.patient);
      } catch (err) {
        if (err.response?.status === 401) return navigate('/login');
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-container">
      <Link to="/patient/dashboard" className="back-link">
        ← Back to dashboard
      </Link>

      <h1 className="profile-title">My Information</h1>

      <div className="profile-card">
        <div className="profile-section">
          <div className="profile-info">
            <div className="info-group">
              <p className="info-label">Name:</p>
              <p className="info-value">{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="info-group">
              <p className="info-label">Email:</p>
              <p className="info-value">{profile.email}</p>
            </div>
            {profile.dateOfBirth && (
              <div className="info-group">
                <p className="info-label">Date of Birth:</p>
                <p className="info-value">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile.dentist && (
        <div className="dentist-card">
          <h2 className="section-title">My Dentist</h2>
          <div className="dentist-info">
            <div className="dentist-avatar">
              {profile.dentist.firstName[0]}
            </div>
            <div className="dentist-details">
              <p className="dentist-name">Dr. {profile.dentist.firstName} {profile.dentist.lastName}</p>
              <p className="dentist-email">{profile.dentist.email}</p>
              {profile.dentist.specialization && (
                <p className="dentist-specialty">Specialization: {profile.dentist.specialization}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;