import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import entryService from '../../services/entries';
import NutritionCard from './NutritionCard';
import DateSelector from './DateSelector';
import MealCard from '../Meals/MealCard';
import useApi from '../../hooks/useApi';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState(null);
  
  const { 
    data: summaryData, 
    loading: summaryLoading, 
    execute: fetchSummary 
  } = useApi(entryService.getDailySummary);
  
  const { 
    data: entriesData, 
    loading: entriesLoading, 
    execute: fetchEntries 
  } = useApi(entryService.getEntriesByDate);

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const [summaryResult, entriesResult] = await Promise.all([
      fetchSummary(dateStr),
      fetchEntries(dateStr)
    ]);

    if (summaryResult.success && entriesResult.success) {
      setDailyData({
        summary: summaryResult.data,
        entries: entriesResult.data
      });
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleEntryAdded = () => {
    loadDailyData(); 
  };

  const handleEntryDeleted = () => {
    loadDailyData(); 
  };

  if (summaryLoading || entriesLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Daily Nutrition</h1>
        <DateSelector 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      {dailyData && (
        <>
          <div className="nutrition-grid">
            {Object.keys(dailyData.summary.nutrients).map(nutrient => (
              <NutritionCard
                key={nutrient}
                nutrient={nutrient}
                data={dailyData.summary.nutrients[nutrient]}
              />
            ))}
          </div>

          <div className="meals-section">
            {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => (
              <MealCard
                key={mealType}
                mealType={mealType}
                entries={dailyData.entries[mealType] || []}
                date={format(selectedDate, 'yyyy-MM-dd')}
                onEntryAdded={handleEntryAdded}
                onEntryDeleted={handleEntryDeleted}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;