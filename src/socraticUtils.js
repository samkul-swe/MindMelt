// Enhanced Socratic utilities for timer-based concept learning with questioning style support
// Supports any CS concept with intelligent response matching and timer analytics

// Advanced response matching with concept and style-aware fuzzy logic
export const findBestMatch = (userResponse, expectedResponses, context = {}) => {
  const normalizedResponse = userResponse.toLowerCase().trim();
  
  // Remove common filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'i think', 'maybe', 'probably', 'well', 'actually'];
  let cleanResponse = normalizedResponse;
  fillerWords.forEach(word => {
    cleanResponse = cleanResponse.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
  });
  
  // Direct keyword matching (highest confidence)
  for (const [key, nextNode] of Object.entries(expectedResponses)) {
    if (cleanResponse.includes(key.toLowerCase())) {
      return { 
        node: nextNode, 
        confidence: 1.0, 
        matchType: 'direct',
        matchedKeyword: key 
      };
    }
    
    // Check for exact phrase matches
    if (cleanResponse === key.toLowerCase()) {
      return {
        node: nextNode,
        confidence: 1.0,
        matchType: 'exact',
        matchedKeyword: key
      };
    }
  }
  
  // Style-aware fuzzy matching
  const styleFuzzyMatches = generateStyleAwareFuzzyMatches(context.questioningStyle || 'direct');
  const conceptFuzzyMatches = generateConceptMatches(context.concept || '');
  
  // Standard CS concept fuzzy matching
  const standardFuzzyMatches = {
    'algorithm': ['method', 'procedure', 'process', 'technique', 'approach', 'way'],
    'data structure': ['organization', 'storage', 'container', 'collection'],
    'recursion': ['recursive', 'calls itself', 'self-referential', 'nested', 'repeating'],
    'iteration': ['loop', 'repeat', 'cycle', 'iterate', 'go over'],
    'function': ['method', 'procedure', 'routine', 'subroutine'],
    'variable': ['value', 'data', 'information', 'storage'],
    'efficiency': ['fast', 'quick', 'optimal', 'performance', 'speed'],
    'complexity': ['difficult', 'hard', 'complicated', 'intricate'],
    'pattern': ['structure', 'format', 'template', 'design'],
    'implementation': ['code', 'program', 'build', 'create', 'develop'],
    'optimization': ['improve', 'better', 'enhance', 'refine'],
    'abstraction': ['hide', 'simplify', 'general', 'concept']
  };
  
  // Combine all fuzzy matches
  const allFuzzyMatches = { ...standardFuzzyMatches, ...conceptFuzzyMatches, ...styleFuzzyMatches };
  
  // Check fuzzy matches
  for (const [concept, variations] of Object.entries(allFuzzyMatches)) {
    for (const variation of variations) {
      if (cleanResponse.includes(variation.toLowerCase())) {
        for (const [key, nextNode] of Object.entries(expectedResponses)) {
          if (key.toLowerCase().includes(concept.toLowerCase()) || 
              concept.toLowerCase().includes(key.toLowerCase())) {
            return { 
              node: nextNode, 
              confidence: 0.8, 
              matchType: 'fuzzy',
              matchedConcept: concept,
              matchedVariation: variation
            };
          }
        }
      }
    }
  }
  
  // Style-aware semantic similarity matching
  const semanticMatches = getStyleAwareSemanticMatches(context.questioningStyle || 'direct');
  
  for (const [category, words] of Object.entries(semanticMatches)) {
    if (words.some(word => cleanResponse.includes(word))) {
      // Find appropriate response based on semantic category
      for (const [key, nextNode] of Object.entries(expectedResponses)) {
        if ((category === 'affirmative' && (key.includes('yes') || key.includes('correct'))) ||
            (category === 'negative' && (key.includes('no') || key.includes('wrong'))) ||
            (category === 'uncertainty' && key.includes('unsure'))) {
          return {
            node: nextNode,
            confidence: 0.6,
            matchType: 'semantic',
            semanticCategory: category
          };
        }
      }
    }
  }
  
  // Partial matching (lower confidence)
  for (const [key, nextNode] of Object.entries(expectedResponses)) {
    const keyWords = key.toLowerCase().split(' ');
    const matchedWords = keyWords.filter(word => 
      word.length > 2 && cleanResponse.includes(word)
    );
    
    if (matchedWords.length > 0) {
      const confidence = matchedWords.length / keyWords.length;
      if (confidence >= 0.4) {
        return {
          node: nextNode,
          confidence: confidence * 0.5,
          matchType: 'partial',
          matchedWords
        };
      }
    }
  }
  
  return null;
};

