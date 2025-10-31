import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import FoodItem from './FoodItem';
import AddFoodModal from './AddFoodModal';
import './MealCard.css';

const MealCard = ({ mealType, entries, date, onEntryAdded, onEntryDeleted }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h3 className="meal-title">
          {getMealTitle()}
        </h3>
        <button 
          className="btn-add-food"
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
    </div>
  );
};

export default MealCard;
