import React from 'react';
import {Link } from 'react-router-dom';

const PatientList = ({ patients, selectedPatient, onRemovePatient }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {patients.length === 0 ? (
      <div className="p-4 text-center text-gray-500">No patients available.</div>
    ) : (
      <ul className="divide-y divide-gray-200">
        {patients.map((p) => (
          <li key={p._id} className="p-0">
            <Link
              to={`/dentist/patients/${p._id}`}
              className={`flex justify-between items-center p-4 hover:bg-gray-50 ${
                selectedPatient?._id === p._id ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <h3 className="font-medium">
                  {p.firstName} {p.lastName}
                </h3>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>

              {/* “Remove” button needs to stop link navigation */}
              <button
                onClick={(e) => {
                  e.preventDefault();           // block <Link> navigation
                  e.stopPropagation();
                  if (window.confirm(`Remove ${p.firstName}?`)) {
                    onRemovePatient(p._id);
                  }
                }}
                className="text-red-500 hover:text-red-700"
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