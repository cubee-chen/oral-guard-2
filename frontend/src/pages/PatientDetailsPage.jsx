// src/pages/PatientDetailsPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientDetails from '../components/dentist/PatientDetails';
import '../styles/pages/PatientDetailsPage.css';

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/dentist/patients/${patientId}`);
        setDetails(res.data);
      } catch (err) {
        setError('Unable to load patient');
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="patient-details-container">
      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Back to list
      </button>

      <PatientDetails
        patient={details.patient}
        uploads={details.uploads}
        record={details.record}
        onAddComment={async (uploadId, content) => {
          await api.post(`/api/dentist/upload/${uploadId}/comment`, { content });
          // refetch comments
          const res = await api.get(`/api/dentist/patients/${patientId}`);
          setDetails(res.data);
        }}
      />
    </div>
  );
};

export default PatientDetailsPage;