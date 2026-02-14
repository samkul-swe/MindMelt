/**
 * Mock AI Service - Returns fake data for testing
 * Use this when you don't want to spend API credits during development
 * 
 * To use: In resumeService.js, change:
 * import aiService from './aiService.js';
 * to:
 * import aiService from './mockAIService.js';
 */

class MockAIService {
  async call(prompt, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🤖 Using MOCK AI service (no real API call)');
    return 'Mock response';
  }

  async callForJSON(prompt, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🤖 Using MOCK AI service (no real API call)');
    
    // Return mock data based on prompt type
    if (prompt.includes('analyzing a developer')) {
      return this.mockResumeAnalysis();
    }
    if (prompt.includes('role fit')) {
      return this.mockRoleFit();
    }
    
    return {};
  }

  mockResumeAnalysis() {
    return {
      skills: [
        'React', 'JavaScript', 'TypeScript', 'Node.js', 
        'Express', 'Python', 'Django', 'PostgreSQL', 
        'MongoDB', 'Docker', 'AWS', 'Git'
      ],
      experienceYears: 3,
      experienceLevel: 'Mid-level',
      projects: [
        'E-commerce Platform (React, Node.js)',
        'Social Media Dashboard',
        'Task Management App'
      ],
      education: 'BS Computer Science',
      specializations: ['Full-Stack', 'Backend']
    };
  }

  /**
   * IMPROVED: Get quick role overview (just percentages)
   */
  async getRoleOverview(profile) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('🎯 MOCK: Getting role overview...');
    
    // Return just match percentages based on skills
    const hasReact = profile.skills.includes('React');
    const hasNode = profile.skills.includes('Node.js');
    const hasPython = profile.skills.some(s => s.includes('Python'));
    const hasMobile = profile.skills.some(s => s.includes('React Native') || s.includes('Mobile'));
    
