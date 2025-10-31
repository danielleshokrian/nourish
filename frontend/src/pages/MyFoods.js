import React from 'react';
import { useState, useEffect } from 'react';
import foodService from '../services/foods';
import useApi from '../hooks/useApi';
import Modal from '../components/Common/Modal';
import './Pages.css';

const MyFoods = () => {
  const [foods, setFoods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    serving_size: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });

  const { execute: fetchFoods, loading: loadingFoods } = useApi(foodService.getCustomFoods);
  const { execute: createFood, loading: creating } = useApi(foodService.createCustomFood);
  const { execute: deleteFood } = useApi(foodService.deleteCustomFood);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const result = await fetchFoods();
    if (result.success) {
      setFoods(result.data.foods || []);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'brand' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await createFood(formData);
    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      loadFoods();
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      const result = await deleteFood(foodId);
      if (result.success) {
        loadFoods();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      serving_size: 100,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });
  };

  if (loadingFoods) {
    return <div className="loading">Loading your foods...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Custom Foods</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Custom Food
        </button>
      </div>

      {foods.length === 0 ? (
        <div className="empty-state">
          <p>No custom foods yet. Create your first custom food!</p>
        </div>
      ) : (
        <div className="foods-grid">
          {foods.map(food => (
            <div key={food.id} className="food-card">
              <div className="food-card-header">
                <h3>{food.name}</h3>
                {food.brand && <span className="food-brand">{food.brand}</span>}
              </div>
              <div className="food-card-serving">
                Serving: {food.serving_size}g
              </div>
              <div className="food-card-nutrition">
                <div className="nutrition-item">
                  <span className="label">Calories</span>
                  <span className="value">{food.calories}</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Protein</span>
                  <span className="value">{food.protein}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Carbs</span>
                  <span className="value">{food.carbs}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Fat</span>
                  <span className="value">{food.fat}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Fiber</span>
                  <span className="value">{food.fiber}g</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(food.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add Custom Food"
      >
        <form onSubmit={handleSubmit} className="custom-food-form">
          <div className="form-group">
            <label>Food Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Homemade Protein Shake"
            />
          </div>

          <div className="form-group">
            <label>Brand (Optional)</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., MyProtein"
            />
          </div>

          <div className="form-group">
            <label>Serving Size (g) *</label>
            <input
              type="number"
              name="serving_size"
              value={formData.serving_size}
              onChange={handleInputChange}
              required
              min="1"
              step="0.1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Calories *</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Protein (g) *</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Carbs (g) *</label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Fat (g) *</label>
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Fiber (g)</label>
            <input
              type="number"
              name="fiber"
              value={formData.fiber}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Adding...' : 'Add Food'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyFoods;