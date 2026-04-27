import React from 'react';

export default function Textarea({ label, error, icon, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {icon && icon}
          {label}
        </label>
      )}
      <textarea
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