    return {
      'Full-Stack Engineer': hasReact && hasNode ? 92 : 75,
      'Backend Engineer': hasNode || hasPython ? 85 : 65,
      'Frontend Engineer': hasReact ? 78 : 60,
      'Mobile Engineer': hasMobile ? 70 : 42
    };
  }

  /**
   * IMPROVED: Get detailed analysis for ONE role
   */
  async analyzeSpecificRole(profile, roleName) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`🔍 MOCK: Analyzing ${roleName} in detail...`);
    
    // Return detailed analysis based on role
    const roleAnalysis = {
      'Full-Stack Engineer': {
        match: 92,
        strengths: [
          'Strong React and Node.js experience',
          'Full-stack project portfolio',
          'Modern tech stack knowledge',
          '3 years professional experience',
          'Database proficiency (PostgreSQL, MongoDB)'
        ],
        gaps: [],
        ready: true,
        reasoning: 'Excellent fit with comprehensive full-stack experience',
        recommendations: [
          'Consider learning GraphQL for modern API development',
          'Explore system design patterns for scalability'
        ]
      },
      'Backend Engineer': {
        match: 85,
        strengths: [
          'Node.js and Express expertise',
          'Database experience (PostgreSQL, MongoDB)',
          'API development skills',
          'DevOps knowledge (Docker, AWS)'
        ],
        gaps: [
          'Advanced system design',
          'Microservices architecture',
          'Message queues (RabbitMQ, Kafka)'
        ],
        ready: true,
        reasoning: 'Strong backend skills, could benefit from system design practice',
        recommendations: [
          'Study distributed systems and microservices',
          'Practice designing scalable backend architectures',
          'Learn message queue patterns'
        ]
      },
      'Frontend Engineer': {
        match: 78,
        strengths: [
          'Advanced React skills',
          'TypeScript proficiency',
          'Modern frontend tooling',
          'Component architecture'
        ],
        gaps: [
          'CSS architecture patterns (BEM, CSS-in-JS)',
          'Advanced animations and interactions',
          'Performance optimization techniques',
          'Frontend testing (Jest, Cypress)'
        ],
        ready: false,
        reasoning: 'Good foundation but needs more frontend-specific depth',
        recommendations: [
          'Master CSS architecture and design systems',
          'Learn advanced React performance patterns',
          'Build animation-heavy projects',
          'Practice frontend testing strategies'
        ]
      },
      'Mobile Engineer': {
        match: 42,
        strengths: [
          'React foundation (transferable to React Native)',
          'JavaScript expertise',
          'Component architecture understanding',
          'Already familiar with modern development practices'
        ],
        gaps: [
          'React Native framework',
          'Mobile-specific design patterns',
          'iOS/Android platform knowledge',
          'Mobile performance optimization',
          'Native modules and platform APIs',
          'App store deployment process'
        ],
        ready: false,
        reasoning: 'Has transferable skills but needs mobile-specific training',
        recommendations: [
          'Complete React Native fundamentals course',
          'Build 3-5 mobile projects',
          'Learn mobile-specific performance optimization',
          'Study iOS and Android platform differences',
          'Practice with native modules'
        ]
      }
    };

    return roleAnalysis[roleName] || {
      match: 50,
      strengths: ['Analysis not available'],
      gaps: ['Analysis not available'],
      ready: false,
      reasoning: 'Role not found',
      recommendations: []
    };
  }

  // ============================================
  // SOCRATIC LEARNING (Phase 3) - Enhanced
  // ============================================

  async generateSocraticQuestion(context) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('🤖 MOCK: Generating Socratic question...');
    console.log('Context:', context);
    
    const { conversation = [], topic, phase } = context;
    const messageCount = conversation.length;
    
    // Debugging phase - guide through common bugs
    if (phase === 'debugging' || topic?.toLowerCase().includes('debug')) {
      const debuggingFlow = [
        "I see you're using array indices for IDs. Let me walk you through a scenario: Add 3 todos ('Buy milk', 'Walk dog', 'Code'), then delete 'Walk dog' (index 1). Now add a new todo 'Read book'. What ID does it get?",
        
        "Right! The new todo gets index 2, but that's already taken by 'Code'. This causes bugs. Can you think of a way to generate IDs that don't depend on array position?",
        
        "Good idea! Using Date.now() or Date.now() + Math.random() ensures unique IDs. Now let's check another issue - open React DevTools and delete a todo. Do you see any state mutation warnings?",
        
        "Exactly! Look at your deleteTodo function. Are you using splice() or another method that mutates the array directly?",
        
        "Perfect understanding! You should use filter() instead: `setTodos(todos.filter(t => t.id !== id))`. This creates a new array instead of mutating. One more check - close and reopen your app. Do the todos persist?",
        
        "Great! If they persist, your AsyncStorage is working. If not, check that you're using JSON.stringify() when saving. You've identified and understood all the key issues! Ready to mark this complete?"
      ];
      
      const index = Math.min(Math.floor(messageCount / 2), debuggingFlow.length - 1);
      return debuggingFlow[index];
    }
    
    // Design phase questions
    const designQuestions = [
      "Good thinking! So you've identified TodoList and TodoItem. What component handles adding new todos?",
      "Perfect - AddTodo for input. Now, where should you store the list of todos? Think about which component needs to access and update the list.",
      "Excellent! State in the App component makes sense. And how will those todos survive an app restart? What happens to useState when the app closes?",
      "Right! useState doesn't persist. What React Native API can you use to save data permanently?",
      "Exactly - AsyncStorage! So let's summarize your architecture: App manages state and AsyncStorage, AddTodo handles input, TodoList displays the list, and TodoItem renders each todo. Sound complete?",
      "Perfect! Your architecture is well thought out. You've identified all the key components and how they work together. Ready to start implementing?"
    ];
    
    const questionIndex = Math.min(messageCount, designQuestions.length - 1);
    return designQuestions[questionIndex];
  }

  async reviewCode(context) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('🔍 MOCK: Reviewing code...');
    
    return {
      issues: [
        {
          type: 'logical',
          severity: 'critical',
          scenarioToReveal: 'Add 3 todos, delete the middle one, then add another. Check the IDs.',
          socraticQuestion: 'What ID does the new todo get? What happens to your array?',
          expectedRealization: 'IDs get messed up when using array index'
        },
        {
          type: 'bestPractice',
          severity: 'moderate',
          scenarioToReveal: 'Open React DevTools and check for warnings when deleting todos.',
          socraticQuestion: 'Do you see any warnings? Look at your deleteTodo function - are you mutating state?',
          expectedRealization: 'Should use filter() instead of splice() to avoid mutation'
        }
      ],
      overallQuality: 'good',
      strengths: [
        'Component architecture is well thought out',
        'State management approach is correct',
        'Code is readable and well-organized'
      ],
      needsWork: [
        'ID generation strategy',
        'Avoiding state mutation'
      ]
    };
  }

  async assessPerformance(context) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('📊 MOCK: Assessing performance...');
    
    return {
      scores: {
        architecture: 85,
        implementation: 80,
        debugging: 75,
        understanding: 85
      },
      overallScore: 81,
      strengths: [
        'Strong component architecture thinking',
        'Good state management understanding',
        'Quick to identify bugs once pointed out'
      ],
      gaps: [
        'Didn\'t consider unique ID problem upfront',
        'State mutation initially overlooked',
        'Could improve edge case thinking'
      ],
      nextProjectRecommendations: {
        focusAreas: ['Async data handling', 'Error handling', 'Loading states'],
        scaffoldingLevel: 'medium',
        difficulty: 'same'
      },
      timeSpent: 5.5,
      readyForNextProject: true
    };
  }

  async analyzeResume(resumeText) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('📝 Mock analyzing resume...');
    return this.mockResumeAnalysis();
  }

  async analyzeRoleFit(profile) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('🎯 Mock analyzing role fit...');
    return this.mockRoleFit();
  }

  async testConnection() {
    return {
      success: true,
      message: 'Mock AI service (no real API calls)',
      response: 'Mock mode active'
    };
  }
}

export default new MockAIService();