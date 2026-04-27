import React from 'react';

export default function Select({ label, error, icon, options = [], className = '', ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {icon && icon}
          {label}
        </label>
      )}
      <select className={`form-input ${error ? 'error' : ''} ${className}`} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
