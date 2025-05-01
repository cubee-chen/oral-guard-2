// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages/ResetPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null); setMsg(null);
        if  (!email) return setErr('Please enter your email');

        try {
            await api.post('/api/auth/forgot-password', { email });
            setMsg('If that e-mail exists we have sent a reset link.');
        } catch (error) {
            setErr('Something went wrong. Please try again.');
        }
    };
    
    return (
        <div className="reset-container">
          <div className="reset-card">
            <h2 className="reset-title">Reset password</h2>
            {err && <div className="error-message">{err}</div>}
            {msg && <div className="success-message">{msg}</div>}
            <form onSubmit={handleSubmit} className="reset-form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="reset-input"
              />
              <button className="reset-button">Send reset link</button>
              <Link to="/login" className="back-to-login">Back to login</Link>
            </form>
          </div>
        </div>
    );
};

export default ForgotPassword;