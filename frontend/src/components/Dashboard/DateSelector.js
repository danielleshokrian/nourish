import React from 'react';
import { format, addDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import './Dashboard.css';

const DateSelector = ({ selectedDate, onDateChange }) => {
  const handlePreviousDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isYesterday(selectedDate)) return 'Yesterday';
    if (isTomorrow(selectedDate)) return 'Tomorrow';
    return format(selectedDate, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className="date-selector">
      <button 
        onClick={handlePreviousDay}
        className="date-nav-btn"
        aria-label="Previous day"
      >
        <ChevronLeftIcon className="icon" />
      </button>

      <div className="date-display">
        <div className="date-label">{getDateLabel()}</div>
        {!isToday(selectedDate) && (
          <button onClick={handleToday} className="btn-today">
            Go to Today
          </button>
        )}
      </div>

      <button 
        onClick={handleNextDay}
        className="date-nav-btn"
        aria-label="Next day"
      >
        <ChevronRightIcon className="icon" />
      </button>
    </div>
  );
};

export default DateSelector;