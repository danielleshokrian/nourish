import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import foodService from '../../services/foods';
import entryService from '../../services/entries';
import mealService from '../../services/meals';
import useApi from '../../hooks/useApi';
import Modal from '../Common/Modal';
import './AddFoodModal.css';

const AddFoodModal = ({ isOpen, onClose, mealType, date, onFoodAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [activeTab, setActiveTab] = useState('search'); // search, custom, saved
  const [customFoods, setCustomFoods] = useState([]);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [savedMeals, setSavedMeals] = useState([]);
  const [selectedSavedMeal, setSelectedSavedMeal] = useState(null); 
  const [mealPortion, setMealPortion] = useState(100);
  
  const { execute: searchFoods, loading: searching } = useApi(foodService.searchFoods);
  const { execute: addEntry, loading: adding } = useApi(entryService.createEntry);
  const { execute: fetchCustomFoods, loading: loadingCustom } = useApi(foodService.getCustomFoods);
  const { execute: fetchSavedMeals, loading: loadingSavedMeals } = useApi(mealService.getSavedMeals);

  useEffect(() => {
    if (isOpen) {
      loadCustomFoods(); 
      loadSavedMeals();
    }
  }, [isOpen]); 

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delayDebounce = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    const result = await searchFoods(searchQuery);
    if (result.success) {
      setSearchResults(result.data.results || []);
    }
  };

  const loadCustomFoods = async () => { 
  const result = await fetchCustomFoods();
  if (result.success) {
    setCustomFoods(result.data.foods || []);
  }
};

  const loadSavedMeals = async () => { 
    const result = await fetchSavedMeals();
    if (result.success) {
      setSavedMeals(result.data.meals || []);
    }
  };

const handleAddSavedMeal = async () => {
  if (!selectedSavedMeal) return;

  const scaleFactor = mealPortion / 100;

  const promises = selectedSavedMeal.foods.map(food => {
    return addEntry({
      food_id: food.food_id,
      custom_food_id: food.custom_food_id,
      meal_type: mealType,
      quantity: food.quantity * scaleFactor,
      date: date
    });
  });

  const results = await Promise.all(promises);
  
  if (results.every(r => r.success)) {
    onFoodAdded();
    setSelectedSavedMeal(null);
    setMealPortion(100);
    handleClose();
  }
};

  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  const handleAddFood = async () => {
  if (!selectedFood || quantity <= 0) return;

  let foodId = selectedFood.id;
  let customFoodId = null;

  if (selectedFood.type === 'spoonacular') {
    try {
      const saveResponse = await api.post(`/foods/spoonacular/${selectedFood.id}`);
      foodId = saveResponse.food.id;
    } catch (error) {
      console.error('Failed to save Spoonacular food:', error);
      return;
    }
  } else if (selectedFood.type === 'custom') {
    customFoodId = selectedFood.id;
    foodId = null;
  }

  const entryData = {
    food_id: foodId,
    custom_food_id: customFoodId,
    meal_type: mealType,
    quantity: quantity,
    date: date
  };

  const result = await addEntry(entryData);
  
  if (result.success) {
    onFoodAdded();
    handleClose();
  }
};

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setQuantity(100);
    setCustomSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Food">
      <div className="add-food-modal">
        <div className="tabs">
          <button 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button 
            className={activeTab === 'custom' ? 'active' : ''}
            onClick={() => setActiveTab('custom')}
          >
            Custom
          </button>
          <button 
            className={activeTab === 'saved' ? 'active' : ''}
            onClick={() => setActiveTab('saved')}
          >
            Saved Meals
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="search-tab">
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            {searching && <div className="loading">Searching...</div>}

            <div className="search-results">
              {searchResults.map(food => (
                <div
                  key={`${food.type}-${food.id}`}
                  className={`search-result-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="food-name">{food.name}</div>
                  <div className="food-info">
                    {food.calories} cal | {food.protein}g protein | 
                    {food.carbs}g carbs | {food.fat}g fat
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'custom' && ( 
          <div className="custom-tab">
            <input
              type="text"
              placeholder="Search your custom foods..."
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              className="search-input"
            />

            {loadingCustom && <div className="loading">Loading...</div>}

            <div className="search-results">
              {customFoods
                .filter(food => 
                  food.name.toLowerCase().includes(customSearchQuery.toLowerCase())
                )
                .map(food => (
                  <div
                    key={food.id}
                    className={`search-result-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                    onClick={() => handleSelectFood({ ...food, type: 'custom' })}
                  >
                    <div className="food-name">
                      {food.name}
                      {food.brand && <span className="brand"> ({food.brand})</span>}
                    </div>
                    <div className="food-info">
                      {food.calories} cal | {food.protein}g protein | 
                      {food.carbs}g carbs | {food.fat}g fat
                      <span className="serving-info"> (per {food.serving_size}g)</span>
                    </div>
                  </div>
                ))}
              {customFoods.filter(food => 
                food.name.toLowerCase().includes(customSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="empty-state">
                  {customSearchQuery ? 'No custom foods match your search' : 'No custom foods yet. Create one in My Foods!'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-meals-tab">
            {loadingSavedMeals && <div className="loading">Loading...</div>}
            {!selectedSavedMeal ? (
             savedMeals.length === 0 ? (
              <div className="empty-state">
                <p>No saved meals yet. Save a meal from the Dashboard!</p>
              </div>
            ) : (
              <div className="saved-meals-list">
                {savedMeals.map(meal => (
                  <div key={meal.id} className="saved-meal-item">
                    <div className="meal-header">
                      <h4>{meal.name}</h4>
                      {meal.description && (
                        <p className="meal-description">{meal.description}</p>
                      )}
                    </div>
                    
                    <div className="meal-nutrition">
                      <span>{Math.round(meal.total_calories)} cal</span>
                      <span>{meal.total_protein.toFixed(0)}g P</span>
                      <span>{meal.total_carbs.toFixed(0)}g C</span>
                      <span>{meal.total_fat.toFixed(0)}g F</span>
                    </div>

                    <div className="meal-foods-preview">
                      {meal.foods.slice(0, 3).map((food, idx) => (
                        <span key={idx} className="food-tag">
                          {food.name}
                        </span>
                      ))}
                      {meal.foods.length > 3 && (
                        <span className="food-tag">+{meal.foods.length - 3} more</span>
                      )}
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedSavedMeal(meal)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
              <div className="meal-portion-selector">
                <button 
                  className="btn btn-secondary btn-sm back-btn"
                  onClick={() => {
                    setSelectedSavedMeal(null);
                    setMealPortion(100);
                  }}
                >
                  ← Back to Meals
                </button>

                <h3>{selectedSavedMeal.name}</h3>
                {selectedSavedMeal.description && (
                  <p className="meal-description">{selectedSavedMeal.description}</p>
                )}

                <div className="portion-input-section">
                  <label>Portion Size:</label>
                  <div className="portion-controls">
                    <input
                      type="number"
                      value={mealPortion}
                      onChange={(e) => setMealPortion(Number(e.target.value) || 0)}
                      min="1"
                      max="500"
                      step="5"
                      className="portion-input"
                    />
                    <span className="portion-unit">%</span>
                  </div>
                  <div className="portion-presets">
                    <button onClick={() => setMealPortion(25)} className="preset-btn">25%</button>
                    <button onClick={() => setMealPortion(50)} className="preset-btn">50%</button>
                    <button onClick={() => setMealPortion(75)} className="preset-btn">75%</button>
                    <button onClick={() => setMealPortion(100)} className="preset-btn">100%</button>
                  </div>
                  <p className="portion-hint">
                    100% = full meal as saved. 50% = half portion.
                  </p>
                </div>

                <div className="scaled-nutrition">
                  <h4>Nutrition at {mealPortion}%:</h4>
                  <div className="nutrition-preview">
                    <div className="nutrition-item">
                      <span className="label">Calories</span>
                      <span className="value">{Math.round(selectedSavedMeal.total_calories * mealPortion / 100)}</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">Protein</span>
                      <span className="value">{(selectedSavedMeal.total_protein * mealPortion / 100).toFixed(1)}g</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">Carbs</span>
                      <span className="value">{(selectedSavedMeal.total_carbs * mealPortion / 100).toFixed(1)}g</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">Fat</span>
                      <span className="value">{(selectedSavedMeal.total_fat * mealPortion / 100).toFixed(1)}g</span>
                    </div>
                  </div>
                </div>

                <div className="foods-breakdown">
                  <h4>Foods (scaled to {mealPortion}%):</h4>
                  <ul>
                    {selectedSavedMeal.foods.map((food, idx) => (
                      <li key={idx}>
                        {food.name}: <strong>{(food.quantity * mealPortion / 100).toFixed(1)}g</strong>
                        <span className="original"> (original: {food.quantity}g)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleAddSavedMeal}
                  disabled={adding || mealPortion <= 0}
                >
                  {adding ? 'Adding...' : `Add ${mealPortion}% to ${mealType}`}
                </button>
              </div>
            )}
          </div>
        )}
        {selectedFood && (
          <div className="selected-food-section">
            <h3>Selected: {selectedFood.name}</h3>
            <div className="quantity-input">
              <label>Quantity (g):</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="0.1"
                step="0.1"
              />
            </div>
            <div className="nutrition-preview">
              {selectedFood.type === 'custom' ? (
                <>
                  <p>Calories: {((selectedFood.calories * quantity) / selectedFood.serving_size).toFixed(0)}</p>
                  <p>Protein: {((selectedFood.protein * quantity) / selectedFood.serving_size).toFixed(1)}g</p>
                  <p>Carbs: {((selectedFood.carbs * quantity) / selectedFood.serving_size).toFixed(1)}g</p>
                  <p>Fat: {((selectedFood.fat * quantity) / selectedFood.serving_size).toFixed(1)}g</p>
                </>
              ) : (
                <>
              <p>Calories: {((selectedFood.calories * quantity) / 100).toFixed(0)}</p>
              <p>Protein: {((selectedFood.protein * quantity) / 100).toFixed(1)}g</p>
              <p>Carbs: {((selectedFood.carbs * quantity) / 100).toFixed(1)}g</p>
              <p>Fat: {((selectedFood.fat * quantity) / 100).toFixed(1)}g</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleAddFood}
            disabled={!selectedFood || quantity <= 0 || adding}
          >
            {adding ? 'Adding...' : 'Add Food'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFoodModal;