// src/components/facility/DutyVerificationList.jsx
import React from 'react';
import '../../styles/components/DutyVerificationList.css';

const DutyVerificationList = ({ duties, onVerifyDuty }) => {
  if (!duties || duties.length === 0) {
    return (
      <div className="duties-empty">
        <p>No duties scheduled for this date.</p>
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
            <th>Hygiene Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {duties.map((duty) => (
            <tr key={duty._id} className={duty.verified ? 'verified' : ''}>
              <td className="patient-name">
                {duty.patient.firstName} {duty.patient.lastName}
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
              <td className="hygiene-score">
                {duty.hygieneScore ? (
                  <span className={`score-value ${getScoreClass(duty.hygieneScore)}`}>
                    {duty.hygieneScore}/100
                  </span>
                ) : (
                  <span className="no-score">Not scored</span>
                )}
              </td>
              <td className="duty-actions">
                {duty.completed && !duty.verified ? (
                  <button
                    onClick={() => onVerifyDuty(duty._id)}
                    className="verify-button"
                    title="Verify care completed"
                  >
                    Verify
                  </button>
                ) : duty.verified ? (
                  <span className="verified-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="awaiting-completion">
                    Awaiting completion
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to get score class based on value
const getScoreClass = (score) => {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
};

export default DutyVerificationList;