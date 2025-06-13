import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SocraticCSApp from './App';

// Performance monitoring (optional)
const logPerformance = (name, value) => {
  console.log(`Performance metric - ${name}:`, value);
};

// Report web vitals for performance monitoring
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocraticCSApp />
  </React.StrictMode>
);

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(logPerformance);
}