import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import mealService from '../services/meals';
import useApi from '../hooks/useApi';
import './Pages.css';

const SavedMeals = () => {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  const { execute: fetchMeals, loading: loadingMeals } = useApi(mealService.getSavedMeals);
  const { execute: deleteMeal } = useApi(mealService.deleteSavedMeal);
  const { execute: addMealToDay, loading: adding } = useApi(mealService.addSavedMealToDay);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    const result = await fetchMeals();
    if (result.success) {
      setMeals(result.data.meals || []);
    }
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this saved meal?')) {
      const result = await deleteMeal(mealId);
      if (result.success) {
        loadMeals();
      }
    }
  };

  const handleAddToDay = async (mealId) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const result = await addMealToDay(mealId, dateStr, selectedMealType);

    if (result.success) {
      alert('Meal added to your day!');
    }
  };

  if (loadingMeals) {
    return <div className="loading">Loading saved meals...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Saved Meals</h1>
      </div>

      {meals.length === 0 ? (
        <div className="empty-state">
          <p>No saved meals yet. Save your favorite meal combinations from the Dashboard!</p>
        </div>
      ) : (
        <div className="meals-grid">
          {meals.map(meal => (
            <div key={meal.id} className="meal-card">
              <div className="meal-card-header">
                <h3>{meal.name}</h3>
                {meal.description && (
                  <p className="meal-description">{meal.description}</p>
                )}
              </div>

              <div className="meal-nutrition-summary">
                <div className="nutrition-item">
                  <span className="label">Calories</span>
                  <span className="value">{Math.round(meal.total_calories)}</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Protein</span>
                  <span className="value">{meal.total_protein.toFixed(1)}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Carbs</span>
                  <span className="value">{meal.total_carbs.toFixed(1)}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="label">Fat</span>
                  <span className="value">{meal.total_fat.toFixed(1)}g</span>
                </div>
              </div>

              <div className="meal-foods">
                <h4>Foods in this meal:</h4>
                <ul>
                  {meal.foods && JSON.parse(meal.foods).map((food, idx) => (
                    <li key={idx}>
                      {food.name} - {food.quantity}g
                    </li>
                  ))}
                </ul>
              </div>

              <div className="meal-card-actions">
                <div className="add-to-day-section">
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="meal-type-select"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToDay(meal.id)}
                    disabled={adding}
                  >
                    Add to Today
                  </button>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(meal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMeals;