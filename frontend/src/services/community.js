import api from './api';

const communityService = {
  async getRecipes(page = 1, search = '') {
    const params = new URLSearchParams({ page, per_page: 20 });
    if (search) params.append('search', search);
    return api.get(`/community/recipes?${params}`);
  },

  async getRecipe(recipeId) {
    return api.get(`/community/recipes/${recipeId}`);
  },

  async shareRecipe(recipeData, imageFile) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(recipeData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return api.postFormData('/community/recipes', formData);
  },

  async importRecipe(recipeId) {
    return api.post(`/community/recipes/${recipeId}/import`);
  },

  async deleteRecipe(recipeId) {
    return api.delete(`/community/recipes/${recipeId}`);
  },

  getImageUrl(recipeId) {
    const baseURL = process.env.REACT_APP_API_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://nourish-muv1.onrender.com'
        : 'http://localhost:5001'
    );
    return `${baseURL}/community/recipes/${recipeId}/image`;
  }
};

export default communityService;