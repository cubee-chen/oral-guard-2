// src/components/facility/WorkerList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/WorkerList.css';

const WorkerList = ({ workers, onRemoveWorker }) => {
  if (!workers || workers.length === 0) {
    return (
      <div className="worker-list-empty">
        <p>No workers available.</p>
        <p>Add your first care worker to get started.</p>
      </div>
    );
  }

  return (
    <div className="worker-list-container">
      <ul className="worker-list">
        {workers.map((worker) => (
          <li key={worker._id} className="worker-list-item">
            <Link
              to={`/facility/workers/${worker._id}`}
              className="worker-link"
            >
              <div className="worker-info">
                <h3 className="worker-name">
                  {worker.firstName} {worker.lastName}
                </h3>
                <p className="worker-email">{worker.email}</p>
                {worker.specialization && (
                  <p className="worker-specialization">
                    {worker.specialization}
                  </p>
                )}
              </div>

              {/* Actions buttons */}
              <div className="worker-actions">
                <button
                  onClick={(e) => {
                    e.preventDefault();           // block <Link> navigation
                    e.stopPropagation();
                    
                    if (window.confirm(`Remove ${worker.firstName}?`)) {
                      onRemoveWorker(worker._id);
                    }
                  }}
                  className="remove-worker-btn"
                  title="Remove worker"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkerList;