// src/pages/AddNewPatient.jsx
import AddPatientForm from '../components/dentist/AddPatientModal';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/components/AddPatientModal.css';

const AddNewPatient = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await api.post('/api/dentist/patients', data);
    navigate('/dentist/dashboard');
  };

  return (
    <div className="modal-overlay">
      <AddPatientForm
        onAddPatient={handleSubmit}
        onClose={() => navigate('/dentist/dashboard')}
      />
    </div>
  );
};

export default AddNewPatient;