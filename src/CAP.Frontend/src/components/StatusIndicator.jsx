import React from 'react';

// status = 'ok' | 'warn' | 'danger'
export default function StatusIndicator({ status, label }) {
  // Tradução do estado clareza
  let cssClass = 'ok';
  if (status === 'warn') cssClass = 'warn';
  if (status === 'danger') cssClass = 'danger';

  return (
    <span className={`status-badge ${cssClass}`}>
      {label}
    </span>
  );
}
