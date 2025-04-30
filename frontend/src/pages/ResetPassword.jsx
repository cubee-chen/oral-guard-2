import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

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
      setMsg('Password updated');
    } catch (e) {
      setErr(e.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-card">
        <h2 className="auth-title">Choose a new password</h2>
        {err && <div className="error-message">{err}</div>}
        {msg ? (
          <>
            <div className="success-message">{msg}</div>
            <Link to="/login" className="text-blue-600 underline mt-4 inline-block">Back to login</Link>
          </>
        ) : (
          <>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="form-input mb-4"
              placeholder="New password"
            />
            <button className="auth-button">Save</button>
          </>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
