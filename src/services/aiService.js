// AI Service for generating Socratic questions
// This is a mock implementation for the hackathon demo
// In production, you'd integrate with OpenAI API or similar

const algorithmKnowledge = {
  euclidean: {
    concepts: [
      'gcd_definition',
      'remainder_pattern', 
      'base_case',
      'recursive_structure',
      'time_complexity',
      'applications'
    ],
    conceptual_questions: {
      gcd_definition: [
        "What does 'greatest common divisor' mean in your own words?",
        "If you had 12 cookies and 8 candies, what's the biggest group size where each group has the same number of each item?",
        "Why might finding the GCD be useful in real life?"
      ],
      remainder_pattern: [
        "What do you notice about GCD(12, 8) and GCD(8, 4)?",
        "If GCD(a, b) = GCD(b, remainder), what operation gives us that remainder?",
        "Why does this pattern work mathematically?"
      ],
      base_case: [
        "What should happen when one number becomes 0?",
        "Why does the algorithm stop when we reach a remainder of 0?",
        "What does it mean when we can't divide anymore?"
      ]
    },
    applied_questions: {
      gcd_definition: [
        "What should gcd(12, 8) return?",
        "How would you test if your GCD function works correctly?",
        "What edge cases should a GCD function handle?"
      ],
      remainder_pattern: [
        "Complete this: gcd(12, 8) = gcd(8, ___)",
        "What operator in most programming languages gives you the remainder?",
        "How would you implement this step in code?"
      ],
      base_case: [
        "What should 'if b == 0:' return?",
        "Why is this condition necessary in recursive functions?",
        "What happens if you forget the base case?"
      ]
    }
  },
  binary_search: {
    concepts: [
      'sorted_array_requirement',
      'divide_conquer_strategy',
      'midpoint_calculation',
      'bounds_adjustment',
      'termination_condition'
    ],
    conceptual_questions: {
      sorted_array_requirement: [
        "Why must the array be sorted first?",
        "What happens if you try binary search on an unsorted array?",
        "How does sorting enable the elimination strategy?"
      ],
      divide_conquer_strategy: [
        "How is this similar to finding a word in a dictionary?",
        "Why can we eliminate half the possibilities each time?",
        "What assumption lets us make this leap?"
      ]
    },
    applied_questions: {
      sorted_array_requirement: [
        "How would you check if an array is sorted before searching?",
        "What sorting algorithm would you use first?",
        "What error should you return for unsorted input?"
      ],
      divide_conquer_strategy: [
        "If you're searching in array[0..10], what index is the midpoint?",
        "How do you calculate the middle index?",
        "What happens when left > right?"
      ]
    }
  }
};

const encouragingResponses = [
  "Great thinking! Let's explore that further...",
  "Interesting perspective! Can you tell me more about...",
  "You're on the right track! Now consider...",
  "Excellent! That insight leads us to...",
  "Good observation! This connects to..."
];

const clarifyingQuestions = [
  "Can you walk me through your reasoning?",
  "What made you think of that approach?",
  "How does this relate to what we discussed earlier?",
  "What would happen if we changed this part?",
  "Can you give me a concrete example?"
];

// Mock AI function - replace with real AI integration
export const generateSocraticQuestion = async ({ 
  topic, 
  learningStyle, 
  conversationHistory, 
  userResponse 
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  try {
    const response = await mockAIResponse(topic, learningStyle, conversationHistory, userResponse);
    return response;
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      message: "That's a thoughtful response! Can you tell me more about your reasoning behind that answer?",
      conceptLearned: null
    };
  }
};

