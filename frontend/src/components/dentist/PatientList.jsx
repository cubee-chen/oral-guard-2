// src/components/dentist/PatientList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages/DentistDashboard.css'; // Using the dashboard style since it contains patient list styles

const PatientList = ({ patients, selectedPatient, onRemovePatient }) => (
  <div className="patient-list-container">
    {patients.length === 0 ? (
      <div className="patient-list-empty">No patients available.</div>
    ) : (
      <ul className="patient-list">
        {patients.map((p) => (
          <li key={p._id} className="patient-list-item">
            <Link
              to={`/dentist/patients/${p._id}`}
              className={`patient-link ${selectedPatient?._id === p._id ? 'active' : ''}`}
            >
              <div className="patient-info">
                <h3 className="patient-name">
                  {p.firstName} {p.lastName}
                </h3>
                <p className="patient-email">{p.email}</p>
              </div>

              {/* "Remove" button needs to stop link navigation */}
              <button
                onClick={(e) => {
                  e.preventDefault();           // block <Link> navigation
                  e.stopPropagation();
                  if (window.confirm(`Remove ${p.firstName}?`)) {
                    onRemovePatient(p._id);
                  }
                }}
                className="remove-patient-btn"
              >
                Remove
              </button>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default PatientList;