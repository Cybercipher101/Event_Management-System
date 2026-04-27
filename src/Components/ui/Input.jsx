import React from 'react';

export default function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {icon && icon}
          {label}
        </label>
      )}
      <input
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
