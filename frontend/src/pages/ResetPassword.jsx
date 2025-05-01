// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault(); setErr(null); setMsg(null);
    if (pw.length < 6) return setErr('Password too short');

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password: pw });
      setMsg('Password updated successfully');
    } catch (e) {
      setErr(e.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Choose a new password</h2>
        {err && <div className="error-message">{err}</div>}
        {msg ? (
          <>
            <div className="success-message">{msg}</div>
            <Link to="/login" className="back-to-login">Back to login</Link>
          </>
        ) : (
          <form onSubmit={submit} className="reset-form">
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="reset-input"
              placeholder="New password"
            />
            <button className="reset-button">Save new password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;