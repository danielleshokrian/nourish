import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/users';
import useApi from '../hooks/useApi';
import './Pages.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const { execute: changePassword, loading: changingPassword } = useApi(userService.changePassword);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      alert('Password changed successfully!');
      setIsEditingPassword(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-section">
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2>Nutrition Goals</h2>
          <div className="goals-grid">
            <div className="goal-item">
              <span className="label">Daily Calories</span>
              <span className="value">{user?.daily_calories || 2000}</span>
            </div>
            <div className="goal-item">
              <span className="label">Daily Protein</span>
              <span className="value">{user?.daily_protein || 50}g</span>
            </div>
            <div className="goal-item">
              <span className="label">Daily Carbs</span>
              <span className="value">{user?.daily_carbs || 275}g</span>
            </div>
            <div className="goal-item">
              <span className="label">Daily Fat</span>
              <span className="value">{user?.daily_fat || 78}g</span>
            </div>
            <div className="goal-item">
              <span className="label">Daily Fiber</span>
              <span className="value">{user?.daily_fiber || 28}g</span>
            </div>
          </div>
          <p className="hint">Update your goals in Settings</p>
        </div>

        <div className="profile-card">
          <div className="card-header-with-action">
            <h2>Password</h2>
            {!isEditingPassword && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditingPassword(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {isEditingPassword && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;