// Generate style-aware fuzzy matches
const generateStyleAwareFuzzyMatches = (questioningStyle) => {
  const styleFuzzyMatches = {
    direct: {
      'definition': ['meaning', 'explanation', 'description', 'what is'],
      'process': ['steps', 'procedure', 'workflow', 'method'],
      'characteristics': ['properties', 'features', 'attributes', 'traits']
    },
    scenario: {
      'real-world': ['practical', 'industry', 'business', 'commercial', 'production'],
      'application': ['use case', 'example', 'implementation', 'deployment'],
      'situation': ['context', 'environment', 'setting', 'circumstances']
    },
    puzzle: {
      'challenge': ['problem', 'difficulty', 'obstacle', 'puzzle'],
      'solution': ['answer', 'resolution', 'approach', 'strategy'],
      'optimization': ['efficiency', 'improvement', 'better way', 'clever']
    },
    analogy: {
      'comparison': ['like', 'similar to', 'resembles', 'comparable'],
      'metaphor': ['imagine', 'think of as', 'picture', 'visualize'],
      'familiar': ['everyday', 'common', 'ordinary', 'typical']
    }
  };
  
  return styleFuzzyMatches[questioningStyle] || styleFuzzyMatches.direct;
};

// Get style-aware semantic matches
const getStyleAwareSemanticMatches = (questioningStyle) => {
  const baseSemanticMatches = {
    affirmative: ['yes', 'yeah', 'yep', 'sure', 'definitely', 'absolutely', 'correct', 'right', 'true'],
    negative: ['no', 'nope', 'not really', 'wrong', 'false', 'incorrect', 'disagree'],
    uncertainty: ['maybe', 'possibly', 'not sure', 'don\'t know', 'unsure', 'uncertain'],
    agreement: ['makes sense', 'understand', 'got it', 'i see', 'clear', 'obvious']
  };

  // Add style-specific semantic matches
  const styleSpecificMatches = {
    direct: {
      ...baseSemanticMatches,
      'technical': ['algorithm', 'complexity', 'implementation', 'optimization'],
      'conceptual': ['theory', 'principle', 'concept', 'idea']
    },
    scenario: {
      ...baseSemanticMatches,
      'practical': ['real world', 'business', 'industry', 'production'],
      'experiential': ['experience', 'encountered', 'worked with', 'used']
    },
    puzzle: {
      ...baseSemanticMatches,
      'analytical': ['analyze', 'solve', 'figure out', 'work through'],
      'creative': ['creative', 'innovative', 'clever', 'elegant']
    },
    analogy: {
      ...baseSemanticMatches,
      'comparative': ['like', 'similar', 'reminds me', 'compare'],
      'intuitive': ['intuitive', 'natural', 'obvious', 'makes sense']
    }
  };

  return styleSpecificMatches[questioningStyle] || baseSemanticMatches;
};

// Generate concept-specific fuzzy matches (existing function enhanced)
const generateConceptMatches = (concept) => {
  const conceptMatches = {};
  
  if (concept.toLowerCase().includes('recursion')) {
    conceptMatches['recursion'] = ['recursive', 'calls itself', 'function calling function', 'nested calls'];
    conceptMatches['base case'] = ['stopping condition', 'termination', 'exit condition', 'end case'];
  }
  
  if (concept.toLowerCase().includes('search')) {
    conceptMatches['search'] = ['find', 'locate', 'look for', 'seek'];
    conceptMatches['binary'] = ['divide', 'half', 'middle', 'split'];
  }
  
  if (concept.toLowerCase().includes('sort')) {
    conceptMatches['sort'] = ['order', 'arrange', 'organize', 'sequence'];
    conceptMatches['compare'] = ['check', 'examine', 'evaluate', 'assess'];
  }
  
  if (concept.toLowerCase().includes('machine learning')) {
    conceptMatches['learning'] = ['training', 'teaching', 'adapting', 'improving'];
    conceptMatches['pattern'] = ['trend', 'structure', 'relationship', 'correlation'];
  }
  
  return conceptMatches;
};

