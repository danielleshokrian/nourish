import React from 'react';
import './Input.css';

const Input = ({
  label,
  error,
  type = 'text',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`input ${error ? 'input-error' : ''}`}
        required={required}
        {...props}
      />
      {error && (
        <span className="input-error-message">{error}</span>
      )}
    </div>
  );
};

export default Input;