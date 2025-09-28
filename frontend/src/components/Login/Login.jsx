import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      
      if (!result.success) {
        setError(result.error);
      } else {
        // Redirect based on role
        if (result.user?.role === 'admin') {
          navigate('/'); // Admin home/dashboard
        } else if (
          result.user?.role === 'intern' ||
          result.user?.role === 'teamleader' ||
          result.user?.role === 'projectmanager'
        ) {
          navigate('/profile'); // Intern profile
        } else {
          navigate('/'); // Default fallback
        }
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    } else {
      // Redirect based on role
      if (result.user?.role === 'admin') {
        navigate('/'); // Admin home/dashboard
      } else if (result.user?.role === 'intern' || result.user?.role === 'teamleader' || result.user?.role === 'projectmanager') {
        navigate('/profile'); // Intern profile
      } else {
        navigate('/'); // Default fallback
      }
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <img src="/logo.png" alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>Intern Management System</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* <div className={styles.userTypeInfo}>
          <div className={styles.infoCard}>
            <h3>👤 Administrators</h3>
            <p>Use your email and password to sign in</p>
          </div>
          <div className={styles.infoCard}>
            <h3>👥 Interns</h3>
            <p>Use the "Continue with Google" button below</p>
            <p className={styles.infoNote}>
              <strong>Note:</strong> Only pre-authorized Gmail accounts can login
            </p>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h3 className={styles.loginTitle}>Admin Login</h3>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your admin email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your admin password"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.googleLoginWrapper}>
          <h3 className={styles.loginTitle}>Intern Login</h3>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text="continue_with"
            theme="outlined"
            size="large"
            shape="rectangular"
            width="400px"
            locale='en'
          />
          <p className={styles.googleHint}>
            Only authorized interns can sign in with Google
          </p>
        </div>

        {/* <div className={styles.demoCredentials}>
          <h3>Demo Credentials:</h3>
          <div className={styles.credentialItem}>
            <strong>Admin:</strong> admin@slt.lk / admin123
          </div>
          <div className={styles.credentialItem}>
            <strong>Intern:</strong> Use Google login with your Gmail account
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