// Enhanced progress analysis with questioning style awareness
export const analyzeProgress = (progressHistory, concept, currentNode, timeRemaining = null, questioningStyle = 'direct') => {
  if (!progressHistory || progressHistory.length === 0) {
    return {
      intervention: 'continue',
      message: `Let's explore ${concept} together using ${getStyleName(questioningStyle)} approach!`,
      recommendation: 'start'
    };
  }
  
  const performance = analyzeRecentPerformance(progressHistory);
  const totalQuestions = progressHistory.length;
  const correctAnswers = progressHistory.filter(p => p.correct).length;
  const overallRate = correctAnswers / totalQuestions;
  
  // Timer-based interventions
  if (timeRemaining !== null && timeRemaining <= 5 * 60 && timeRemaining > 0) {
    return {
      intervention: 'time_warning',
      message: `Only ${Math.floor(timeRemaining / 60)} minutes left! Let's focus on the key aspects of ${concept} through our ${getStyleName(questioningStyle)} approach.`,
      recommendation: 'accelerate',
      details: {
        timeRemaining,
        concept: concept,
        questioningStyle: questioningStyle
      }
    };
  }
  
  if (timeRemaining !== null && timeRemaining <= 0) {
    return {
      intervention: 'time_expired',
      message: `Time's up! You've made excellent progress exploring ${concept} through ${getStyleName(questioningStyle)} questioning.`,
      recommendation: 'summarize',
      details: {
        concept: concept,
        finalScore: overallRate,
        questioningStyle: questioningStyle
      }
    };
  }
  
  // Style-aware interventions
  if (performance.correctRate < 0.3 && totalQuestions >= 3) {
    const styleAdvice = getStyleSpecificAdvice(questioningStyle, 'struggling');
    return {
      intervention: 'return_to_basics',
      message: `Let's step back and explore the fundamentals of ${concept}. ${styleAdvice}`,
      recommendation: 'review',
      details: {
        strugglingAreas: performance.strugglingAreas,
        suggestedReview: 'basic_concepts',
        concept: concept,
        questioningStyle: questioningStyle
      }
    };
  } else if (performance.correctRate > 0.8 && performance.trend === 'improving') {
    const timeMessage = timeRemaining ? ` You still have ${Math.floor(timeRemaining / 60)} minutes to explore deeper!` : '';
    const styleAdvice = getStyleSpecificAdvice(questioningStyle, 'excelling');
    return {
      intervention: 'accelerate',
      message: `Excellent understanding of ${concept}! ${styleAdvice}${timeMessage}`,
      recommendation: 'advance',
      details: {
        nextDifficultyLevel: 'higher',
        confidenceLevel: 'high',
        concept: concept,
        questioningStyle: questioningStyle
      }
    };
  } else if (performance.trend === 'declining' && totalQuestions >= 5) {
    const styleAdvice = getStyleSpecificAdvice(questioningStyle, 'support');
    return {
      intervention: 'support',
      message: `I notice you might be getting stuck with ${concept}. ${styleAdvice}`,
      recommendation: 'provide_hint',
      details: {
        suggestedSupport: 'hints_and_examples',
        concept: concept,
        questioningStyle: questioningStyle
      }
    };
  } else if (overallRate > 0.7 && totalQuestions >= 8) {
    const styleAchievement = getStyleSpecificAchievement(questioningStyle);
    return {
      intervention: 'celebrate',
      message: `Fantastic exploration of ${concept}! ${styleAchievement}`,
      recommendation: 'acknowledge_success',
      details: {
        achievementLevel: 'mastery_approaching',
        concept: concept,
        questioningStyle: questioningStyle
      }
    };
  }
  
  return {
    intervention: 'continue',
    message: `You're making good progress with ${concept} through ${getStyleName(questioningStyle)} questioning. Let's keep exploring!`,
    recommendation: 'maintain',
    details: {
      currentPerformance: Math.round(performance.correctRate * 100) + '%',
      trend: performance.trend,
      concept: concept,
      questioningStyle: questioningStyle
    }
  };
};

