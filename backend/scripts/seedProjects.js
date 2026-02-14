import db from '../config/firebase.js';

/**
 * Seed Mobile Engineering Projects to Firestore
 * Run once to populate the project library
 */

const mobileProjects = [
  {
    projectId: 'mobile_project_1',
    domain: 'Mobile Engineering',
    projectName: 'Todo List App',
    difficulty: 'Easy',
    timeEstimate: 6, // hours
    order: 1,
    description: 'Build a mobile todo list app with persistent storage and CRUD operations',
    requirements: [
      'Add new todos with text input',
      'Mark todos as complete/incomplete',
      'Delete todos',
      'Display list of all todos',
      'Persist todos (survive app restart)'
    ],
    successCriteria: [
      'App works on mobile simulator',
      'All CRUD operations functional',
      'Data persists across app restarts',
      'Clean, mobile-friendly UI'
    ],
    learningObjectives: [
      'React Native component architecture',
      'AsyncStorage for persistence',
      'State management with useState',
      'List rendering and optimization'
    ],
    scaffoldCode: {
      javascript: `import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // TODO: Initialize state for todos
  const [todos, setTodos] = useState([]);
  
  // TODO: Load todos from AsyncStorage on mount
  useEffect(() => {
    // YOUR CODE HERE
    // Hint: AsyncStorage.getItem() returns a Promise
  }, []);
  
  // TODO: Save todos to AsyncStorage whenever they change
  useEffect(() => {
    // YOUR CODE HERE
    // Hint: AsyncStorage.setItem() needs JSON.stringify()
  }, [todos]);
  
  // TODO: Implement addTodo function
  const addTodo = (text) => {
    // YOUR CODE HERE
    // Hint: Generate unique ID (Date.now() + Math.random())
  };
  
  // TODO: Implement deleteTodo function
  const deleteTodo = (id) => {
    // YOUR CODE HERE
    // Hint: Use filter(), don't mutate state
  };
  
  // TODO: Implement toggleTodo function
  const toggleTodo = (id) => {
    // YOUR CODE HERE
  };
  
  return (
    <View style={styles.container}>
      {/* YOUR COMPONENTS HERE */}
    </View>
  );
}`
    },
    socraticStarterQuestions: [
      "Before writing code, how would you architect this app? What are the main components you'd need?",
      "Where should you store the list of todos?",
      "How will todos survive an app restart?"
    ],
    commonBugs: [
      {
        type: 'logical',
        issue: 'Using array index as ID',
        scenario: 'Add 3 todos, delete middle one, add another',
        socraticQuestion: 'What ID does the new todo get? What happens to your array?'
      },
      {
        type: 'bestPractice',
        issue: 'State mutation with splice()',
        scenario: 'React shows mutation warning',
        socraticQuestion: 'Look at your deleteTodo function. Are you mutating state?'
      }
    ]
  },

  {
    projectId: 'mobile_project_2',
    domain: 'Mobile Engineering',
    projectName: 'Weather App',
    difficulty: 'Medium',
    timeEstimate: 8,
    order: 2,
    description: 'Build a weather app that fetches data from an API and displays forecasts',
    requirements: [
      'Search for city weather',
      'Display current temperature and conditions',
      'Show 5-day forecast',
      'Handle loading states',
      'Handle API errors gracefully'
    ],
    successCriteria: [
      'Can search any city and get weather',
      'Shows loading spinner during fetch',
      'Displays error messages appropriately',
      'UI updates smoothly',
      'Handles no internet scenario'
    ],
    learningObjectives: [
      'API integration and async data fetching',
      'Error handling and loading states',
      'Environment variables for API keys',
      'Conditional rendering'
    ],
    scaffoldCode: {
      javascript: `import React, { useState } from 'react';

const WEATHER_API_KEY = 'your_api_key'; // OpenWeatherMap API

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // TODO: Implement fetchWeather function
  const fetchWeather = async () => {
    // YOUR CODE HERE
    // API: https://api.openweathermap.org/data/2.5/weather?q={city}
  };
  
  return (
    <View style={styles.container}>
      {/* YOUR COMPONENTS HERE */}
    </View>
  );
}`
    },
    socraticStarterQuestions: [
      "What happens between clicking 'Search' and displaying weather data?",
      "How do you handle the case where the API is slow or fails?",
      "What should the user see while waiting for the API response?"
    ],
    commonBugs: [
      {
        type: 'async',
        issue: 'Not handling loading state',
        scenario: 'UI freezes during API call',
        socraticQuestion: 'What should users see while the API call is in progress?'
      }
    ]
  },

  {
    projectId: 'mobile_project_3',
    domain: 'Mobile Engineering',
    projectName: 'Chat Application',
    difficulty: 'Medium',
    timeEstimate: 15,
    order: 3,
    description: 'Build a real-time chat app with message history and user presence',
    requirements: [
      'Send and receive messages in real-time',
      'Display message history',
      'Show user online/offline status',
      'Handle message timestamps',
      'Optimize for 1000+ messages'
    ],
    successCriteria: [
      'Messages appear instantly',
      'Scrolls to latest message',
      'Handles large message lists without lag',
      'Shows accurate timestamps',
      'Works with multiple users'
    ],
    learningObjectives: [
      'Real-time data with WebSockets or Firebase',
      'List virtualization for performance',
      'Timestamp formatting',
      'Optimistic UI updates'
    ]
  },

  {
    projectId: 'mobile_project_4',
    domain: 'Mobile Engineering',
    projectName: 'E-commerce App',
    difficulty: 'Hard',
    timeEstimate: 18,
    order: 4,
    description: 'Build a shopping app with cart, checkout, and product browsing',
    requirements: [
      'Browse product catalog',
      'Add/remove items from cart',
      'Calculate totals with tax',
      'Navigate between screens',
      'Persist cart across sessions'
    ],
    successCriteria: [
      'Smooth navigation between screens',
      'Cart updates correctly',
      'Calculations are accurate',
      'State persists properly',
      'Handles edge cases (empty cart, etc.)'
    ],
    learningObjectives: [
      'React Navigation (stack, tabs)',
      'Complex state management',
      'Context API for global state',
      'Calculations and business logic'
    ]
  },

  {
    projectId: 'mobile_project_5',
    domain: 'Mobile Engineering',
    projectName: 'Full-Stack Social App',
    difficulty: 'Hard',
    timeEstimate: 20,
    order: 5,
    description: 'Capstone: Build a social media app with backend API integration',
    requirements: [
      'User authentication',
      'Create and view posts',
      'Like and comment functionality',
      'Real-time feed updates',
      'Image upload',
      'User profiles'
    ],
    successCriteria: [
      'Full authentication flow works',
      'Posts sync with backend',
      'Images upload successfully',
      'Feed updates in real-time',
      'Production-ready code quality'
    ],
    learningObjectives: [
      'End-to-end app architecture',
      'Backend API integration',
      'File uploads',
      'Authentication flow',
      'Production best practices'
    ]
  }
];

async function seedProjects() {
  try {
    console.log('🌱 Seeding projects to Firestore...');
    
    const batch = db.batch();
    
    for (const project of mobileProjects) {
      const docRef = db.collection('projects').doc(project.projectId);
      batch.set(docRef, {
        ...project,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${mobileProjects.length} mobile projects!`);
    console.log('Projects:');
    mobileProjects.forEach(p => {
      console.log(`  - ${p.projectName} (${p.difficulty}, ${p.timeEstimate}h)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
}

seedProjects();