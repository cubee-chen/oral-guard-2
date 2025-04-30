import AddPatientForm from '../components/dentist/AddPatientModal'; // renaming is optional
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddNewPatient = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await api.post('/api/dentist/patients', data);
    navigate('/dentist/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AddPatientForm
        onAddPatient={handleSubmit}
        onClose={() => navigate('/dentist/dashboard')}
      />
    </div>
  );
};

export default AddNewPatient;
