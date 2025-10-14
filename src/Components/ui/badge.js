import React from 'react';

export default function Badge({ children }) {
  return <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>{children}</span>;
}
