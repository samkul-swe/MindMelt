export const algorithmData = {
  euclidean: {
    name: 'Euclidean Algorithm',
    description: 'Find the Greatest Common Divisor (GCD) of two numbers',
    difficulty: 'Beginner',
    timeEstimate: '15-20 minutes',
    concepts: [
      'Greatest Common Divisor definition',
      'Remainder pattern recognition', 
      'Base case understanding',
      'Recursive structure',
      'Time complexity analysis',
      'Real-world applications'
    ],
    applications: [
      'Simplifying fractions',
      'Cryptography (RSA algorithm)',
      'Finding LCM',
      'Music theory (rhythm patterns)',
      'Computer graphics (pixel ratios)'
    ]
  },
  binary_search: {
    name: 'Binary Search',
    description: 'Efficiently search sorted arrays using divide-and-conquer',
    difficulty: 'Beginner',
    timeEstimate: '15-20 minutes',
    concepts: [
      'Sorted array requirement',
      'Divide and conquer strategy',
      'Midpoint calculation',
      'Bounds adjustment',
      'Termination conditions',
      'Time complexity O(log n)'
    ],
    applications: [
      'Database indexing',
      'Dictionary lookups',
      'Version control systems',
      'Game AI decision trees',
      'Network routing protocols'
    ]
  }
};

export const getAlgorithmInfo = (algorithmId) => {
  return algorithmData[algorithmId] || null;
};

export const getAllAlgorithms = () => {
  return Object.keys(algorithmData).map(id => ({
    id,
    ...algorithmData[id]
  }));
};