// Get questioning style display name
const getStyleName = (style) => {
  const styleNames = {
    direct: 'direct explanation',
    scenario: 'scenario-based',
    puzzle: 'puzzle & brain teaser',
    analogy: 'analogy & metaphor'
  };
  return styleNames[style] || style;
};

// Get style-specific advice for different situations
const getStyleSpecificAdvice = (questioningStyle, situation) => {
  const styleAdvice = {
    direct: {
      struggling: "Let's focus on clear definitions and step-by-step understanding.",
      excelling: "Ready for more technical depth and implementation details?",
      support: "Would a clearer explanation or different approach help?"
    },
    scenario: {
      struggling: "Perhaps a different real-world example would make this clearer.",
      excelling: "Ready to tackle more complex business scenarios and applications?",
      support: "Would it help to explore this in a different context or industry?"
    },
    puzzle: {
      struggling: "Let's try a simpler puzzle to build up your problem-solving confidence.",
      excelling: "Ready for some truly challenging brain teasers?",
      support: "Would you like a hint, or shall we approach this puzzle differently?"
    },
    analogy: {
      struggling: "Maybe a different analogy would make this concept clearer.",
      excelling: "Ready to explore more sophisticated comparisons and deeper metaphors?",
      support: "Would a different comparison or metaphor help clarify this?"
    }
  };
  
  return styleAdvice[questioningStyle]?.[situation] || "Let's try a different approach.";
};

// Get style-specific achievement messages
const getStyleSpecificAchievement = (questioningStyle) => {
  const achievements = {
    direct: "Your systematic understanding and clear thinking are impressive!",
    scenario: "Your ability to connect theory to real-world applications is excellent!",
    puzzle: "Your problem-solving skills and analytical thinking are outstanding!",
    analogy: "Your creative connections and intuitive understanding are remarkable!"
  };
  
  return achievements[questioningStyle] || "You're really developing deep understanding!";
};

// Analyze recent user performance (existing function - unchanged)
export const analyzeRecentPerformance = (progressHistory, windowSize = 5) => {
  if (!progressHistory || progressHistory.length === 0) {
    return { correctRate: 0.5, trend: 'neutral', strugglingAreas: [] };
  }
  
  const recentAnswers = progressHistory.slice(-windowSize);
  const correctCount = recentAnswers.filter(p => p.correct).length;
  const correctRate = correctCount / recentAnswers.length;
  
  // Calculate trend
  const firstHalf = recentAnswers.slice(0, Math.floor(recentAnswers.length / 2));
  const secondHalf = recentAnswers.slice(Math.floor(recentAnswers.length / 2));
  
  const firstHalfRate = firstHalf.length > 0 ? 
    firstHalf.filter(p => p.correct).length / firstHalf.length : 0.5;
  const secondHalfRate = secondHalf.length > 0 ? 
    secondHalf.filter(p => p.correct).length / secondHalf.length : 0.5;
  
  let trend = 'neutral';
  if (secondHalfRate > firstHalfRate + 0.2) trend = 'improving';
  else if (secondHalfRate < firstHalfRate - 0.2) trend = 'declining';
  
  // Identify struggling areas
  const strugglingAreas = recentAnswers
    .filter(p => !p.correct)
    .map(p => p.nodeId)
    .reduce((acc, nodeId) => {
      acc[nodeId] = (acc[nodeId] || 0) + 1;
      return acc;
    }, {});
  
  return {
    correctRate,
    trend,
    strugglingAreas: Object.keys(strugglingAreas),
    averageResponseTime: calculateAverageResponseTime(recentAnswers),
    confidence: calculateConfidenceScore(recentAnswers)
  };
};

// Calculate average response time for performance insights (existing function)
const calculateAverageResponseTime = (answers) => {
  const responseTimes = answers
    .map(answer => answer.responseTime)
    .filter(time => time && time > 0);
  
  if (responseTimes.length === 0) return null;
  
  return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
};

