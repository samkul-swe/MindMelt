// GeeksforGeeks Style Learning Roadmaps
// Complete structured learning paths for computer science topics

export const LEARNING_ROADMAPS = {
  "dsa-fundamentals": {
    id: "dsa-fundamentals",
    title: "Data Structures & Algorithms Fundamentals",
    description: "Master the core concepts of DSA from basics to advanced topics",
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
        description: "Understanding what data structures are and why they matter",
        difficulty: "Beginner",
        estimatedTime: "2-3 hours",
        keywords: ["data structures", "introduction", "basics", "overview"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Arrays and Strings",
        description: "Working with linear data structures - arrays and string manipulation",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["arrays", "strings", "indexing", "iteration", "manipulation"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Linked Lists",
        description: "Understanding pointer-based data structures",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["linked lists", "pointers", "nodes", "singly", "doubly"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Stacks and Queues",
        description: "LIFO and FIFO data structures with practical applications",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["stack", "queue", "lifo", "fifo", "applications"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Recursion and Backtracking",
        description: "Master recursive thinking and backtracking algorithms",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["recursion", "backtracking", "recursive", "base case"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Binary Trees",
        description: "Hierarchical data structures and tree traversals",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["binary trees", "traversal", "inorder", "preorder", "postorder"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Binary Search Trees",
        description: "Efficient searching and sorting with BSTs",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["bst", "binary search tree", "searching", "insertion", "deletion"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Heaps and Priority Queues",
        description: "Understanding heap data structure and priority queues",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["heap", "priority queue", "min heap", "max heap", "heapify"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Hash Tables and Hashing",
        description: "Fast data retrieval using hash functions",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["hash table", "hashing", "collision", "hash function", "dictionary"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Graphs - Representation and Traversal",
        description: "Graph data structures, BFS, and DFS algorithms",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["graphs", "bfs", "dfs", "adjacency", "traversal"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Sorting Algorithms",
        description: "Comparison and non-comparison based sorting techniques",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["sorting", "quicksort", "mergesort", "heapsort", "radix sort"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Searching Algorithms",
        description: "Linear and binary search techniques",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["search", "binary search", "linear search", "algorithms"],
        isCompleted: false
      },
      {
        id: 13,
        name: "Dynamic Programming",
        description: "Optimization technique for solving complex problems",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["dynamic programming", "dp", "memoization", "optimization"],
        isCompleted: false
      },
      {
        id: 14,
        name: "Greedy Algorithms",
        description: "Making locally optimal choices for global optimization",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["greedy", "optimization", "algorithms", "local optimal"],
        isCompleted: false
      },
      {
        id: 15,
        name: "Graph Algorithms",
        description: "Advanced graph algorithms - Dijkstra, MST, etc.",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["dijkstra", "mst", "shortest path", "graph algorithms"],
        isCompleted: false
      }
    ]
  },

  "interview-preparation": {
    id: "interview-preparation",
    title: "Complete Interview Preparation",
    description: "Comprehensive preparation for technical interviews at top tech companies",
    difficulty: "Intermediate to Advanced",
    estimatedTime: "12-16 weeks",
    category: "Interview Preparation",
    color: "#F39C12",
    prerequisites: ["Basic programming knowledge", "Data structures basics", "Problem-solving skills"],
    skills: ["Algorithmic Thinking", "System Design", "Behavioral Interview", "Coding Interview"],
    topics: [
      {
        id: 1,
        name: "Interview Fundamentals",
        description: "Understanding the interview process, types of questions, and preparation strategy",
        difficulty: "Beginner",
        estimatedTime: "2-3 hours",
        keywords: ["interview process", "preparation strategy", "question types", "fundamentals"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Time and Space Complexity Analysis",
        description: "Master Big O notation, time complexity, and space complexity analysis",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["big o", "time complexity", "space complexity", "analysis", "optimization"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Array and String Problems",
        description: "Essential array and string manipulation problems commonly asked in interviews",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["arrays", "strings", "two pointers", "sliding window", "manipulation"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Linked List Interview Problems",
        description: "Classic linked list problems: reversal, cycle detection, merging",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["linked list", "reversal", "cycle detection", "merging", "pointers"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Stack and Queue Problems",
        description: "Stack and queue based problems including valid parentheses, monotonic stack",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["stack", "queue", "parentheses", "monotonic stack", "deque"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Binary Tree and BST Problems",
        description: "Tree traversals, path problems, validation, and construction problems",
        difficulty: "Intermediate",
        estimatedTime: "6-7 hours",
        keywords: ["binary tree", "bst", "traversal", "path problems", "validation"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Hash Table and HashMap Problems",
        description: "Hash-based solutions for frequency counting, anagrams, and lookup problems",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["hash table", "hashmap", "frequency", "anagrams", "lookup"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Two Pointers and Sliding Window",
        description: "Master two-pointer technique and sliding window for array and string problems",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["two pointers", "sliding window", "subarray", "substring", "optimization"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Binary Search and Variants",
        description: "Binary search on arrays, search in rotated arrays, and peak finding",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["binary search", "rotated array", "peak finding", "search variants"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Recursion and Backtracking",
        description: "Recursive solutions, backtracking for permutations, combinations, and puzzles",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["recursion", "backtracking", "permutations", "combinations", "puzzles"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Dynamic Programming Patterns",
        description: "Classic DP patterns: knapsack, LIS, LCS, matrix chain multiplication",
        difficulty: "Advanced",
        estimatedTime: "8-10 hours",
        keywords: ["dynamic programming", "dp", "knapsack", "lis", "lcs", "optimization"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Graph Algorithms for Interviews",
        description: "DFS, BFS, shortest path, topological sort, and cycle detection",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["graph", "dfs", "bfs", "shortest path", "topological sort", "cycles"],
        isCompleted: false
      },
      {
        id: 13,
        name: "Greedy Algorithm Problems",
        description: "Greedy approach for interval scheduling, activity selection, and optimization",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["greedy", "interval scheduling", "activity selection", "optimization"],
        isCompleted: false
      },
      {
        id: 14,
        name: "Heap and Priority Queue Problems",
        description: "Top K problems, merge K lists, median finding using heaps",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["heap", "priority queue", "top k", "merge", "median"],
        isCompleted: false
      },
      {
        id: 15,
        name: "System Design Fundamentals",
        description: "Basics of system design interviews: scalability, load balancing, databases",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["system design", "scalability", "load balancing", "databases", "architecture"],
        isCompleted: false
      },
      {
        id: 16,
        name: "Behavioral Interview Preparation",
        description: "STAR method, leadership principles, and common behavioral questions",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["behavioral", "star method", "leadership", "teamwork", "communication"],
        isCompleted: false
      },
      {
        id: 17,
        name: "Mock Interview Practice",
        description: "Practice sessions, common mistakes, time management, and interview tips",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["mock interview", "practice", "time management", "tips", "mistakes"],
        isCompleted: false
      },
      {
        id: 18,
        name: "Company-Specific Preparation",
        description: "FAANG-specific prep, company culture, and specialized question patterns",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["faang", "company specific", "culture", "question patterns", "preparation"],
        isCompleted: false
      }
    ]
  },

  "web-development": {
    id: "web-development",
    title: "Complete Web Development",
    description: "From HTML basics to full-stack web applications",
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
        description: "Structure and markup of web pages",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["html", "markup", "tags", "structure", "elements"],
        isCompleted: false
      },
      {
        id: 2,
        name: "CSS Styling and Layout",
        description: "Styling web pages with CSS and modern layout techniques",
        difficulty: "Beginner",
        estimatedTime: "5-6 hours",
        keywords: ["css", "styling", "flexbox", "grid", "layout"],
        isCompleted: false
      },
      {
        id: 3,
        name: "JavaScript Basics",
        description: "Programming fundamentals with JavaScript",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["javascript", "variables", "functions", "dom", "events"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Advanced JavaScript",
        description: "ES6+, async/await, closures, and advanced concepts",
        difficulty: "Intermediate",
        estimatedTime: "8-10 hours",
        keywords: ["es6", "async", "promises", "closures", "scope"],
        isCompleted: false
      },
      {
        id: 5,
        name: "React Fundamentals",
        description: "Building user interfaces with React",
        difficulty: "Intermediate",
        estimatedTime: "8-10 hours",
        keywords: ["react", "components", "jsx", "props", "state"],
        isCompleted: false
      },
      {
        id: 6,
        name: "React Hooks and State Management",
        description: "Modern React patterns and state management",
        difficulty: "Intermediate",
        estimatedTime: "6-8 hours",
        keywords: ["hooks", "usestate", "useeffect", "context", "state"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Node.js and Express",
        description: "Server-side JavaScript development",
        difficulty: "Intermediate",
        estimatedTime: "6-8 hours",
        keywords: ["nodejs", "express", "server", "backend", "api"],
        isCompleted: false
      },
      {
        id: 8,
        name: "RESTful APIs",
        description: "Building and consuming REST APIs",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["rest", "api", "http", "endpoints", "crud"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Database Integration",
        description: "Working with databases in web applications",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["database", "sql", "mongodb", "orm", "queries"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Authentication and Security",
        description: "User authentication and web security practices",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["authentication", "jwt", "security", "authorization", "oauth"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Frontend Build Tools",
        description: "Webpack, Vite, and modern build processes",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["webpack", "vite", "bundling", "build tools", "optimization"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Testing and Debugging",
        description: "Unit testing, integration testing, and debugging techniques",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["testing", "jest", "debugging", "unit tests", "integration"],
        isCompleted: false
      },
      {
        id: 13,
        name: "Deployment and DevOps",
        description: "Deploying web applications to production",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["deployment", "devops", "ci/cd", "hosting", "production"],
        isCompleted: false
      },
      {
        id: 14,
        name: "Performance Optimization",
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
        description: "Understanding ML concepts, types, and applications",
        difficulty: "Beginner",
        estimatedTime: "3-4 hours",
        keywords: ["machine learning", "supervised", "unsupervised", "reinforcement"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Python for Data Science",
        description: "NumPy, Pandas, and Matplotlib for data manipulation",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["python", "numpy", "pandas", "matplotlib", "data science"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Data Preprocessing",
        description: "Cleaning, transforming, and preparing data for ML",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["preprocessing", "cleaning", "feature engineering", "scaling"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Linear Regression",
        description: "Understanding linear relationships and regression analysis",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["linear regression", "regression", "prediction", "correlation"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Classification Algorithms",
        description: "Logistic regression, SVM, and decision trees",
        difficulty: "Intermediate",
        estimatedTime: "6-7 hours",
        keywords: ["classification", "logistic regression", "svm", "decision trees"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Clustering and Unsupervised Learning",
        description: "K-means, hierarchical clustering, and dimensionality reduction",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["clustering", "kmeans", "unsupervised", "pca", "dimensionality"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Model Evaluation and Validation",
        description: "Cross-validation, metrics, and model selection",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["validation", "cross validation", "metrics", "evaluation"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Ensemble Methods",
        description: "Random forests, boosting, and ensemble techniques",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["ensemble", "random forest", "boosting", "bagging"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Introduction to Neural Networks",
        description: "Perceptrons, feedforward networks, and backpropagation",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["neural networks", "perceptron", "backpropagation", "deep learning"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Deep Learning with TensorFlow",
        description: "Building deep neural networks with TensorFlow/Keras",
        difficulty: "Advanced",
        estimatedTime: "8-10 hours",
        keywords: ["tensorflow", "keras", "deep learning", "neural networks"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Convolutional Neural Networks",
        description: "CNNs for image processing and computer vision",
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        keywords: ["cnn", "computer vision", "image processing", "convolution"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Natural Language Processing",
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
        description: "Basic concepts of system design and architecture",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["system design", "architecture", "fundamentals", "basics"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Scalability Principles",
        description: "Horizontal vs vertical scaling, load distribution",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["scalability", "horizontal", "vertical", "scaling"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Load Balancing",
        description: "Load balancers, algorithms, and failover strategies",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["load balancing", "load balancer", "algorithms", "failover"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Caching Strategies",
        description: "Redis, Memcached, CDNs, and caching patterns",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["caching", "redis", "memcached", "cdn", "cache patterns"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Database Design and Sharding",
        description: "SQL vs NoSQL, sharding, replication, and consistency",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["database", "sharding", "replication", "consistency", "nosql"],
        isCompleted: false
      },
      {
        id: 6,
        name: "Message Queues and Pub/Sub",
        description: "Asynchronous processing with RabbitMQ, Kafka",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["message queue", "pubsub", "kafka", "rabbitmq", "async"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Microservices Architecture",
        description: "Service decomposition, API gateways, and service mesh",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["microservices", "api gateway", "service mesh", "decomposition"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Designing Chat Systems",
        description: "Real-time messaging, WebSockets, and notification systems",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["chat system", "websockets", "realtime", "messaging"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Designing Social Media Feeds",
        description: "News feeds, timeline generation, and content ranking",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["social media", "news feed", "timeline", "content ranking"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Designing URL Shorteners",
        description: "URL encoding, analytics, and rate limiting",
        difficulty: "Advanced",
        estimatedTime: "3-4 hours",
        keywords: ["url shortener", "encoding", "analytics", "rate limiting"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Search Engine Design",
        description: "Indexing, ranking algorithms, and distributed search",
        difficulty: "Advanced",
        estimatedTime: "6-7 hours",
        keywords: ["search engine", "indexing", "ranking", "distributed search"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Monitoring and Observability",
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
        description: "Android ecosystem, development environment setup",
        difficulty: "Beginner",
        estimatedTime: "2-3 hours",
        keywords: ["android", "setup", "development environment", "basics"],
        isCompleted: false
      },
      {
        id: 2,
        name: "Kotlin Programming",
        description: "Kotlin syntax, features, and Android-specific usage",
        difficulty: "Beginner",
        estimatedTime: "6-8 hours",
        keywords: ["kotlin", "programming", "syntax", "features"],
        isCompleted: false
      },
      {
        id: 3,
        name: "Activities and Layouts",
        description: "Creating screens and designing user interfaces",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["activities", "layouts", "ui design", "xml"],
        isCompleted: false
      },
      {
        id: 4,
        name: "Views and ViewGroups",
        description: "Working with UI components and layout managers",
        difficulty: "Beginner",
        estimatedTime: "4-5 hours",
        keywords: ["views", "viewgroups", "ui components", "layout managers"],
        isCompleted: false
      },
      {
        id: 5,
        name: "Intents and Navigation",
        description: "Moving between screens and app components",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["intents", "navigation", "activity lifecycle", "fragments"],
        isCompleted: false
      },
      {
        id: 6,
        name: "RecyclerView and Adapters",
        description: "Displaying lists and grids efficiently",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["recyclerview", "adapters", "lists", "grids"],
        isCompleted: false
      },
      {
        id: 7,
        name: "Data Storage",
        description: "SharedPreferences, SQLite, and Room database",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["data storage", "room", "sqlite", "sharedpreferences"],
        isCompleted: false
      },
      {
        id: 8,
        name: "Networking and APIs",
        description: "HTTP requests, REST APIs, and Retrofit",
        difficulty: "Intermediate",
        estimatedTime: "5-6 hours",
        keywords: ["networking", "retrofit", "apis", "http"],
        isCompleted: false
      },
      {
        id: 9,
        name: "Background Processing",
        description: "Services, WorkManager, and background tasks",
        difficulty: "Advanced",
        estimatedTime: "4-5 hours",
        keywords: ["services", "workmanager", "background", "async"],
        isCompleted: false
      },
      {
        id: 10,
        name: "Notifications and Permissions",
        description: "Push notifications and runtime permissions",
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        keywords: ["notifications", "permissions", "push", "security"],
        isCompleted: false
      },
      {
        id: 11,
        name: "Material Design",
        description: "Implementing Google's Material Design guidelines",
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        keywords: ["material design", "ui/ux", "design guidelines", "theming"],
        isCompleted: false
      },
      {
        id: 12,
        name: "Testing and Debugging",
        description: "Unit testing, UI testing, and debugging tools",
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        keywords: ["testing", "debugging", "unit tests", "ui tests"],
        isCompleted: false
      },
      {
        id: 13,
        name: "App Publishing",
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
