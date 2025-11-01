import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import foodService from '../../services/foods';
import entryService from '../../services/entries';
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
  
  const { execute: searchFoods, loading: searching } = useApi(foodService.searchFoods);
  const { execute: addEntry, loading: adding } = useApi(entryService.createEntry);
  const { execute: fetchCustomFoods, loading: loadingCustom } = useApi(foodService.getCustomFoods);

  useEffect(() => {
    if (isOpen) {
      loadCustomFoods(); 
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