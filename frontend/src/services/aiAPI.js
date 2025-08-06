const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AIAPI {
  constructor() {
    // Request deduplication to prevent double calls
    this.pendingRequests = new Map();
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    // Create a unique key for this request to prevent duplicates
    const requestKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;
    
    // If there's already a pending request with the same parameters, return that promise
    if (this.pendingRequests.has(requestKey)) {
      console.log('🔄 Frontend: Deduplicating identical request:', requestKey.substring(0, 100) + '...');
      return this.pendingRequests.get(requestKey);
    }
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    const requestPromise = fetch(url, {
      ...defaultOptions,
      ...options
    }).then(async response => {
      // Remove from pending requests when complete
      this.pendingRequests.delete(requestKey);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }).catch(error => {
      // Remove from pending requests on error too
      this.pendingRequests.delete(requestKey);
      throw error;
    });
    
    // Store the promise to deduplicate identical requests
    this.pendingRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  async testApiKey(apiKey) {
    console.log('📞 ==> Frontend aiAPI.testApiKey() called');
    console.log('📋 Frontend: API key length:', apiKey?.length);
    console.log('🔄 Frontend: Making request to backend...');
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/test-key`, {
        method: 'POST',
        body: JSON.stringify({ apiKey })
      });
      
      console.log('🎉 Frontend API key test completed');
      console.log('🔍 Test result:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Frontend API key test failed:', error);
      return { 
        success: false, 
        message: `API test failed: ${error.message}` 
      };
    }
  }

  async testEnvironmentApiKey() {
    console.log('📞 ==> Frontend aiAPI.testEnvironmentApiKey() called');
    console.log('🔄 Frontend: Making environment test request to backend...');
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/test-env-key`, {
        method: 'POST'
      });
      
      console.log('🎉 Frontend environment API key test completed');
      console.log('🔍 Test result:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Frontend environment API key test failed:', error);
      return { 
        success: false, 
        message: `Environment API test failed: ${error.message}` 
      };
    }
  }

  async validateApiKey(apiKey) {
    try {
      const result = await fetch(`${API_BASE_URL}/ai/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Validation failed');
      }

      return await result.json();
    } catch (error) {
      console.error('API key validation error:', error);
      return { valid: false, message: error.message };
    }
  }

  async getSocraticResponse(concept, userResponse, learningPath, questioningStyle, returnParsed = false) {
    console.log('=== MINDMELT FRONTEND TO BACKEND API CALL ===');
    console.log('Learning CS concept:', concept);
    console.log('Learning path:', learningPath);
    console.log('Questioning style:', questioningStyle);
    console.log('Return parsed:', returnParsed);

    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/socratic-response`, {
        method: 'POST',
        body: JSON.stringify({
          concept,
          userResponse,
          learningPath,
          questioningStyle,
          returnParsed
        })
      });
      
      console.log('✅ MindMelt Frontend: Backend API Response received successfully');
      console.log('🗺 Response type:', typeof result.response);
      console.log('📋 Response content:', result.response);
      
      // Always return a string for React rendering
      if (typeof result.response === 'string') {
        return result.response;
      } else if (result.response?.displayText) {
        return result.response.displayText;
      } else if (typeof result.response === 'object') {
        // Handle structured response
        const { pun, question } = result.response;
        return pun && question ? `${pun}\n\n${question}` : JSON.stringify(result.response);
      } else {
        return 'Response received successfully!';
      }
    } catch (error) {
      console.error('❌ MindMelt Frontend: Backend API call failed:', error);
      throw error;
    }
  }

  async getSocraticResponseWithMetadata(concept, userResponse, learningPath, questioningStyle) {
    return this.getSocraticResponse(concept, userResponse, learningPath, questioningStyle, true);
  }

  async getHintResponse(concept, conversationContext, learningPath, questioningStyle) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/hint-response`, {
        method: 'POST',
        body: JSON.stringify({
          concept,
          conversationContext,
          learningPath,
          questioningStyle
        })
      });
      
      console.log('💡 MindMelt Frontend: Hint generated successfully');
      
      // Always return a string for React rendering
      if (typeof result.response === 'string') {
        return result.response;
      } else {
        return result.response?.content || result.response?.text || 'Hint received!';
      }
    } catch (error) {
      console.error('❌ MindMelt Frontend: Hint API call failed:', error);
      throw error;
    }
  }

  async assessUnderstandingQuality(concept, userResponse) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/assess-understanding`, {
        method: 'POST',
        body: JSON.stringify({
          concept,
          userResponse
        })
      });
      
      console.log('📊 MindMelt Frontend: Understanding assessment completed');
      return {
        score: result.score,
        feedback: result.feedback
      };
    } catch (error) {
      console.error('❌ MindMelt Frontend: Assessment API call failed:', error);
      // Return basic assessment as fallback
      return this.assessBasicQuality(userResponse);
    }
  }

  async searchCSTopics(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      console.log('🔍 Frontend Fast AI Search:', query.trim());
      
      const topics = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/search-topics`, {
        method: 'POST',
        body: JSON.stringify({
          query: query.trim()
        })
      });
      
      console.log(`✅ Frontend received ${topics.length} topics from backend`);
      return topics;
    } catch (error) {
      console.error('❌ Frontend AI search failed:', error);
      throw error;
    }
  }

  async getTopicDetails(topicName) {
    try {
      const details = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/topic-details`, {
        method: 'POST',
        body: JSON.stringify({
          topicName
        })
      });
      
      console.log('📚 MindMelt Frontend: Topic details received from backend');
      return details;
    } catch (error) {
      console.error('❌ Frontend topic details failed:', error);
      return this.getDefaultTopicDetails(topicName);
    }
  }

  async generateDailySummary(sessionsData) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/ai/daily-summary`, {
        method: 'POST',
        body: JSON.stringify({
          sessionsData
        })
      });
      
      console.log('📊 MindMelt Frontend: Daily summary generated successfully');
      return result.summary;
    } catch (error) {
      console.error('❌ Frontend daily summary failed:', error);
      throw error;
    }
  }

  getDefaultTopicDetails(topicName) {
    return {
      concept: `${topicName} is an important computer science concept that involves understanding fundamental principles and practical applications.`,
      whyImportant: `Learning ${topicName} is essential for building a strong foundation in computer science and developing problem-solving skills.`,
      buildingBlocks: [
        "Understanding the basic concepts and terminology",
        "Learning the fundamental principles",
        "Exploring practical applications",
        "Understanding implementation details",
        "Recognizing common patterns and use cases"
      ],
      realWorldConnection: `${topicName} is used in many real-world applications including software development, system design, and technology solutions.`,
      nextSteps: ["Related advanced topics", "Practical implementation", "System design applications"],
      prerequisites: ["Basic programming concepts", "Mathematical foundations"]
    };
  }

  assessBasicQuality(userResponse) {
    const response = userResponse.toLowerCase();
    let score = 30; // Base score
    
    if (response.length > 100) score += 20;
    else if (response.length > 50) score += 10;

    const csTerms = ['algorithm', 'data structure', 'complexity', 'memory', 'cpu', 'network', 'database', 
                     'function', 'variable', 'array', 'loop', 'condition', 'binary', 'queue', 'stack'];
    const termsUsed = csTerms.filter(term => response.includes(term)).length;
    score += Math.min(25, termsUsed * 5);

    const thinkingWords = ['because', 'since', 'therefore', 'however', 'although', 'why', 'how', 'what if'];
    const thinkingUsed = thinkingWords.filter(word => response.includes(word)).length;
    score += Math.min(15, thinkingUsed * 3);

    if (response.includes('example') || response.includes('like') || response.includes('such as')) {
      score += 10;
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: score > 70 ? "Good depth and detail" : 
                score > 50 ? "Shows basic understanding" : 
                "Could use more detail and examples"
    };
  }

  getApiSetupInstructions() {
    return {
      title: "🔑 Get Your Google Gemini API Key for MindMelt",
      subtitle: "Connect MindMelt to Google Gemini AI for advanced CS learning",
      steps: [
        {
          step: 1,
          title: "Visit Google AI Studio",
          description: "Go to the Google AI Studio platform",
          link: "https://aistudio.google.com/app/apikey",
          action: "Click to open Google AI Studio"
        },
        {
          step: 2,
          title: "Create Account",
          description: "Sign up or sign in with your Google account",
          tip: "You may need to verify your account and accept terms of service"
        },
        {
          step: 3,
          title: "Generate API Key",
          description: "Create a new API key in your Google AI Studio dashboard",
          tip: "The key will start with 'AIza' followed by additional characters"
        },
        {
          step: 4,
          title: "Copy Your Key",
          description: "Copy your API key and paste it in MindMelt settings",
          tip: "Keep this key private and secure - it provides access to your Google AI account!"
        }
      ],
      benefits: [
        "🚀 Advanced Gemini 2.5 Flash model for fast CS reasoning",
        "⚡ High-performance API designed for educational applications",
        "🧠 Specialized in understanding and teaching complex concepts",
        "🔒 Secure authentication with Google's infrastructure"
      ],
      notes: [
        "Your Google Gemini API key will be stored securely on MindMelt servers",
        "API keys are encrypted and never shared with third parties",
        "Google AI offers generous free quotas for educational use",
        "You can update or remove your API key anytime in settings"
      ]
    };
  }
}

const aiAPI = new AIAPI();
export default aiAPI;
