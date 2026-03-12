import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page1.css';

const Page1 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration states
  const [showRegister, setShowRegister] = useState(false);
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regCurrency, setRegCurrency] = useState('LKR');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/home'); 
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      // Step 1: Create the Business
      const bizRes = await fetch('http://localhost:8080/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regBusinessName, currency: regCurrency })
      });
      const bizData = await bizRes.json();

      if (!bizRes.ok || !bizData.success) {
        setRegError(bizData.message || 'Failed to register business.');
        setRegLoading(false);
        return;
      }

      const businessId = bizData.data.id;

      // Step 2: Register the Business Owner
      const authRes = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          role: 'BUSINESS_OWNER',
          businessId: businessId
        })
      });
      const authData = await authRes.json();

      if (authRes.ok && authData.success) {
        // Log them in immediately
        localStorage.setItem('token', authData.data.token);
        localStorage.setItem('user', JSON.stringify(authData.data));
        navigate('/home');
      } else {
        setRegError(authData.message || 'User registration failed.');
      }
    } catch (err) {
      setRegError('Network error. Is the backend running?');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">SmartBiz</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        
        {error && <div className="login-error" style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <a href="#" className="forgot-password">Forgot password?</a>
          <p className="register-prompt">
            Don't have an account? <span className="register-link" onClick={() => setShowRegister(true)}>Register your Business</span>
          </p>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowRegister(false)}>×</button>
            <div className="login-header">
              <h1 className="login-logo">Register Business</h1>
              <p className="login-subtitle">Create a new SmartBiz account</p>
            </div>

            {regError && <div className="login-error" style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{regError}</div>}

            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="regBusinessName">Business Name</label>
                <input 
                  type="text" 
                  id="regBusinessName" 
                  placeholder="My Company LLC" 
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="regCurrency">Currency</label>
                <select 
                  id="regCurrency" 
                  value={regCurrency} 
                  onChange={(e) => setRegCurrency(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
                >
                  <option value="LKR">LKR (Rs.)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">Owner Email</label>
                <input 
                  type="email" 
                  id="regEmail" 
                  placeholder="owner@company.com" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <input 
                  type="password" 
                  id="regPassword" 
                  placeholder="••••••••" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="login-button" disabled={regLoading}>
                {regLoading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page1;