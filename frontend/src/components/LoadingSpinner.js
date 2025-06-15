// ============================================================================
// components/LoadingSpinner.js - Reusable Loading Component
// ============================================================================

import React from 'react';
import { Brain } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading...", size = "large" }) => {
  return (
    <div className="app-container">
      <div className="loading-container">
        <div className={`loading-content ${size}`}>
          <div className="loading-icon-container">
            <Brain className="loading-icon" />
          </div>
          <div className="loading-spinner"></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;