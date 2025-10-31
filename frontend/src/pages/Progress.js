import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import entryService from '../services/entries';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import './Pages.css';

const Progress = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const { execute: fetchSummary } = useApi(entryService.getDailySummary);

  useEffect(() => {
    loadWeeklyData();
  }, [selectedWeek]);

  const loadWeeklyData = async () => {
    setLoading(true);
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });

    const promises = [];
    const dates = [];

    // Fetch data for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = subDays(weekEnd, 6 - i);
      dates.push(currentDate);
      promises.push(fetchSummary(format(currentDate, 'yyyy-MM-dd')));
    }

    const results = await Promise.all(promises);

    const weekData = results.map((result, index) => {
      if (result.success && result.data) {
        return {
          date: dates[index],
          dateStr: format(dates[index], 'EEE, MMM d'),
          nutrients: result.data.nutrients
        };
      }
      return {
        date: dates[index],
        dateStr: format(dates[index], 'EEE, MMM d'),
        nutrients: null
      };
    });

    setWeeklyData(weekData);
    setLoading(false);
  };

  const goToPreviousWeek = () => {
    setSelectedWeek(prev => subDays(prev, 7));
  };

  const goToNextWeek = () => {
    setSelectedWeek(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const calculateWeeklyAverage = (nutrient) => {
    const validDays = weeklyData.filter(day => day.nutrients);
    if (validDays.length === 0) return 0;

    const total = validDays.reduce((sum, day) => {
      return sum + (day.nutrients[nutrient]?.consumed || 0);
    }, 0);

    return (total / validDays.length).toFixed(1);
  };

  const calculateWeeklyTotal = (nutrient) => {
    return weeklyData.reduce((sum, day) => {
      return sum + (day.nutrients?.[nutrient]?.consumed || 0);
    }, 0).toFixed(1);
  };

  const getCompliancePercentage = () => {
    const daysWithData = weeklyData.filter(day => day.nutrients).length;
    return ((daysWithData / 7) * 100).toFixed(0);
  };

  if (loading) {
    return <div className="loading">Loading progress data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress Tracking</h1>
      </div>

      <div className="week-selector">
        <button className="btn btn-secondary" onClick={goToPreviousWeek}>
          ← Previous Week
        </button>
        <button className="btn btn-secondary" onClick={goToCurrentWeek}>
          Current Week
        </button>
        <button className="btn btn-secondary" onClick={goToNextWeek}>
          Next Week →
        </button>
      </div>

      <div className="progress-summary">
        <div className="summary-card">
          <h3>Weekly Compliance</h3>
          <div className="stat-value">{getCompliancePercentage()}%</div>
          <div className="stat-label">Days Tracked</div>
        </div>

        <div className="summary-card">
          <h3>Avg Daily Calories</h3>
          <div className="stat-value">{calculateWeeklyAverage('calories')}</div>
          <div className="stat-label">Goal: {user?.daily_calories || 2000}</div>
        </div>

        <div className="summary-card">
          <h3>Avg Daily Protein</h3>
          <div className="stat-value">{calculateWeeklyAverage('protein')}g</div>
          <div className="stat-label">Goal: {user?.daily_protein || 50}g</div>
        </div>

        <div className="summary-card">
          <h3>Weekly Total Calories</h3>
          <div className="stat-value">{calculateWeeklyTotal('calories')}</div>
          <div className="stat-label">This Week</div>
        </div>
      </div>

      <div className="daily-breakdown">
        <h2>Daily Breakdown</h2>
        <div className="daily-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Fiber</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((day, index) => (
                <tr key={index} className={!day.nutrients ? 'no-data' : ''}>
                  <td>{day.dateStr}</td>
                  {day.nutrients ? (
                    <>
                      <td>
                        {Math.round(day.nutrients.calories?.consumed || 0)}
                        <span className="goal-indicator">
                          {' / '}{day.nutrients.calories?.goal}
                        </span>
                      </td>
                      <td>
                        {day.nutrients.protein?.consumed.toFixed(1)}g
                        <span className="goal-indicator">
                          {' / '}{day.nutrients.protein?.goal}g
                        </span>
                      </td>
                      <td>
                        {day.nutrients.carbs?.consumed.toFixed(1)}g
                        <span className="goal-indicator">
                          {' / '}{day.nutrients.carbs?.goal}g
                        </span>
                      </td>
                      <td>
                        {day.nutrients.fat?.consumed.toFixed(1)}g
                        <span className="goal-indicator">
                          {' / '}{day.nutrients.fat?.goal}g
                        </span>
                      </td>
                      <td>
                        {day.nutrients.fiber?.consumed.toFixed(1)}g
                        <span className="goal-indicator">
                          {' / '}{day.nutrients.fiber?.goal}g
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan="5" className="no-data-text">No data logged</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="weekly-totals">
        <h2>Weekly Totals</h2>
        <div className="totals-grid">
          <div className="total-item">
            <span className="label">Calories</span>
            <span className="value">{calculateWeeklyTotal('calories')}</span>
          </div>
          <div className="total-item">
            <span className="label">Protein</span>
            <span className="value">{calculateWeeklyTotal('protein')}g</span>
          </div>
          <div className="total-item">
            <span className="label">Carbs</span>
            <span className="value">{calculateWeeklyTotal('carbs')}g</span>
          </div>
          <div className="total-item">
            <span className="label">Fat</span>
            <span className="value">{calculateWeeklyTotal('fat')}g</span>
          </div>
          <div className="total-item">
            <span className="label">Fiber</span>
            <span className="value">{calculateWeeklyTotal('fiber')}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;