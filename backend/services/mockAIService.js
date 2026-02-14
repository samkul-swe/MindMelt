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
  // SOCRATIC LEARNING (Phase 3)
  // ============================================

  async generateSocraticQuestion(context) {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('🤖 MOCK: Generating Socratic question...');
    
    // Return contextual questions based on phase
    const questions = [
      "Before writing code, how would you architect this app? What are the main components you'd need?",
      "Good start! What about user input - how would you handle adding new items?",
      "Where should you store the data?",
      "How will the data survive an app restart?",
      "What data structure would work best here?",
      "Think about edge cases - what if the list is empty?",
      "How would you optimize this for 1000+ items?"
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return randomQuestion;
  }

  async reviewCode(context) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('🔍 MOCK: Reviewing code...');
    
    return {
      issues: [
        {
          type: 'logical',
          severity: 'critical',
          scenarioToReveal: 'Add 3 todos, delete the middle one, then add another',
          socraticQuestion: 'What ID does the new todo get? What happens to your array?'
        },
        {
          type: 'bestPractice',
          severity: 'moderate',
          scenarioToReveal: 'Check React DevTools for state mutation warning',
          socraticQuestion: 'Look at your deleteTodo function. Are you mutating state directly?'
        }
      ],
      overallQuality: 'good'
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