// Calculate user confidence based on response patterns (existing function)
const calculateConfidenceScore = (answers) => {
  if (answers.length === 0) return 0.5;
  
  let confidenceScore = 0;
  answers.forEach(answer => {
    // Quick correct answers suggest confidence
    if (answer.correct && answer.responseTime < 30000) confidenceScore += 1;
    // Correct but slow answers suggest some uncertainty
    else if (answer.correct) confidenceScore += 0.7;
    // Quick wrong answers might suggest overconfidence
    else if (!answer.correct && answer.responseTime < 10000) confidenceScore += 0.2;
    // Slow wrong answers suggest genuine struggle
    else confidenceScore += 0.1;
  });
  
  return confidenceScore / answers.length;
};

// Enhanced timer-based ice cream summary generation with questioning style support
export const generateIceCreamSummary = (progress, concept, sessionStartTime, learningPath, isTimerExpired = false, questioningStyle = 'direct') => {
  const correctAnswers = progress.filter(p => p.correct).length;
  const totalQuestions = progress.length;
  const sessionTime = Math.round((new Date() - sessionStartTime) / 1000 / 60);
  const performance = analyzeRecentPerformance(progress);
  
  // Generate style-aware encouragement
  let encouragement = "";
  const styleName = getStyleName(questioningStyle);
  
  if (isTimerExpired) {
    if (performance.correctRate > 0.8) {
      encouragement = `🎯 Time's up, but what an incredible 20-minute exploration using ${styleName} questioning! `;
    } else if (performance.correctRate > 0.6) {
      encouragement = `⏰ Your 20 minutes of ${styleName} exploration are complete! You've made solid progress. `;
    } else if (performance.correctRate > 0.4) {
      encouragement = `🕐 Time's up! Every minute of ${styleName} exploration counts - you've learned valuable things. `;
    } else {
      encouragement = `⏰ Your ${styleName} exploration time is complete! Remember, deep learning takes time. `;
    }
  } else {
    // Manual ice cream button press
    if (performance.correctRate > 0.8) {
      encouragement = `🍦 Great timing for a break! Your ${styleName} approach is really working well. `;
    } else if (performance.correctRate > 0.6) {
      encouragement = `🍦 Smart break choice! You're building understanding step by step through ${styleName} questioning. `;
    } else if (performance.correctRate > 0.4) {
      encouragement = `🍦 Perfect time to reflect! Your ${styleName} learning journey is progressing well. `;
    } else {
      encouragement = `🍦 Excellent decision to pause! Every ${styleName} question teaches us something valuable. `;
    }
  }
  
  // Generate style-aware insights
  const insights = generateStyleAwareInsights(concept, progress, learningPath, questioningStyle);
  const insightList = insights.map((insight, index) => `${index + 1}. ${insight}`);
  
  // Generate timer-aware performance insights with style info
  const performanceInsights = generateTimerPerformanceInsights(progress, performance, sessionTime, isTimerExpired, questioningStyle);
  
  // Create style-aware motivational message
  const motivation = generateStyleAwareMotivation(concept, performance, learningPath, isTimerExpired, questioningStyle);
  
  // Timer-specific next steps with style awareness
  const nextSteps = generateStyleAwareNextSteps(concept, performance, isTimerExpired, questioningStyle);
  
  return `${encouragement}

📊 **20-Minute Exploration Summary**:
${performanceInsights}

🧠 **Key Insights About ${concept} (${styleName} approach):**
${insightList.join('\n')}

💡 **What This Means:**
${motivation}

🎯 **Next Steps:**
${nextSteps}

${isTimerExpired ? 
  '🚀 Ready to explore another concept for 20 minutes? You could try the same concept with a different questioning style!' : 
  '⏰ Ready to continue your exploration? The timer is still running!'
}`;
};