// Mock AI implementation
const mockAIResponse = async (topic, learningStyle, conversationHistory, userResponse) => {
  const knowledge = algorithmKnowledge[topic];
  if (!knowledge) {
    return {
      message: "Let's explore this concept together. What's your initial understanding?",
      conceptLearned: null
    };
  }

  // Determine current concept based on conversation length
  const conceptIndex = Math.min(
    Math.floor(conversationHistory.length / 4), 
    knowledge.concepts.length - 1
  );
  const currentConcept = knowledge.concepts[conceptIndex];

  // Get appropriate questions based on learning style
  const questions = learningStyle === 'applied' 
    ? knowledge.applied_questions[currentConcept]
    : knowledge.conceptual_questions[currentConcept];

  if (!questions) {
    return {
      message: getGenericSocraticResponse(userResponse),
      conceptLearned: currentConcept
    };
  }

  // Simple response generation based on user input
  let response = "";
  const lowerResponse = userResponse.toLowerCase();

  // Check for correct understanding
  if (isCorrectResponse(lowerResponse, currentConcept, topic)) {
    response = getEncouragingResponse() + " " + getNextQuestion(questions);
    return {
      message: response,
      conceptLearned: currentConcept
    };
  }

  // Check for partial understanding
  if (isPartialResponse(lowerResponse, currentConcept, topic)) {
    response = "You're getting there! " + getClarifyingQuestion(questions);
    return {
      message: response,
      conceptLearned: null
    };
  }

  // Guide back to basics
  response = "Let's think about this step by step. " + getBasicQuestion(currentConcept, topic);
  return {
    message: response,
    conceptLearned: null
  };
};

const isCorrectResponse = (response, concept, topic) => {
  const correctIndicators = {
    euclidean: {
      gcd_definition: ['greatest', 'common', 'divisor', 'biggest', 'largest', 'divide', 'both'],
      remainder_pattern: ['remainder', 'mod', '%', 'pattern', 'same'],
      base_case: ['zero', '0', 'stop', 'end', 'return']
    }
  };

  const indicators = correctIndicators[topic]?.[concept] || [];
  return indicators.some(indicator => response.includes(indicator));
};

const isPartialResponse = (response, concept, topic) => {
  const partialIndicators = {
    euclidean: {
      gcd_definition: ['factor', 'number', 'divide'],
      remainder_pattern: ['smaller', 'repeat', 'again'],
      base_case: ['done', 'finish', 'answer']
    }
  };

  const indicators = partialIndicators[topic]?.[concept] || [];
  return indicators.some(indicator => response.includes(indicator));
};

const getEncouragingResponse = () => {
  return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
};

const getClarifyingQuestion = (questions) => {
  const clarifying = clarifyingQuestions[Math.floor(Math.random() * clarifyingQuestions.length)];
  return clarifying;
};

const getNextQuestion = (questions) => {
  return questions[Math.floor(Math.random() * questions.length)];
};

const getBasicQuestion = (concept, topic) => {
  const basicQuestions = {
    euclidean: {
      gcd_definition: "What does it mean for two numbers to have a 'common divisor'?",
      remainder_pattern: "What happens when you divide 12 by 8?",
      base_case: "In any repetitive process, what tells us when to stop?"
    }
  };

  return basicQuestions[topic]?.[concept] || "Let's start with a simpler example. Can you think of one?";
};

const getGenericSocraticResponse = (userResponse) => {
  const responses = [
    "That's an interesting point. What led you to that conclusion?",
    "Can you give me a specific example of what you mean?",
    "How does this connect to what we've been discussing?",
    "What would happen if we approached this differently?",
    "What questions does this raise for you?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

// For production, replace with real OpenAI integration:
/*
export const generateSocraticQuestion = async ({ topic, learningStyle, conversationHistory, userResponse }) => {
  const prompt = `
    You are a Socratic tutor teaching ${topic} with a ${learningStyle} approach.
    
    Conversation so far:
    ${conversationHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}
    
    User just said: "${userResponse}"
    
    Generate a Socratic question that:
    1. Never gives direct answers
    2. Guides discovery through questioning
    3. Builds on their response
    4. Encourages deeper thinking
    5. Is encouraging and supportive
    
    Return JSON: { "message": "your question", "conceptLearned": "concept_name or null" }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
*/