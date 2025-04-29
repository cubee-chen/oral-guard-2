import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PatientRecordChart from '../components/common/PatientRecordChart';
import PatientList from '../components/dentist/PatientList';
import PatientDetails from '../components/dentist/PatientDetails';
import AddPatientModal from '../components/dentist/AddPatientModal';

const DentistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const navigate = useNavigate();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dentist/patients');
        setPatients(response.data.patients);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patients. Please try again.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchPatients();
  }, [navigate]);

  // Fetch patient details when a patient is selected
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!selectedPatient) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/api/dentist/patients/${selectedPatient._id}`);
        setPatientDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient details. Please try again.');
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddPatient = async (patientData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/dentist/patients', patientData);
      setPatients([...patients, response.data.patient]);
      setShowAddPatientModal(false);
      setLoading(false);
    } catch (err) {
      setError('Failed to add patient. Please try again.');
      setLoading(false);
    }
  };

  const handleRemovePatient = async (patientId) => {
    try {
      setLoading(true);
      await api.delete(`/api/dentist/patients/${patientId}`);
      setPatients(patients.filter(patient => patient._id !== patientId));
      if (selectedPatient && selectedPatient._id === patientId) {
        setSelectedPatient(null);
        setPatientDetails(null);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to remove patient. Please try again.');
      setLoading(false);
    }
  };

  const handleAddComment = async (uploadId, content) => {
    try {
      setLoading(true);
      await api.post(`/api/dentist/upload/${uploadId}/comment`, { content });
      
      // Refresh patient details to show the new comment
      if (selectedPatient) {
        const response = await api.get(`/api/dentist/patients/${selectedPatient._id}`);
        setPatientDetails(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !patients.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dentist Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Patients</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowAddPatientModal(true)}
            >
              Add Patient
            </button>
          </div>
          
          <PatientList 
            patients={patients} 
            selectedPatient={selectedPatient}
            onPatientSelect={handlePatientSelect}
            onRemovePatient={handleRemovePatient}
          />
        </div>
        
        <div className="w-full md:w-2/3">
          {selectedPatient && patientDetails ? (
            <PatientDetails 
              patient={patientDetails.patient}
              uploads={patientDetails.uploads}
              record={patientDetails.record}
              onAddComment={handleAddComment}
            />
          ) : (
            <div className="bg-gray-100 p-8 rounded text-center">
              <p className="text-gray-500">
                Select a patient to view their details
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showAddPatientModal && (
        <AddPatientModal 
          onAddPatient={handleAddPatient}
          onClose={() => setShowAddPatientModal(false)}
        />
      )}
      
      {loading && <LoadingSpinner overlay />}
    </div>
  );
};

export default DentistDashboard;