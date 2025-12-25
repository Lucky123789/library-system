import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 注册组件
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 验证邮箱格式
   */
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * 验证单个字段
   */
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'username') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      } else if (value.length < 3) {
        error = `Please enter at least 3 characters (currently ${value.length} character${value.length !== 1 ? 's' : ''}).`;
      } else if (value.length > 20) {
        error = 'Please enter at most 20 characters.';
      }
    } else if (name === 'email') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      } else if (!isValidEmail(value)) {
        error = 'Please enter a valid email address.';
      }
    } else if (name === 'password') {
      if (!value || value.trim() === '') {
        error = 'Password is required.';
      } else if (value.length < 6) {
        error = `Please enter at least 6 characters (currently ${value.length} character${value.length !== 1 ? 's' : ''}).`;
      }
    } else if (name === 'confirmPassword') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      } else if (value !== formData.password) {
        error = 'Passwords do not match.';
      }
    }
    
    return error;
  };

  /**
   * 处理输入变化
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除字段错误
    setErrors({
      ...errors,
      [name]: ''
    });
    setError('');
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 手动验证所有字段
    const newErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword)
    };
    
    setErrors(newErrors);
    
    // 如果有任何错误，不提交
    if (newErrors.username || newErrors.email || newErrors.password || newErrors.confirmPassword) {
      return;
    }

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate('/books');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username (3-20 characters)"
            />
            {errors.username && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            {errors.email && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (at least 6 characters)"
            />
            {errors.password && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in now</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

