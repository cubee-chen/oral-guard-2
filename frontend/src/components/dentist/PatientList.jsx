import React from 'react';

const PatientList = ({ patients, selectedPatient, onPatientSelect, onRemovePatient }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {patients.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No patients available. Add your first patient.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {patients.map(patient => (
            <li 
              key={patient._id}
              className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${
                selectedPatient && selectedPatient._id === patient._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onPatientSelect(patient)}
            >
              <div>
                <h3 className="font-medium">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-sm text-gray-500">{patient.email}</p>
              </div>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Remove ${patient.firstName} ${patient.lastName} from your patients?`)) {
                    onRemovePatient(patient._id);
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList;