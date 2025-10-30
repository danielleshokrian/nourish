import React, { useState, useEffect } from 'react';
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
  
  const { execute: searchFoods, loading: searching } = useApi(foodService.searchFoods);
  const { execute: addEntry, loading: adding } = useApi(entryService.createEntry);

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

  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  const handleAddFood = async () => {
    if (!selectedFood || quantity <= 0) return;

    const entryData = {
      food_id: selectedFood.type === 'custom' ? null : selectedFood.id,
      custom_food_id: selectedFood.type === 'custom' ? selectedFood.id : null,
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
              <p>Calories: {((selectedFood.calories * quantity) / 100).toFixed(0)}</p>
              <p>Protein: {((selectedFood.protein * quantity) / 100).toFixed(1)}g</p>
              <p>Carbs: {((selectedFood.carbs * quantity) / 100).toFixed(1)}g</p>
              <p>Fat: {((selectedFood.fat * quantity) / 100).toFixed(1)}g</p>
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