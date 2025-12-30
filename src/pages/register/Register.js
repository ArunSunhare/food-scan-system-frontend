import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOperator } from '../../services/operator/auth.api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors({});
    setApiError('');
  };

  const validate = () => {
    const err = {};
    if (!formData.username) err.username = 'Username is required';
    if (!formData.password) err.password = 'Password is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🟡 Submit clicked');

    if (!validate()) {
      console.log('❌ Validation failed:', formData);
      return;
    }

    setLoading(true);
    console.log('🟢 Calling loginOperator API');
    console.log('➡️ Payload:', formData);

    try {
      const res = await loginOperator(
        formData.username,
        formData.password
      );

      console.log('✅ API Response:', res);

      if (res?.success && res?.data?.token) {
        console.log('🟢 Login success');

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.admin.role);
        localStorage.setItem('username', res.data.admin.username);

        // Yeh line add ki hai – isse Selection page pe redirect nahi hoga wapas register pe
        localStorage.setItem('registered', 'true');

        console.log('➡️ Navigating to /selection');
        navigate('/selection', { replace: true }); // ✅ reliable navigation
      } else {
        console.log('❌ Login failed:', res?.message);
        setApiError(res?.message || 'Login failed');
      }
    } catch (err) {
      console.error('🔥 API Error:', err);
      setApiError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
      console.log('🟡 Loading stopped');
    }
  };

  return (
    <div className="register-page">
      <div className="disclaimer-bar">
        <div className="disclaimer-content">
          🚨 IMPORTANT: Authorized Personnel Only • Ensure Face is clearly visible during scan • Do not share your credentials • System is monitored 24/7 • Please logout after your session 🚨
        </div>
      </div>

      <div className="page-container glass-effect">
        <h1 className="page-title">Operator Login</h1>
        <p className="page-subtitle">Login to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={loading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              disabled={loading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {apiError && <div className="error-message">{apiError}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/login')}
              disabled={loading}
            >
              Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;