import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import './MealCard.css';

const SavedMealFoodItem = ({ food, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(food.quantity);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditQuantity(food.quantity);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditQuantity(food.quantity);
  };

  const handleSave = async () => {
    const newQuantity = parseFloat(editQuantity);
    
    if (newQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setIsSaving(true);

    const ratio = newQuantity / food.quantity;
    const updatedFood = {
      ...food,
      quantity: newQuantity,
      calories: food.calories * ratio,
      protein: food.protein * ratio,
      carbs: food.carbs * ratio,
      fat: food.fat * ratio,
      fiber: (food.fiber || 0) * ratio
    };

    await onUpdate(updatedFood);
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Remove ${food.name} from this meal?`)) {
      onRemove(food);
    }
  };

  return (
    <div className="food-item">
      <div className="food-info">
        <div className="food-name-section">
          <span className="food-name">{food.name}</span>
          {isEditing ? (
            <div className="quantity-edit">
              <input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                onKeyDown={handleKeyPress}
                className="quantity-input-field"
                min="1"
                step="1"
                autoFocus
              />
              <span className="quantity-unit">g</span>
            </div>
          ) : (
            <span className="food-quantity">{food.quantity}g</span>
          )}
        </div>
      </div>

      <div className="food-macros">
        <span className="food-calories">{Math.round(food.calories)} cal</span>
        <span className="food-macro">P: {Math.round(food.protein)}g</span>
        <span className="food-macro">C: {Math.round(food.carbs)}g</span>
        <span className="food-macro">F: {Math.round(food.fat)}g</span>
      </div>

      <div className="food-actions">
        {isEditing ? (
          <>
            <button
              className="btn-icon btn-icon-success"
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Save changes"
              title="Save"
            >
              <CheckIcon className="icon-sm" />
            </button>
            <button
              className="btn-icon"
              onClick={handleCancel}
              disabled={isSaving}
              aria-label="Cancel editing"
              title="Cancel"
            >
              <XMarkIcon className="icon-sm" />
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-icon"
              onClick={handleEdit}
              aria-label="Edit quantity"
              title="Edit quantity"
            >
              <PencilIcon className="icon-sm" />
            </button>
            <button
              className="btn-icon btn-icon-danger"
              onClick={handleRemove}
              aria-label="Remove from meal"
              title="Remove"
            >
              <TrashIcon className="icon-sm" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedMealFoodItem;