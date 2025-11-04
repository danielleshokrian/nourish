import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirm_password: '',
    daily_calories: 2200,
    daily_protein: 120,
    daily_carbs: 275,
    daily_fat: 73,
    daily_fiber: 30
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? 
      parseFloat(e.target.value) : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      const newErrors = { ...result.errors };
      if (result.error && !Object.keys(result.errors || {}).length) {
        newErrors.general = result.error;
      }

      Object.keys(newErrors).forEach(key => {
        if (Array.isArray(newErrors[key])) {
          newErrors[key] = newErrors[key].join('. ');
        }
      });

      setErrors(newErrors);
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>NOURISH</h1>
        </div>
        <div className="auth-subtitle">Join Our Community</div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={errors.confirm_password ? 'error' : ''}
            />
            {errors.confirm_password && (
              <span className="field-error">{errors.confirm_password}</span>
            )}
          </div>

          <div className="goals-toggle">
            <button 
              type="button" 
              onClick={() => setShowGoals(!showGoals)}
              className="btn-text"
            >
              {showGoals ? 'Hide' : 'Set'} Nutrition Goals (Optional)
            </button>
          </div>

          {showGoals && (
            <div className="nutrition-goals">
              <h3>Daily Nutrition Goals</h3>
              
              <div className="form-group">
                <label htmlFor="daily_calories">Calories</label>
                <input
                  type="number"
                  id="daily_calories"
                  name="daily_calories"
                  value={formData.daily_calories}
                  onChange={handleChange}
                  min="1200"
                  max="5000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="daily_protein">Protein (g)</label>
                  <input
                    type="number"
                    id="daily_protein"
                    name="daily_protein"
                    value={formData.daily_protein}
                    onChange={handleChange}
                    min="20"
                    max="300"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="daily_carbs">Carbs (g)</label>
                  <input
                    type="number"
                    id="daily_carbs"
                    name="daily_carbs"
                    value={formData.daily_carbs}
                    onChange={handleChange}
                    min="50"
                    max="500"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="daily_fat">Fat (g)</label>
                  <input
                    type="number"
                    id="daily_fat"
                    name="daily_fat"
                    value={formData.daily_fat}
                    onChange={handleChange}
                    min="20"
                    max="200"
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;