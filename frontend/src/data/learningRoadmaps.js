// GeeksforGeeks Style Learning Roadmaps
// Complete structured learning paths for computer science topics

export const LEARNING_ROADMAPS = {
  "dsa-fundamentals": {
    id: "dsa-fundamentals",
    title: "Data Structures & Algorithms Fundamentals",
    description: "Master the core concepts of DSA from basics to advanced topics",
    icon: "🧮",
    difficulty: "Beginner to Advanced",
    estimatedTime: "8-12 weeks",
    category: "Programming Fundamentals",
    color: "#FF6B35",
    prerequisites: ["Basic programming knowledge in any language"],
    skills: ["Problem Solving", "Algorithmic Thinking", "Code Optimization"],
    topics: [
      {
        id: 1,
        name: "Introduction to Data Structures",
        icon: "📊",
        description: "Understanding what data structures are and why they matter",
        difficulty: "Beginner",
        estimatedTime: "2-3 hours",
        keywords: ["data structures", "introduction", "basics", "overview"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Arrays and Strings",
        icon: "📋",
        description: "Working with linear data structures - arrays and string manipulation",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["arrays", "strings", "indexing", "iteration", "manipulation"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Linked Lists",
        icon: "🔗",
        description: "Understanding pointer-based data structures",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["linked lists", "pointers", "nodes", "singly", "doubly"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Stacks and Queues",
        icon: "📚",
        description: "LIFO and FIFO data structures with practical applications",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["stack", "queue", "lifo", "fifo", "applications"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Recursion and Backtracking",
        icon: "🔄",
        description: "Master recursive thinking and backtracking algorithms",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["recursion", "backtracking", "recursive", "base case"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Binary Trees",
        icon: "🌳",
        description: "Hierarchical data structures and tree traversals",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["binary trees", "traversal", "inorder", "preorder", "postorder"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Binary Search Trees",
        icon: "🔍",
        description: "Efficient searching and sorting with BSTs",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["bst", "binary search tree", "searching", "insertion", "deletion"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Heaps and Priority Queues",
        icon: "⛰️",
        description: "Understanding heap data structure and priority queues",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["heap", "priority queue", "min heap", "max heap", "heapify"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Hash Tables and Hashing",
        icon: "🗂️",
        description: "Fast data retrieval using hash functions",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["hash table", "hashing", "collision", "hash function", "dictionary"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Graphs - Representation and Traversal",
        icon: "🕸️",
        description: "Graph data structures, BFS, and DFS algorithms",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["graphs", "bfs", "dfs", "adjacency", "traversal"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Sorting Algorithms",
        icon: "🔢",
        description: "Comparison and non-comparison based sorting techniques",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["sorting", "quicksort", "mergesort", "heapsort", "radix sort"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Searching Algorithms",
        icon: "🎯",
        description: "Linear and binary search techniques",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["search", "binary search", "linear search", "algorithms"],
        isCompleted: false
      },
      {
        id: 13,
        name: "Dynamic Programming",
        icon: "🧩",
        description: "Optimization technique for solving complex problems",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["dynamic programming", "dp", "memoization", "optimization"],
        isCompleted: false
      },
      {
        id: 14,
        name: "Greedy Algorithms",
        icon: "🎯",
        description: "Making locally optimal choices for global optimization",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["greedy", "optimization", "algorithms", "local optimal"],
        isCompleted: false
      },
      {
        id: 15,
        name: "Graph Algorithms",
        icon: "🗺️",
        description: "Advanced graph algorithms - Dijkstra, MST, etc.",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["dijkstra", "mst", "shortest path", "graph algorithms"],
        isCompleted: false
      }
    ]
  },

  "web-development": {
    id: "web-development",
    title: "Complete Web Development",
    description: "From HTML basics to full-stack web applications",
    icon: "🌐",
    difficulty: "Beginner to Advanced",
    estimatedTime: "12-16 weeks",
    category: "Web Development",
    color: "#4ECDC4",
    prerequisites: ["Basic computer knowledge"],
    skills: ["Frontend Development", "Backend Development", "Database Management"],
    topics: [
      {
        id: 1,
        name: "HTML Fundamentals",
        icon: "📄",
        description: "Structure and markup of web pages",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["html", "markup", "tags", "structure", "elements"],
        isCompleted: false
      },
      {
        id: 2,
        name: "CSS Styling and Layout",
        icon: "🎨",
        description: "Styling web pages with CSS and modern layout techniques",
        difficulty: "Beginner",
        estimatedTime: "5-6 hours",
        keywords: ["css", "styling", "flexbox", "grid", "layout"],
        isCompleted: false
      },
      {
        id: 3,
        name: "JavaScript Basics",
        icon: "🟨",
        description: "Programming fundamentals with JavaScript",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["javascript", "variables", "functions", "dom", "events"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Advanced JavaScript",
        icon: "⚡",
        description: "ES6+, async/await, closures, and advanced concepts",
        difficulty: "Intermediate",
        estimatedTime: "8-10 hours",
        keywords: ["es6", "async", "promises", "closures", "scope"],
        isCompleted: false
      },
      {
        id: 5,
        name: "React Fundamentals",
        icon: "⚛️",
        description: "Building user interfaces with React",
        difficulty: "Intermediate",
        estimatedTime: "8-10 hours",
        keywords: ["react", "components", "jsx", "props", "state"],
        isCompleted: false
      },
      {
        id: 6,
        name: "React Hooks and State Management",
        icon: "🎣",
        description: "Modern React patterns and state management",
        difficulty: "Intermediate",
        estimatedTime: "6-8 hours",
        keywords: ["hooks", "usestate", "useeffect", "context", "state"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Node.js and Express",
        icon: "🟢",
        description: "Server-side JavaScript development",
        difficulty: "Intermediate",
        estimatedTime: "6-8 hours",
        keywords: ["nodejs", "express", "server", "backend", "api"],
        isCompleted: false
      },
      {
        id: 8,
        name: "RESTful APIs",
        icon: "🔌",
        description: "Building and consuming REST APIs",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["rest", "api", "http", "endpoints", "crud"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Database Integration",
        icon: "🗄️",
        description: "Working with databases in web applications",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["database", "sql", "mongodb", "orm", "queries"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Authentication and Security",
        icon: "🔐",
        description: "User authentication and web security practices",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["authentication", "jwt", "security", "authorization", "oauth"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Frontend Build Tools",
        icon: "🛠️",
        description: "Webpack, Vite, and modern build processes",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["webpack", "vite", "bundling", "build tools", "optimization"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Testing and Debugging",
        icon: "🧪",
        description: "Unit testing, integration testing, and debugging techniques",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["testing", "jest", "debugging", "unit tests", "integration"],
        isCompleted: false
      },
      {
        id: 13,
        name: "Deployment and DevOps",
        icon: "🚀",
        description: "Deploying web applications to production",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["deployment", "devops", "ci/cd", "hosting", "production"],
        isCompleted: false
      },
      {
        id: 14,
        name: "Performance Optimization",
        icon: "⚡",
        description: "Optimizing web application performance",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["performance", "optimization", "lazy loading", "caching", "seo"],
        isCompleted: false
      }
    ]
  },

  "machine-learning": {
    id: "machine-learning",
    title: "Machine Learning Mastery",
    description: "Complete journey from ML basics to deep learning",
    icon: "🤖",
    difficulty: "Intermediate to Advanced",
    estimatedTime: "10-14 weeks",
    category: "Artificial Intelligence",
    color: "#9B59B6",
    prerequisites: ["Python programming", "Basic mathematics", "Statistics basics"],
    skills: ["Data Analysis", "Model Building", "Deep Learning"],
    topics: [
      {
        id: 1,
        name: "Introduction to Machine Learning",
        icon: "🎯",
        description: "Understanding ML concepts, types, and applications",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["machine learning", "supervised", "unsupervised", "reinforcement"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Python for Data Science",
        icon: "🐍",
        description: "NumPy, Pandas, and Matplotlib for data manipulation",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["python", "numpy", "pandas", "matplotlib", "data science"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Data Preprocessing",
        icon: "🧹",
        description: "Cleaning, transforming, and preparing data for ML",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["preprocessing", "cleaning", "feature engineering", "scaling"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Linear Regression",
        icon: "📈",
        description: "Understanding linear relationships and regression analysis",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["linear regression", "regression", "prediction", "correlation"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Classification Algorithms",
        icon: "🏷️",
        description: "Logistic regression, SVM, and decision trees",
        difficulty: "Intermediate",
        estimatedTime: "6-7 hours",
        keywords: ["classification", "logistic regression", "svm", "decision trees"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Clustering and Unsupervised Learning",
        icon: "🔍",
        description: "K-means, hierarchical clustering, and dimensionality reduction",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["clustering", "kmeans", "unsupervised", "pca", "dimensionality"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Model Evaluation and Validation",
        icon: "📊",
        description: "Cross-validation, metrics, and model selection",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["validation", "cross validation", "metrics", "evaluation"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Ensemble Methods",
        icon: "🌲",
        description: "Random forests, boosting, and ensemble techniques",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["ensemble", "random forest", "boosting", "bagging"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Introduction to Neural Networks",
        icon: "🧠",
        description: "Perceptrons, feedforward networks, and backpropagation",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["neural networks", "perceptron", "backpropagation", "deep learning"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Deep Learning with TensorFlow",
        icon: "🔥",
        description: "Building deep neural networks with TensorFlow/Keras",
        difficulty: "Advanced",
        estimatedTime: "8-10 hours",
        keywords: ["tensorflow", "keras", "deep learning", "neural networks"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Convolutional Neural Networks",
        icon: "👁️",
        description: "CNNs for image processing and computer vision",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["cnn", "computer vision", "image processing", "convolution"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Natural Language Processing",
        icon: "💬",
        description: "Text processing, sentiment analysis, and language models",
        difficulty: "Advanced",
        estimatedTime: "7-8 hours",
        keywords: ["nlp", "text processing", "sentiment", "language models"],
        isCompleted: false
      }
    ]
  },

  "system-design": {
    id: "system-design",
    title: "System Design Interview Prep",
    description: "Master large-scale system design for tech interviews",
    icon: "🏗️",
    difficulty: "Advanced",
    estimatedTime: "8-10 weeks",
    category: "System Architecture",
    color: "#E74C3C",
    prerequisites: ["Programming experience", "Basic networking", "Database knowledge"],
    skills: ["System Architecture", "Scalability", "Distributed Systems"],
    topics: [
      {
        id: 1,
        name: "System Design Fundamentals",
        icon: "🏛️",
        description: "Basic concepts of system design and architecture",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["system design", "architecture", "fundamentals", "basics"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Scalability Principles",
        icon: "📈",
        description: "Horizontal vs vertical scaling, load distribution",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["scalability", "horizontal", "vertical", "scaling"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Load Balancing",
        icon: "⚖️",
        description: "Load balancers, algorithms, and failover strategies",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["load balancing", "load balancer", "algorithms", "failover"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Caching Strategies",
        icon: "💾",
        description: "Redis, Memcached, CDNs, and caching patterns",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["caching", "redis", "memcached", "cdn", "cache patterns"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Database Design and Sharding",
        icon: "🗄️",
        description: "SQL vs NoSQL, sharding, replication, and consistency",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["database", "sharding", "replication", "consistency", "nosql"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Message Queues and Pub/Sub",
        icon: "📨",
        description: "Asynchronous processing with RabbitMQ, Kafka",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["message queue", "pubsub", "kafka", "rabbitmq", "async"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Microservices Architecture",
        icon: "🧱",
        description: "Service decomposition, API gateways, and service mesh",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["microservices", "api gateway", "service mesh", "decomposition"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Designing Chat Systems",
        icon: "💬",
        description: "Real-time messaging, WebSockets, and notification systems",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["chat system", "websockets", "realtime", "messaging"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Designing Social Media Feeds",
        icon: "📱",
        description: "News feeds, timeline generation, and content ranking",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["social media", "news feed", "timeline", "content ranking"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Designing URL Shorteners",
        icon: "🔗",
        description: "URL encoding, analytics, and rate limiting",
        difficulty: "Advanced",
        estimatedTime: "3-4 hours",
        keywords: ["url shortener", "encoding", "analytics", "rate limiting"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Search Engine Design",
        icon: "🔍",
        description: "Indexing, ranking algorithms, and distributed search",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["search engine", "indexing", "ranking", "distributed search"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Monitoring and Observability",
        icon: "📊",
        description: "Logging, metrics, tracing, and alerting systems",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["monitoring", "logging", "metrics", "tracing", "alerting"],
        isCompleted: false
      }
    ]
  },

  "android-development": {
    id: "android-development",
    title: "Android App Development",
    description: "Build modern Android applications with Kotlin",
    icon: "🤖",
    difficulty: "Beginner to Advanced",
    estimatedTime: "10-12 weeks",
    category: "Mobile Development",
    color: "#2ECC71",
    prerequisites: ["Basic programming knowledge", "Object-oriented concepts"],
    skills: ["Mobile Development", "Kotlin Programming", "Android SDK"],
    topics: [
      {
        id: 1,
        name: "Android Development Basics",
        icon: "📱",
        description: "Android ecosystem, development environment setup",
        difficulty: "Beginner",
        estimatedTime: "2-3 hours",
        keywords: ["android", "setup", "development environment", "basics"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Kotlin Programming",
        icon: "🎯",
        description: "Kotlin syntax, features, and Android-specific usage",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["kotlin", "programming", "syntax", "features"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Activities and Layouts",
        icon: "📄",
        description: "Creating screens and designing user interfaces",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["activities", "layouts", "ui design", "xml"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Views and ViewGroups",
        icon: "🎨",
        description: "Working with UI components and layout managers",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["views", "viewgroups", "ui components", "layout managers"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Intents and Navigation",
        icon: "🧭",
        description: "Moving between screens and app components",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["intents", "navigation", "activity lifecycle", "fragments"],
        isCompleted: false
      },
      {
        id: 6,
        name: "RecyclerView and Adapters",
        icon: "📋",
        description: "Displaying lists and grids efficiently",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["recyclerview", "adapters", "lists", "grids"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Data Storage",
        icon: "💾",
        description: "SharedPreferences, SQLite, and Room database",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["data storage", "room", "sqlite", "sharedpreferences"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Networking and APIs",
        icon: "🌐",
        description: "HTTP requests, REST APIs, and Retrofit",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["networking", "retrofit", "apis", "http"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Background Processing",
        icon: "⚙️",
        description: "Services, WorkManager, and background tasks",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["services", "workmanager", "background", "async"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Notifications and Permissions",
        icon: "🔔",
        description: "Push notifications and runtime permissions",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["notifications", "permissions", "push", "security"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Material Design",
        icon: "🎨",
        description: "Implementing Google's Material Design guidelines",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["material design", "ui/ux", "design guidelines", "theming"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Testing and Debugging",
        icon: "🧪",
        description: "Unit testing, UI testing, and debugging tools",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["testing", "debugging", "unit tests", "ui tests"],
        isCompleted: false
      },
      {
        id: 13,
        name: "App Publishing",
        icon: "🚀",
        description: "Play Store publishing and app optimization",
        difficulty: "Advanced",
        estimatedTime: "3-4 hours",
        keywords: ["publishing", "play store", "optimization", "release"],
        isCompleted: false
      }
    ]
  }
};

// Helper functions for roadmap management
export const getRoadmapById = (roadmapId) => {
  return LEARNING_ROADMAPS[roadmapId] || null;
};

export const getAllRoadmaps = () => {
  return Object.values(LEARNING_ROADMAPS);
};

export const getRoadmapsByCategory = (category) => {
  return Object.values(LEARNING_ROADMAPS).filter(roadmap => 
    roadmap.category.toLowerCase() === category.toLowerCase()
  );
};

export const getRoadmapsByDifficulty = (difficulty) => {
  return Object.values(LEARNING_ROADMAPS).filter(roadmap => 
    roadmap.difficulty.toLowerCase().includes(difficulty.toLowerCase())
  );
};

export const getNextTopicInRoadmap = (roadmapId, currentTopicId) => {
  const roadmap = getRoadmapById(roadmapId);
  if (!roadmap) return null;
  
  const currentIndex = roadmap.topics.findIndex(topic => topic.id === currentTopicId);
  if (currentIndex === -1 || currentIndex === roadmap.topics.length - 1) return null;
  
  return roadmap.topics[currentIndex + 1];
};

export const getRoadmapProgress = (roadmapId, completedTopics = []) => {
  const roadmap = getRoadmapById(roadmapId);
  if (!roadmap) return 0;
  
  const totalTopics = roadmap.topics.length;
  const completed = roadmap.topics.filter(topic => 
    completedTopics.includes(topic.id)
  ).length;
  
  return Math.round((completed / totalTopics) * 100);
};

export const getEstimatedTimeRemaining = (roadmapId, completedTopics = []) => {
  const roadmap = getRoadmapById(roadmapId);
  if (!roadmap) return "0 hours";
  
  const remainingTopics = roadmap.topics.filter(topic => 
    !completedTopics.includes(topic.id)
  );
  
  // Extract hours from estimated time strings like "3-4 hours"
  const totalHours = remainingTopics.reduce((total, topic) => {
    const timeStr = topic.estimatedTime;
    const match = timeStr.match(/(\d+)-?(\d+)?\s*hours?/);
    if (match) {
      const minHours = parseInt(match[1]);
      const maxHours = parseInt(match[2]) || minHours;
      return total + ((minHours + maxHours) / 2);
    }
    return total;
  }, 0);
  
  return `${Math.round(totalHours)} hours`;
};