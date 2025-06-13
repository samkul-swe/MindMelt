// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo for components that use scrolling
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock scrollIntoView for message scrolling
Element.prototype.scrollIntoView = jest.fn();

// Mock performance.memory for development utilities
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 10000000,
    totalJSHeapSize: 20000000,
    jsHeapSizeLimit: 50000000,
  },
});

// Mock navigator.connection for network monitoring
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock localStorage for any future storage needs
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Web Vitals for performance testing
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

// Custom jest matchers for educational app testing
expect.extend({
  toHaveCorrectAnswer(received, expected) {
    const pass = received.toLowerCase().includes(expected.toLowerCase());
    if (pass) {
      return {
        message: () => `expected ${received} not to contain ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to contain ${expected}`,
        pass: false,
      };
    }
  },
  
  toBeWithinResponseTime(received, maxTime) {
    const pass = received <= maxTime;
    if (pass) {
      return {
        message: () => `expected ${received}ms to be greater than ${maxTime}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received}ms to be within ${maxTime}ms`,
        pass: false,
      };
    }
  },
  
  toHaveValidProgress(received, expected) {
    const { questionsAnswered, correctAnswers, progressPercentage } = received;
    const pass = questionsAnswered >= 0 && 
                 correctAnswers >= 0 && 
                 correctAnswers <= questionsAnswered &&
                 progressPercentage >= 0 && 
                 progressPercentage <= 100;
    
    if (pass) {
      return {
        message: () => `expected progress to be invalid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected valid progress object with questionsAnswered: ${questionsAnswered}, correctAnswers: ${correctAnswers}, progressPercentage: ${progressPercentage}`,
        pass: false,
      };
    }
  }
});

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.REACT_APP_VERSION = '1.0.0';

// Console methods to help with debugging tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillMount'))
    ) {
      // Suppress known warnings in tests
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Helper functions for testing
global.testUtils = {
  // Simulate user typing with realistic delays
  simulateTyping: async (element, text, delay = 50) => {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await new Promise(resolve => setTimeout(resolve, delay));
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },
  
  // Wait for specific condition
  waitForCondition: async (condition, timeout = 5000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
  
  // Create mock question tree for testing
  createMockQuestionTree: () => ({
    start: {
      question: "Test question?",
      hint: "Test hint",
      responses: {
        "test": "end"
      },
      fallback: "end"
    },
    end: {
      question: "Test complete!",
      responses: {},
      fallback: "end"
    }
  }),
  
  // Create mock progress data
  createMockProgress: (count = 5, correctRate = 0.6) => {
    return Array.from({ length: count }, (_, i) => ({
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      correct: Math.random() < correctRate,
      timestamp: new Date(Date.now() - (count - i) * 60000),
      nodeId: `node_${i}`,
      responseTime: Math.random() * 30000 + 5000
    }));
  }
};

// Performance monitoring for tests
const performanceObserver = {
  marks: new Map(),
  
  mark: (name) => {
    performanceObserver.marks.set(name, performance.now());
  },
  
  measure: (name, startMark, endMark) => {
    const start = performanceObserver.marks.get(startMark) || 0;
    const end = performanceObserver.marks.get(endMark) || performance.now();
    return end - start;
  },
  
  clear: () => {
    performanceObserver.marks.clear();
  }
};

global.testPerformance = performanceObserver;

// Accessibility testing helpers
global.a11yUtils = {
  // Check if element has proper ARIA labels
  hasProperLabels: (element) => {
    return element.hasAttribute('aria-label') || 
           element.hasAttribute('aria-labelledby') ||
           element.hasAttribute('title');
  },
  
  // Check color contrast (simplified)
  hasGoodContrast: (element) => {
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    const textColor = style.color;
    // Simplified contrast check - in real tests you'd use a proper contrast library
    return bgColor !== textColor;
  },
  
  // Check keyboard accessibility
  isKeyboardAccessible: (element) => {
    return element.tabIndex >= 0 || 
           ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());
  }
};

// Mock animation frame for smooth animations in tests
let animationFrameId = 0;
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 16); // 16ms = ~60fps
  return ++animationFrameId;
};

global.cancelAnimationFrame = (id) => {
  // No-op in tests
};

// Setup for async testing
jest.setTimeout(10000); // 10 second timeout for async tests

// Clean up after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear performance marks
  if (global.testPerformance) {
    global.testPerformance.clear();
  }
  
  // Clear mocks
  jest.clearAllMocks();
});

// Global test configuration
global.testConfig = {
  defaultTimeout: 5000,
  longTimeout: 10000,
  shortTimeout: 1000,
  animationTimeout: 500,
  networkTimeout: 3000
};