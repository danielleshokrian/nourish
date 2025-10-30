import api from './api';

class MealService {
  async getSavedMeals() {
    return api.get('/meals');
  }

  async createSavedMeal(mealData) {
    return api.post('/meals', mealData);
  }

  async deleteSavedMeal(mealId) {
    return api.delete(`/meals/${mealId}`);
  }

  async addSavedMealToDay(mealId, date, mealType) {
    return api.post(`/meals/${mealId}/add`, { date, meal_type: mealType });
  }
}

export default new MealService();