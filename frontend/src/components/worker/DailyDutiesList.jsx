// src/components/worker/DailyDutiesList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/DailyDutiesList.css';

const DailyDutiesList = ({ duties, onCompleteDuty }) => {
  if (!duties || duties.length === 0) {
    return (
      <div className="duties-empty">
        <p>No duties scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="duties-container">
      <table className="duties-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Status</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {duties.map((duty) => (
            <tr key={duty._id} className={duty.completed ? 'completed' : ''}>
              <td className="patient-name">
                <Link to={`/worker/patients/${duty.patient._id}`}>
                  {duty.patient.firstName} {duty.patient.lastName}
                </Link>
              </td>
              <td className="duty-status">
                {duty.completed ? (
                  <span className="status-badge status-completed">
                    Completed
                  </span>
                ) : (
                  <span className="status-badge status-pending">
                    Pending
                  </span>
                )}
              </td>
              <td className="verification-status">
                {duty.verified ? (
                  <span className="verified-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="not-verified">
                    Not verified
                  </span>
                )}
              </td>
              <td className="duty-actions">
                {!duty.completed ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => onCompleteDuty(duty._id)}
                      className="complete-button"
                      title="Mark as completed"
                    >
                      Complete
                    </button>
                    <Link
                      to={`/worker/patients/${duty.patient._id}/upload`}
                      className="upload-link"
                      title="Upload oral images"
                    >
                      Upload
                    </Link>
                  </div>
                ) : (
                  <div className="completed-message">
                    Care completed
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyDutiesList;