import api from './api';

class UserService {
  async getProfile() {
    return api.get('/users/profile');
  }

  async updateProfile(data) {
    return api.put('/users/profile', data);
  }

  async updateGoals(goals) {
    return api.put('/users/goals', goals);
  }

  async changePassword(oldPassword, newPassword) {
    return api.post('/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}

export default new UserService();