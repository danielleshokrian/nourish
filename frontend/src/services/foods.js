import api from './api';

class FoodService {
  async searchFoods(query) {
    return api.get('/foods/search', { q: query });
  }

  async getCustomFoods() {
    return api.get('/foods/custom');
  }

  async createCustomFood(foodData) {
    return api.post('/foods/custom', foodData);
  }

  async deleteCustomFood(foodId) {
    return api.delete(`/foods/custom/${foodId}`);
  }

  async getFoodById(foodId) {
    return api.get(`/foods/${foodId}`);
  }

  async getFoodNutrition(foodId, quantity) {
    return api.get(`/foods/${foodId}/nutrition`, { quantity });
  }
}

export default new FoodService();