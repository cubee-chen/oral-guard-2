import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const navigate  = useNavigate();

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
  if (error)   return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/patient/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">My Information</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <p className="mb-2"><span className="font-semibold">Name:</span> {profile.firstName} {profile.lastName}</p>
        <p className="mb-2"><span className="font-semibold">Email:</span> {profile.email}</p>
        {profile.dateOfBirth && (
          <p className="mb-2"><span className="font-semibold">Date of Birth:</span> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
        )}
      </div>

      {profile.dentist && (
        <div className="bg-white rounded-lg shadow p-6 max-w-lg mt-6">
          <h2 className="text-xl font-semibold mb-4">My Dentist</h2>
          <p>Dr. {profile.dentist.firstName} {profile.dentist.lastName}</p>
          <p className="text-sm text-gray-600">{profile.dentist.email}</p>
          {profile.dentist.specialization && (
            <p className="text-sm text-gray-600">Specialization: {profile.dentist.specialization}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
