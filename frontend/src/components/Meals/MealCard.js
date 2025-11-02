import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import FoodItem from './FoodItem';
import AddFoodModal from './AddFoodModal';
import './MealCard.css';
import mealService from '../../services/meals';
import Modal from '../Common/Modal';


const MealCard = ({ mealType, entries, date, onEntryAdded, onEntryDeleted }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');

  const getMealTitle = () => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const calculateMealTotals = () => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
      fiber: totals.fiber + entry.fiber
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });
  };

  const totals = calculateMealTotals();

  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (entries.length === 0) {
      alert('No foods to save');
      return;
    }

    setIsSavingMeal(true);

    try {
      const foods = entries.map(entry => ({
        food_id: entry.food_id,
        custom_food_id: entry.custom_food_id,
        name: entry.name,
        quantity: entry.quantity,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber
      }));

      const result = await mealService.createSavedMeal({
        name: mealName,
        description: mealDescription,
        foods: foods,
      });

      if (result) {
        alert('Meal saved successfully!');
        setShowSaveModal(false);
        setMealName('');
        setMealDescription('');
      }
    } catch (error) {
      alert('Failed to save meal: ' + error.message);
    } finally {
      setIsSavingMeal(false);
    }
  };

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
        <span className="entry-count">{entries.length} items</span>
      </div>
      <div className="meal-actions">
        {entries.length > 0 && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSaveModal(true)}
            title="Save this meal for later"
          >
            Save Meal
          </button>
        )}
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon className="icon-sm" />
          Add Food
        </button>
      </div>

      {entries.length > 0 && (
        <div className="meal-macros">
          <div className="macro-item">
            <span className="macro-label">Calories</span>
            <span className="macro-value">{Math.round(totals.calories)}</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Protein</span>
            <span className="macro-value">{Math.round(totals.protein)}g</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Carbs</span>
            <span className="macro-value">{Math.round(totals.carbs)}g</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Fat</span>
            <span className="macro-value">{Math.round(totals.fat)}g</span>
          </div>
          <div className="macro-item">
            <span className="macro-label">Fiber</span>
            <span className="macro-value">{Math.round(totals.fiber)}g</span>
          </div>
        </div>
      )}

      <div className="food-list">
        {entries.length > 0 ? (
          entries.map(entry => (
            <FoodItem
              key={entry.id}
              entry={entry}
              onDelete={onEntryDeleted}
            />
          ))
        ) : (
          <div className="empty-meal">
            No foods added yet
          </div>
        )}
      </div>

      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mealType={mealType}
        date={date}
        onFoodAdded={onEntryAdded}
      />
      {showSaveModal && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setMealName('');
            setMealDescription('');
          }}
          title="Save Meal"
        >
          <div className="save-meal-form">
            <p>Save these {entries.length} foods as a reusable meal template</p>
            
            <div className="form-group">
              <label>Meal Name *</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., My Protein Breakfast"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="e.g., High protein breakfast for workout days"
                rows="3"
              />
            </div>

            <div className="meal-preview">
              <h4>Foods in this meal:</h4>
              <ul>
                {entries.map((entry, idx) => (
                  <li key={idx}>{entry.name} - {entry.quantity}g</li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowSaveModal(false);
                  setMealName('');
                  setMealDescription('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveMeal}
                disabled={isSavingMeal || !mealName.trim()}
              >
                {isSavingMeal ? 'Saving...' : 'Save Meal'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MealCard;
