import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <h1>Profile</h1>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default Profile;