// Generate style-aware insights
const generateStyleAwareInsights = (concept, progress, learningPath, questioningStyle) => {
  const correctAnswers = progress.filter(p => p.correct).length;
  const conceptLower = concept.toLowerCase();
  
  // Base insights that apply to any concept and style
  const baseInsights = [
    `${concept} involves deeper thinking than it first appears`,
    `Understanding ${concept} builds critical thinking skills`
  ];
  
  // Style-specific insight frameworks
  const styleInsights = {
    direct: [
      `Direct analysis of ${concept} reveals its systematic structure`,
      `Breaking down ${concept} into clear components makes it understandable`,
      `Technical mastery of ${concept} comes through methodical exploration`
    ],
    scenario: [
      `Real-world applications of ${concept} are everywhere in technology`,
      `${concept} solves practical problems across many industries`,
      `Understanding ${concept} through scenarios builds applicable knowledge`
    ],
    puzzle: [
      `${concept} is an elegant solution to complex computational problems`,
      `Problem-solving with ${concept} develops analytical thinking`,
      `The challenge of ${concept} reveals the beauty of algorithmic thinking`
    ],
    analogy: [
      `${concept} connects to familiar patterns in everyday life`,
      `Metaphors for ${concept} make abstract ideas concrete and memorable`,
      `Analogical thinking about ${concept} builds intuitive understanding`
    ]
  };
  
  // Concept-specific insights (existing logic enhanced with style awareness)
  let specificInsights = [];
  
  if (conceptLower.includes('recursion')) {
    const recursionInsights = {
      direct: [
        "Recursion requires two essential components: base case and recursive case",
        "The call stack manages recursive function execution",
        "Recursive algorithms often have elegant mathematical foundations"
      ],
      scenario: [
        "Recursion appears in file system navigation and organizational hierarchies",
        "Real-world recursive processes include fractal patterns in nature",
        "Business applications use recursion for hierarchical data processing"
      ],
      puzzle: [
        "Recursive puzzles like Tower of Hanoi demonstrate divide-and-conquer thinking",
        "Solving recursive problems requires identifying the self-similar pattern",
        "The elegance of recursion lies in solving complex problems with simple rules"
      ],
      analogy: [
        "Recursion is like Russian nesting dolls - each level contains a smaller version",
        "Like looking in facing mirrors, recursion creates infinite reflections until stopped",
        "Recursion resembles peeling an onion - each layer reveals another layer underneath"
      ]
    };
    specificInsights = recursionInsights[questioningStyle] || recursionInsights.direct;
  } else if (conceptLower.includes('search') || conceptLower.includes('binary')) {
    const searchInsights = {
      direct: [
        "Binary search requires sorted data and achieves O(log n) complexity",
        "Divide-and-conquer strategy eliminates half the search space each time",
        "Binary search is optimal for comparison-based searching in sorted arrays"
      ],
      scenario: [
        "Binary search mirrors how people actually use dictionaries and phone books",
        "Database indexing systems use binary search principles for fast lookups",
        "Search engines employ similar divide-and-conquer strategies"
      ],
      puzzle: [
        "The binary search puzzle demonstrates the power of logarithmic algorithms",
        "Each comparison eliminates exponentially more possibilities",
        "The mathematical beauty of binary search lies in its guaranteed performance"
      ],
      analogy: [
        "Binary search is like the 'hot and cold' game with systematic guessing",
        "It resembles finding a book in a library by using the organized shelving system",
        "Like a GPS narrowing down your location, each step halves the possibilities"
      ]
    };
    specificInsights = searchInsights[questioningStyle] || searchInsights.direct;
  }
  // Add more concept-specific insights as needed...
  
  // Combine base, style, and specific insights
  const allInsights = [...baseInsights, ...styleInsights[questioningStyle], ...specificInsights];
  const insightCount = Math.max(1, Math.min(allInsights.length, 
    Math.floor(correctAnswers * 0.8) + Math.floor(progress.length * 0.3)
  ));
  
  return allInsights.slice(0, insightCount);
};

