// src/components/worker/PatientList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/PatientList.css';

const PatientList = ({ patients, isWorkerView }) => {
  if (!patients || patients.length === 0) {
    return (
      <div className="patient-list-empty">
        <p>No patients available.</p>
        {isWorkerView ? (
          <p>Contact your facility to add patients.</p>
        ) : (
          <p>Add your first patient to get started.</p>
        )}
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <ul className="patient-list">
        {patients.map((patient) => (
          <li key={patient._id} className="patient-list-item">
            <Link
              to={isWorkerView ? `/worker/patients/${patient._id}` : `#`}
              className="patient-link"
            >
              <div className="patient-info">
                <h3 className="patient-name">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="patient-email">{patient.email}</p>
                {patient.dateOfBirth && (
                  <p className="patient-dob">
                    Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* For worker view, add quick action buttons */}
              {isWorkerView && (
                <div className="patient-actions">
                  <Link
                    to={`/worker/patients/${patient._id}/upload`}
                    className="upload-button"
                    title="Upload oral images"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                    </svg>
                  </Link>
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;