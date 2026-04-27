import React from 'react';
import './Skeleton.css';

export default function Skeleton({ width, height, borderRadius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}
