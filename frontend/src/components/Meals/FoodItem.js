import React, { useState } from 'react';
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import entryService from '../../services/entries';
import './MealCard.css';

const FoodItem = ({ entry, onDelete, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(entry.quantity);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Delete this food entry?')) {
      setIsDeleting(true);
      
      try {
        await entryService.deleteEntry(entry.id);
        onDelete(entry.id);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditQuantity(entry.quantity);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditQuantity(entry.quantity);
  };

  const handleSave = async () => {
    if (editQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setIsSaving(true);

    try {
      const response = await entryService.updateEntry(entry.id, {
        quantity: parseFloat(editQuantity)
      });
      
      if (response && response.entry) {
        if (onUpdate) {
          onUpdate(response.entry);
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Failed to update entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };


  return (
    <div className="food-item">
      <div className="food-info">
        <span className="food-name">{entry.name}</span>
        <span className="food-quantity">{entry.quantity}g</span>
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
          <span className="food-quantity">{entry.quantity}g</span>
        )}
      </div>
      
      <div className="food-macros">
        <span className="food-calories">{Math.round(entry.calories)} cal</span>
        <span className="food-macro">P: {Math.round(entry.protein)}g</span>
        <span className="food-macro">C: {Math.round(entry.carbs)}g</span>
        <span className="food-macro">F: {Math.round(entry.fat)}g</span>
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
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete entry"
              title="Delete"
            >
              <TrashIcon className="icon-sm" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};


export default FoodItem;