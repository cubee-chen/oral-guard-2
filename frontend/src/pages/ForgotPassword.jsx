import { useState } from 'react';
import api from '../services/api';

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
        <div className="auth-container">
          <form onSubmit={handleSubmit} className="auth-card">
            <h2 className="auth-title">Reset password</h2>
            {err && <div className="error-message">{err}</div>}
            {msg && <div className="success-message">{msg}</div>}
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input mb-4"
            />
            <button className="auth-button">Send link</button>
          </form>
        </div>
    );
};

export default ForgotPassword;