// Generate timer-aware performance insights with style information
const generateTimerPerformanceInsights = (progress, performance, sessionTime, isTimerExpired, questioningStyle) => {
  const correctRate = Math.round(performance.correctRate * 100);
  const totalQuestions = progress.length;
  const correctAnswers = progress.filter(p => p.correct).length;
  const styleName = getStyleName(questioningStyle);
  
  let insights = [];
  
  if (isTimerExpired) {
    insights.push(`⏰ Full 20-minute session completed using ${styleName} questioning`);
    insights.push(`📝 ${totalQuestions} questions explored with this approach`);
    insights.push(`✅ ${correctAnswers} insights discovered (${correctRate}% success rate)`);
    insights.push(`🎯 Average of ${(totalQuestions / 20).toFixed(1)} questions per minute`);
  } else {
    insights.push(`⏱️ ${sessionTime} minutes of your 20-minute ${styleName} exploration used`);
    insights.push(`📝 ${totalQuestions} questions explored using this questioning style`);
    insights.push(`✅ ${correctAnswers} insights discovered (${correctRate}% success rate)`);
    insights.push(`🕐 ${20 - sessionTime} minutes remaining in your ${styleName} exploration`);
  }
  
  if (performance.trend === 'improving') {
    insights.push(`📈 Your understanding is growing stronger with ${styleName} questioning!`);
  } else if (performance.trend === 'declining') {
    insights.push(`📊 Good time to consolidate your ${styleName} learning`);
  }
  
  if (performance.confidence > 0.7) {
    insights.push(`💪 High confidence level - ${styleName} questioning suits your learning style!`);
  } else if (performance.confidence < 0.4) {
    insights.push(`🤔 Taking time to think deeply about each ${styleName} question`);
  }
  
  return insights.join('\n');
};

// Generate style-aware motivational message
const generateStyleAwareMotivation = (concept, performance, learningPath, isTimerExpired, questioningStyle) => {
  const styleName = getStyleName(questioningStyle);
  const level = performance.correctRate > 0.7 ? 'high' : 
               performance.correctRate > 0.4 ? 'medium' : 'low';
  
  const baseMessages = {
    direct: {
      high: `Your systematic understanding of ${concept} through direct questioning has grown tremendously!`,
      medium: `You're building solid conceptual foundations in ${concept} with clear, methodical thinking.`,
      low: `Direct questioning about ${concept} is helping you build fundamental understanding step by step.`
    },
    scenario: {
      high: `Your ability to connect ${concept} to real-world scenarios is impressive!`,
      medium: `You're successfully bridging theory and practice with ${concept} through scenario-based learning.`,
      low: `Scenario-based exploration of ${concept} is helping you see practical applications.`
    },
    puzzle: {
      high: `Your problem-solving approach to ${concept} shows excellent analytical thinking!`,
      medium: `You're developing strong puzzle-solving skills while learning ${concept}.`,
      low: `Puzzle-based exploration of ${concept} is building your analytical problem-solving abilities.`
    },
    analogy: {
      high: `Your intuitive grasp of ${concept} through analogies demonstrates deep understanding!`,
      medium: `You're creating meaningful connections that make ${concept} memorable and understandable.`,
      low: `Analogical thinking about ${concept} is helping you build intuitive understanding.`
    }
  };
  
  let baseMessage = baseMessages[questioningStyle]?.[level] || baseMessages.direct.medium;
  
  if (isTimerExpired) {
    baseMessage += ` Your focused 20-minute ${styleName} exploration demonstrates the power of concentrated learning!`;
  } else {
    baseMessage += ` This ${styleName} reflection will help you make the most of your remaining exploration time.`;
  }
  
  return baseMessage;
};

// Generate style-aware next steps
const generateStyleAwareNextSteps = (concept, performance, isTimerExpired, questioningStyle) => {
  const styleName = getStyleName(questioningStyle);
  
  if (isTimerExpired) {
    if (performance.correctRate > 0.8) {
      return `🎓 Consider exploring advanced aspects of ${concept} in a new 20-minute session, try a different questioning style, or explore a related concept!`;
    } else if (performance.correctRate > 0.6) {
      return `🔄 You could start another 20-minute session to deepen your ${concept} understanding, or try the same concept with a different questioning style.`;
    } else if (performance.correctRate > 0.4) {
      return `📚 Consider starting a fresh 20-minute session focusing on ${concept} fundamentals, or try a different questioning style that might suit your learning better.`;
    } else {
      return `🌱 Try exploring ${concept} again with a different questioning style (${styleName} might not be your preferred learning approach), or start with a simpler related concept.`;
    }
  } else {
    // Manual break during session
    if (performance.correctRate > 0.8) {
      return `⚡ Continue exploring advanced aspects of ${concept} with your ${styleName} approach - you're doing great!`;
    } else if (performance.correctRate > 0.6) {
      return `📈 Keep building on your solid foundation with ${styleName} questioning - you're making excellent progress!`;
    } else if (performance.correctRate > 0.4) {
      return `🎯 Focus on reinforcing key concepts of ${concept} with your remaining ${styleName} exploration time.`;
    } else {
      return `🔍 Use your remaining time to explore ${concept} fundamentals, or consider if a different questioning style might work better for you.`;
    }
  }
};

