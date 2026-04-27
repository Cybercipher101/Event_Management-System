import React from 'react';
import './Badge.css';

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${variant !== 'default' ? variant : ''} ${className}`}>
      {children}
    </span>
  );
}
