import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/users';
import useApi from '../hooks/useApi';
import './Pages.css';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [goals, setGoals] = useState({
    daily_calories: user?.daily_calories || 2000,
    daily_protein: user?.daily_protein || 50,
    daily_carbs: user?.daily_carbs || 275,
    daily_fat: user?.daily_fat || 78,
    daily_fiber: user?.daily_fiber || 28
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { execute: updateGoals, loading: updating } = useApi(userService.updateGoals);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
    setMessage('');
    setError('');
  };

  const calculateMacroCalories = () => {
    const proteinCals = goals.daily_protein * 4;
    const carbsCals = goals.daily_carbs * 4;
    const fatCals = goals.daily_fat * 9;
    return proteinCals + carbsCals + fatCals;
  };

  const getMacroPercentages = () => {
    const totalCals = calculateMacroCalories();
    if (totalCals === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: ((goals.daily_protein * 4) / totalCals * 100).toFixed(0),
      carbs: ((goals.daily_carbs * 4) / totalCals * 100).toFixed(0),
      fat: ((goals.daily_fat * 9) / totalCals * 100).toFixed(0)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate inputs
    if (goals.daily_calories < 1200 || goals.daily_calories > 5000) {
      setError('Calories must be between 1200 and 5000');
      return;
    }

    const macroCalories = calculateMacroCalories();
    const variance = Math.abs(macroCalories - goals.daily_calories);
    const percentVariance = (variance / goals.daily_calories) * 100;

    if (percentVariance > 15) {
      const confirm = window.confirm(
        `Warning: Your macro goals (${Math.round(macroCalories)} cals) don't match your calorie goal (${goals.daily_calories} cals). Continue anyway?`
      );
      if (!confirm) return;
    }

    const result = await updateGoals(goals);

    if (result.success) {
      setMessage('Goals updated successfully!');
      // Update user context with new goals
      updateUser({ ...user, ...goals });
    } else {
      setError(result.error || 'Failed to update goals');
    }
  };

  const resetToDefaults = () => {
    setGoals({
      daily_calories: 2000,
      daily_protein: 50,
      daily_carbs: 275,
      daily_fat: 78,
      daily_fiber: 28
    });
    setMessage('');
    setError('');
  };

  const macroPercentages = getMacroPercentages();
  const calculatedCalories = calculateMacroCalories();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Daily Nutrition Goals</h2>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>Daily Calorie Goal</label>
              <input
                type="number"
                name="daily_calories"
                value={goals.daily_calories}
                onChange={handleChange}
                min="1200"
                max="5000"
                step="10"
                required
              />
              <span className="hint">Recommended: 1200-5000 calories</span>
            </div>

            <div className="macros-section">
              <h3>Macronutrients</h3>

              <div className="form-group">
                <label>Daily Protein (g)</label>
                <input
                  type="number"
                  name="daily_protein"
                  value={goals.daily_protein}
                  onChange={handleChange}
                  min="20"
                  max="300"
                  step="1"
                  required
                />
                <span className="hint">
                  {macroPercentages.protein}% of calories ({goals.daily_protein * 4} cal)
                </span>
              </div>

              <div className="form-group">
                <label>Daily Carbs (g)</label>
                <input
                  type="number"
                  name="daily_carbs"
                  value={goals.daily_carbs}
                  onChange={handleChange}
                  min="50"
                  max="500"
                  step="1"
                  required
                />
                <span className="hint">
                  {macroPercentages.carbs}% of calories ({goals.daily_carbs * 4} cal)
                </span>
              </div>

              <div className="form-group">
                <label>Daily Fat (g)</label>
                <input
                  type="number"
                  name="daily_fat"
                  value={goals.daily_fat}
                  onChange={handleChange}
                  min="20"
                  max="200"
                  step="1"
                  required
                />
                <span className="hint">
                  {macroPercentages.fat}% of calories ({goals.daily_fat * 9} cal)
                </span>
              </div>

              <div className="form-group">
                <label>Daily Fiber (g)</label>
                <input
                  type="number"
                  name="daily_fiber"
                  value={goals.daily_fiber}
                  onChange={handleChange}
                  min="10"
                  max="50"
                  step="1"
                  required
                />
                <span className="hint">Recommended: 25-35g per day</span>
              </div>
            </div>

            <div className="macro-summary">
              <h4>Macro Summary</h4>
              <div className="summary-info">
                <p>
                  Calories from macros: <strong>{Math.round(calculatedCalories)}</strong>
                </p>
                <p>
                  Your calorie goal: <strong>{goals.daily_calories}</strong>
                </p>
                {Math.abs(calculatedCalories - goals.daily_calories) > 50 && (
                  <p className="warning">
                    ⚠️ Difference of {Math.abs(Math.round(calculatedCalories - goals.daily_calories))} calories
                  </p>
                )}
              </div>
              <div className="macro-pie">
                <div className="pie-item">
                  <div className="color-box protein"></div>
                  <span>Protein: {macroPercentages.protein}%</span>
                </div>
                <div className="pie-item">
                  <div className="color-box carbs"></div>
                  <span>Carbs: {macroPercentages.carbs}%</span>
                </div>
                <div className="pie-item">
                  <div className="color-box fat"></div>
                  <span>Fat: {macroPercentages.fat}%</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </form>
        </div>

        <div className="settings-card">
          <h2>Quick Presets</h2>
          <p className="hint">Common macro ratios for different goals</p>

          <div className="presets-grid">
            <button
              className="preset-btn"
              onClick={() => {
                const cals = goals.daily_calories;
                setGoals({
                  ...goals,
                  daily_protein: Math.round(cals * 0.30 / 4),
                  daily_carbs: Math.round(cals * 0.40 / 4),
                  daily_fat: Math.round(cals * 0.30 / 9)
                });
              }}
            >
              <strong>Balanced</strong>
              <span>30% P / 40% C / 30% F</span>
            </button>

            <button
              className="preset-btn"
              onClick={() => {
                const cals = goals.daily_calories;
                setGoals({
                  ...goals,
                  daily_protein: Math.round(cals * 0.35 / 4),
                  daily_carbs: Math.round(cals * 0.30 / 4),
                  daily_fat: Math.round(cals * 0.35 / 9)
                });
              }}
            >
              <strong>High Protein</strong>
              <span>35% P / 30% C / 35% F</span>
            </button>

            <button
              className="preset-btn"
              onClick={() => {
                const cals = goals.daily_calories;
                setGoals({
                  ...goals,
                  daily_protein: Math.round(cals * 0.25 / 4),
                  daily_carbs: Math.round(cals * 0.50 / 4),
                  daily_fat: Math.round(cals * 0.25 / 9)
                });
              }}
            >
              <strong>High Carb</strong>
              <span>25% P / 50% C / 25% F</span>
            </button>

            <button
              className="preset-btn"
              onClick={() => {
                const cals = goals.daily_calories;
                setGoals({
                  ...goals,
                  daily_protein: Math.round(cals * 0.30 / 4),
                  daily_carbs: Math.round(cals * 0.10 / 4),
                  daily_fat: Math.round(cals * 0.60 / 9)
                });
              }}
            >
              <strong>Keto</strong>
              <span>30% P / 10% C / 60% F</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;