// Timer-specific utility functions (enhanced with style support)
export const timerUtils = {
  // Format time for display (unchanged)
  formatTime: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
  
  // Get time-based urgency level (unchanged)
  getUrgencyLevel: (timeRemaining) => {
    if (timeRemaining <= 5 * 60) return 'high'; // Last 5 minutes
    if (timeRemaining <= 10 * 60) return 'medium'; // Last 10 minutes
    return 'low'; // First 10 minutes
  },
  
  // Calculate exploration pace (unchanged)
  calculatePace: (questionsAnswered, timeElapsed) => {
    if (timeElapsed === 0) return 0;
    return questionsAnswered / (timeElapsed / 60); // Questions per minute
  },
  
  // Get time-based encouragement with style awareness
  getTimeEncouragement: (timeRemaining, questionsAnswered, questioningStyle = 'direct') => {
    const urgency = timerUtils.getUrgencyLevel(timeRemaining);
    const styleName = getStyleName(questioningStyle);
    
    if (urgency === 'high') {
      return `🔥 Final ${Math.floor(timeRemaining / 60)} minutes of ${styleName} exploration - let's make them count!`;
    } else if (urgency === 'medium') {
      return `⚡ Halfway through your ${styleName} journey - great momentum with ${questionsAnswered} questions explored!`;
    } else {
      return `🚀 Plenty of time for ${styleName} exploration - you're off to a great start!`;
    }
  }
};

// Enhanced development utilities with style support
export const devUtils = {
  // Log learning analytics for debugging (enhanced)
  logAnalytics: (event, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Analytics: ${event}`, {
        ...data,
        questioningStyle: data.questioningStyle || 'unknown'
      });
    }
  },
  
  // Test timer-based summaries with style support
  testTimerSummary: (concept, progress, isExpired = false, questioningStyle = 'direct') => {
    const mockStartTime = new Date(Date.now() - (isExpired ? 20 * 60 * 1000 : 10 * 60 * 1000));
    const summary = generateIceCreamSummary(progress, concept, mockStartTime, 'conceptual', isExpired, questioningStyle);
    console.log(`Timer Summary (expired: ${isExpired}, style: ${questioningStyle}):`, summary);
  },
  
  // Simulate timer scenarios with different questioning styles
  simulateTimerScenarios: (concept) => {
    const scenarios = [
      { name: 'Early Break', timeRemaining: 15 * 60, isExpired: false },
      { name: 'Mid Break', timeRemaining: 10 * 60, isExpired: false },
      { name: 'Late Break', timeRemaining: 3 * 60, isExpired: false },
      { name: 'Timer Expired', timeRemaining: 0, isExpired: true }
    ];
    
    const styles = ['direct', 'scenario', 'puzzle', 'analogy'];
    
    scenarios.forEach(scenario => {
      styles.forEach(style => {
        console.log(`--- ${scenario.name} for ${concept} (${style} style) ---`);
        devUtils.testTimerSummary(concept, devUtils.generateTestProgress(concept), scenario.isExpired, style);
      });
    });
  },
  
  // Generate test progress data for any concept (unchanged)
  generateTestProgress: (concept, questionCount = 8, correctRate = 0.6) => {
    return Array.from({ length: questionCount }, (_, i) => ({
      question: `Test question ${i + 1} about ${concept}`,
      answer: `Test answer ${i + 1}`,
      correct: Math.random() < correctRate,
      timestamp: new Date(Date.now() - (questionCount - i) * 60000),
      nodeId: `test_node_${i}`,
      responseTime: Math.random() * 30000 + 5000
    }));
  }
};

// Export all utilities
export default {
  findBestMatch,
  analyzeProgress,
  generateIceCreamSummary,
  analyzeRecentPerformance,
  timerUtils,
  devUtils
};