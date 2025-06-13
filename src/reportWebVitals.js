// Performance monitoring utility for Socratic CS Learning Platform
// Enhanced for local development with detailed metrics and debugging

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Core Web Vitals
      getCLS((metric) => {
        onPerfEntry({
          ...metric,
          category: 'Web Vitals',
          description: 'Cumulative Layout Shift - visual stability'
        });
      });
      
      getFID((metric) => {
        onPerfEntry({
          ...metric,
          category: 'Web Vitals',
          description: 'First Input Delay - interactivity'
        });
      });
      
      getFCP((metric) => {
        onPerfEntry({
          ...metric,
          category: 'Web Vitals',
          description: 'First Contentful Paint - loading speed'
        });
      });
      
      getLCP((metric) => {
        onPerfEntry({
          ...metric,
          category: 'Web Vitals',
          description: 'Largest Contentful Paint - perceived loading speed'
        });
      });
      
      getTTFB((metric) => {
        onPerfEntry({
          ...metric,
          category: 'Web Vitals',
          description: 'Time to First Byte - server response time'
        });
      });
    }).catch(error => {
      console.warn('Web Vitals could not be loaded:', error);
    });
  }
};

// Enhanced performance monitoring for local development
export const trackLearningMetrics = {
  // Track question response times
  trackQuestionResponse: (questionId, responseTime, isCorrect) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Question Metrics:`, {
        questionId,
        responseTime: Math.round(responseTime),
        isCorrect,
        timestamp: new Date().toISOString()
      });
    }
    
    // In production, you might send this to an analytics service
    // analytics.track('question_answered', { questionId, responseTime, isCorrect });
  },
  
  // Track session duration and engagement
  trackSession: (sessionData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Session Metrics:`, {
        duration: Math.round(sessionData.duration / 1000) + 's',
        questionsAnswered: sessionData.questionsAnswered,
        correctRate: Math.round(sessionData.correctRate * 100) + '%',
        learningPath: sessionData.learningPath,
        topic: sessionData.topic,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Track ice cream button usage (break patterns)
  trackBreakPattern: (breakData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🍦 Break Pattern:`, {
        questionsBeforeBreak: breakData.questionsBeforeBreak,
        sessionTime: Math.round(breakData.sessionTime / 1000) + 's',
        correctRate: Math.round(breakData.correctRate * 100) + '%',
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Track learning progress over time
  trackProgress: (progressData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Learning Progress:`, {
        topic: progressData.topic,
        conceptsMastered: progressData.conceptsMastered,
        difficulty: progressData.difficulty,
        timeSpent: Math.round(progressData.timeSpent / 1000) + 's',
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Memory usage monitoring for development
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = performance.memory;
    console.log(`💾 Memory Usage:`, {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB',
      timestamp: new Date().toISOString()
    });
  }
};

// Performance observer for additional metrics
export const observePerformance = () => {
  if (process.env.NODE_ENV === 'development' && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`⚡ Performance Entry:`, {
            name: entry.name,
            type: entry.entryType,
            startTime: Math.round(entry.startTime),
            duration: Math.round(entry.duration),
            timestamp: new Date().toISOString()
          });
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
};

// Network information monitoring
export const monitorNetworkInfo = () => {
  if (process.env.NODE_ENV === 'development' && 'connection' in navigator) {
    const connection = navigator.connection;
    console.log(`🌐 Network Info:`, {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
      timestamp: new Date().toISOString()
    });
    
    // Monitor network changes
    connection.addEventListener('change', () => {
      console.log(`🌐 Network Changed:`, {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        timestamp: new Date().toISOString()
      });
    });
  }
};

// Initialize performance monitoring for development
if (process.env.NODE_ENV === 'development') {
  // Start memory monitoring
  setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  
  // Start performance observation
  observePerformance();
  
  // Monitor network information
  monitorNetworkInfo();
  
  // Log app initialization time
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`🚀 App Load Time: ${loadTime}ms`);
  });
}

export default reportWebVitals;