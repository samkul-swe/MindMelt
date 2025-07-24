// Enhanced CS Topics Database with Local Search
// Comprehensive database of computer science topics for MindMelt

export const CS_TOPICS_DATABASE = [
  // Programming Languages
  { 
    name: "JavaScript", 
    category: "Programming Languages", 
    difficulty: "Beginner", 
    description: "Dynamic programming language for web development, both frontend and backend",
    keywords: ["js", "javascript", "web", "frontend", "backend", "node", "react", "vue"]
  },
  { 
    name: "Python", 
    category: "Programming Languages", 
    difficulty: "Beginner", 
    description: "High-level programming language popular for data science, AI, and web development",
    keywords: ["python", "data science", "ai", "machine learning", "django", "flask", "numpy", "pandas"]
  },
  { 
    name: "Java", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Object-oriented programming language used for enterprise applications and Android development",
    keywords: ["java", "oop", "android", "spring", "jvm", "enterprise"]
  },
  { 
    name: "C++", 
    category: "Programming Languages", 
    difficulty: "Advanced", 
    description: "Low-level programming language for system programming and performance-critical applications",
    keywords: ["c++", "cpp", "system programming", "performance", "games", "embedded"]
  },
  { 
    name: "C Programming", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Foundational programming language for system programming and understanding computer fundamentals",
    keywords: ["c", "system", "low level", "memory", "pointers", "embedded"]
  },
  { 
    name: "TypeScript", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Statically typed superset of JavaScript that adds type safety to web development",
    keywords: ["typescript", "ts", "javascript", "types", "static typing", "angular"]
  },
  { 
    name: "Go", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Modern programming language designed for concurrency and cloud applications",
    keywords: ["go", "golang", "concurrency", "cloud", "microservices", "docker", "kubernetes"]
  },
  { 
    name: "Rust", 
    category: "Programming Languages", 
    difficulty: "Advanced", 
    description: "Systems programming language focused on safety, speed, and concurrency",
    keywords: ["rust", "systems", "memory safety", "performance", "concurrency"]
  },
  { 
    name: "Swift", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Apple's programming language for iOS, macOS, and other Apple platform development",
    keywords: ["swift", "ios", "macos", "apple", "mobile", "xcode"]
  },
  { 
    name: "Kotlin", 
    category: "Programming Languages", 
    difficulty: "Intermediate", 
    description: "Modern programming language for Android development and JVM applications",
    keywords: ["kotlin", "android", "jvm", "java", "mobile"]
  },

  // Web Development
  { 
    name: "React", 
    category: "Web Development", 
    difficulty: "Intermediate", 
    description: "Popular JavaScript library for building user interfaces and single-page applications",
    keywords: ["react", "frontend", "ui", "components", "jsx", "hooks", "spa"]
  },
  { 
    name: "Vue.js", 
    category: "Web Development", 
    difficulty: "Beginner", 
    description: "Progressive JavaScript framework for building user interfaces",
    keywords: ["vue", "vuejs", "frontend", "progressive", "components"]
  },
  { 
    name: "Angular", 
    category: "Web Development", 
    difficulty: "Advanced", 
    description: "Full-featured TypeScript framework for building large-scale web applications",
    keywords: ["angular", "typescript", "spa", "framework", "enterprise"]
  },
  { 
    name: "Node.js", 
    category: "Web Development", 
    difficulty: "Intermediate", 
    description: "JavaScript runtime for building server-side applications and APIs",
    keywords: ["node", "nodejs", "backend", "server", "api", "npm"]
  },
  { 
    name: "HTML & CSS", 
    category: "Web Development", 
    difficulty: "Beginner", 
    description: "Fundamental technologies for creating and styling web pages",
    keywords: ["html", "css", "markup", "styling", "web", "frontend"]
  },
  { 
    name: "REST APIs", 
    category: "Web Development", 
    difficulty: "Intermediate", 
    description: "Architectural style for designing networked applications using HTTP methods",
    keywords: ["rest", "api", "http", "web services", "endpoints", "json"]
  },
  { 
    name: "GraphQL", 
    category: "Web Development", 
    difficulty: "Intermediate", 
    description: "Query language and runtime for APIs that allows clients to request specific data",
    keywords: ["graphql", "api", "query", "schema", "apollo"]
  },
  { 
    name: "WebSockets", 
    category: "Web Development", 
    difficulty: "Intermediate", 
    description: "Protocol for real-time, bidirectional communication between client and server",
    keywords: ["websockets", "realtime", "socket", "communication", "chat"]
  },

  // Data Structures & Algorithms
  { 
    name: "Arrays and Lists", 
    category: "Data Structures", 
    difficulty: "Beginner", 
    description: "Linear data structures for storing collections of elements",
    keywords: ["array", "list", "linear", "index", "iteration", "collection"]
  },
  { 
    name: "Linked Lists", 
    category: "Data Structures", 
    difficulty: "Beginner", 
    description: "Linear data structure where elements are stored in nodes with pointers",
    keywords: ["linked list", "nodes", "pointers", "singly", "doubly", "circular"]
  },
  { 
    name: "Stacks and Queues", 
    category: "Data Structures", 
    difficulty: "Beginner", 
    description: "LIFO and FIFO data structures for managing elements in specific order",
    keywords: ["stack", "queue", "lifo", "fifo", "push", "pop", "enqueue", "dequeue"]
  },
  { 
    name: "Hash Tables", 
    category: "Data Structures", 
    difficulty: "Intermediate", 
    description: "Data structure that uses hash functions to map keys to values for fast lookup",
    keywords: ["hash table", "hash map", "dictionary", "key-value", "hash function", "collision"]
  },
  { 
    name: "Binary Trees", 
    category: "Data Structures", 
    difficulty: "Intermediate", 
    description: "Hierarchical data structure where each node has at most two children",
    keywords: ["binary tree", "tree", "nodes", "root", "leaf", "traversal", "bst"]
  },
  { 
    name: "Graphs", 
    category: "Data Structures", 
    difficulty: "Advanced", 
    description: "Non-linear data structure consisting of vertices connected by edges",
    keywords: ["graph", "vertices", "edges", "directed", "undirected", "weighted", "adjacency"]
  },
  { 
    name: "Heaps", 
    category: "Data Structures", 
    difficulty: "Intermediate", 
    description: "Complete binary tree that satisfies the heap property for priority operations",
    keywords: ["heap", "priority queue", "binary heap", "min heap", "max heap"]
  },
  { 
    name: "Sorting Algorithms", 
    category: "Algorithms", 
    difficulty: "Intermediate", 
    description: "Algorithms for arranging elements in a specific order",
    keywords: ["sorting", "quicksort", "mergesort", "bubblesort", "insertion", "selection"]
  },
  { 
    name: "Search Algorithms", 
    category: "Algorithms", 
    difficulty: "Beginner", 
    description: "Algorithms for finding elements in data structures",
    keywords: ["search", "binary search", "linear search", "dfs", "bfs", "find"]
  },
  { 
    name: "Dynamic Programming", 
    category: "Algorithms", 
    difficulty: "Advanced", 
    description: "Optimization technique that solves complex problems by breaking them into subproblems",
    keywords: ["dynamic programming", "dp", "memoization", "optimization", "recursive"]
  },

  // Machine Learning & AI
  { 
    name: "Machine Learning Basics", 
    category: "Machine Learning", 
    difficulty: "Intermediate", 
    description: "Fundamental concepts of algorithms that learn patterns from data",
    keywords: ["machine learning", "ml", "supervised", "unsupervised", "training", "model"]
  },
  { 
    name: "Neural Networks", 
    category: "Machine Learning", 
    difficulty: "Advanced", 
    description: "Computing systems inspired by biological neural networks",
    keywords: ["neural networks", "deep learning", "neurons", "layers", "backpropagation"]
  },
  { 
    name: "Natural Language Processing", 
    category: "Machine Learning", 
    difficulty: "Advanced", 
    description: "AI field focused on interaction between computers and human language",
    keywords: ["nlp", "natural language", "text processing", "sentiment", "chatbot", "tokenization"]
  },
  { 
    name: "Computer Vision", 
    category: "Machine Learning", 
    difficulty: "Advanced", 
    description: "AI field that trains computers to interpret and understand visual information",
    keywords: ["computer vision", "image processing", "opencv", "cnn", "object detection"]
  },
  { 
    name: "Data Science", 
    category: "Machine Learning", 
    difficulty: "Intermediate", 
    description: "Interdisciplinary field using scientific methods to extract insights from data",
    keywords: ["data science", "statistics", "analysis", "visualization", "pandas", "numpy"]
  },

  // Databases
  { 
    name: "SQL Databases", 
    category: "Databases", 
    difficulty: "Beginner", 
    description: "Relational databases that use SQL for managing structured data",
    keywords: ["sql", "relational", "mysql", "postgresql", "sqlite", "joins", "queries"]
  },
  { 
    name: "NoSQL Databases", 
    category: "Databases", 
    difficulty: "Intermediate", 
    description: "Non-relational databases designed for flexible, scalable data storage",
    keywords: ["nosql", "mongodb", "cassandra", "document", "key-value", "column-family"]
  },
  { 
    name: "Database Design", 
    category: "Databases", 
    difficulty: "Intermediate", 
    description: "Principles and practices for designing efficient database schemas",
    keywords: ["database design", "normalization", "schema", "erd", "relationships", "constraints"]
  },

  // System Design
  { 
    name: "System Architecture", 
    category: "System Design", 
    difficulty: "Advanced", 
    description: "High-level design of complex software systems and their components",
    keywords: ["system architecture", "design patterns", "scalability", "architecture patterns"]
  },
  { 
    name: "Microservices", 
    category: "System Design", 
    difficulty: "Advanced", 
    description: "Architectural approach for building applications as independent services",
    keywords: ["microservices", "distributed", "services", "api gateway", "service mesh"]
  },
  { 
    name: "Load Balancing", 
    category: "System Design", 
    difficulty: "Intermediate", 
    description: "Distributing incoming requests across multiple servers",
    keywords: ["load balancing", "load balancer", "scaling", "distribution", "traffic"]
  },
  { 
    name: "Caching Strategies", 
    category: "System Design", 
    difficulty: "Intermediate", 
    description: "Techniques for storing frequently accessed data for faster retrieval",
    keywords: ["caching", "cache", "redis", "memcached", "cdn", "browser cache"]
  },

  // DevOps & Cloud
  { 
    name: "Docker", 
    category: "DevOps", 
    difficulty: "Intermediate", 
    description: "Containerization platform for packaging applications and dependencies",
    keywords: ["docker", "containers", "containerization", "dockerfile", "images"]
  },
  { 
    name: "Kubernetes", 
    category: "DevOps", 
    difficulty: "Advanced", 
    description: "Container orchestration platform for automating deployment and scaling",
    keywords: ["kubernetes", "k8s", "orchestration", "pods", "services", "deployment"]
  },
  { 
    name: "AWS Cloud Services", 
    category: "Cloud Computing", 
    difficulty: "Intermediate", 
    description: "Amazon's cloud computing platform and web services",
    keywords: ["aws", "cloud", "ec2", "s3", "lambda", "rds", "cloudformation"]
  },
  { 
    name: "CI/CD Pipelines", 
    category: "DevOps", 
    difficulty: "Intermediate", 
    description: "Continuous Integration and Continuous Deployment practices",
    keywords: ["ci/cd", "jenkins", "github actions", "gitlab", "automation", "pipeline"]
  },
  { 
    name: "Infrastructure as Code", 
    category: "DevOps", 
    difficulty: "Advanced", 
    description: "Managing and provisioning infrastructure through code",
    keywords: ["infrastructure as code", "iac", "terraform", "cloudformation", "ansible"]
  },

  // Security
  { 
    name: "Cybersecurity Basics", 
    category: "Security", 
    difficulty: "Intermediate", 
    description: "Fundamental principles of protecting systems and data from threats",
    keywords: ["cybersecurity", "security", "threats", "vulnerabilities", "protection"]
  },
  { 
    name: "Cryptography", 
    category: "Security", 
    difficulty: "Advanced", 
    description: "Mathematical techniques for securing communication and data",
    keywords: ["cryptography", "encryption", "decryption", "hash", "digital signatures", "ssl"]
  },
  { 
    name: "Web Security", 
    category: "Security", 
    difficulty: "Intermediate", 
    description: "Security practices for web applications and services",
    keywords: ["web security", "xss", "csrf", "sql injection", "https", "owasp"]
  },

  // Mobile Development
  { 
    name: "Android Development", 
    category: "Mobile Development", 
    difficulty: "Intermediate", 
    description: "Building applications for Android mobile devices",
    keywords: ["android", "mobile", "java", "kotlin", "android studio", "gradle"]
  },
  { 
    name: "iOS Development", 
    category: "Mobile Development", 
    difficulty: "Intermediate", 
    description: "Building applications for iPhone and iPad devices",
    keywords: ["ios", "mobile", "swift", "objective-c", "xcode", "iphone", "ipad"]
  },
  { 
    name: "React Native", 
    category: "Mobile Development", 
    difficulty: "Intermediate", 
    description: "Cross-platform mobile app development using React",
    keywords: ["react native", "cross-platform", "mobile", "react", "javascript"]
  },
  { 
    name: "Flutter", 
    category: "Mobile Development", 
    difficulty: "Intermediate", 
    description: "Google's UI toolkit for building cross-platform applications",
    keywords: ["flutter", "dart", "cross-platform", "mobile", "google"]
  },

  // Emerging Technologies
  { 
    name: "Blockchain", 
    category: "Emerging Technologies", 
    difficulty: "Advanced", 
    description: "Distributed ledger technology for secure, transparent transactions",
    keywords: ["blockchain", "cryptocurrency", "bitcoin", "ethereum", "smart contracts", "web3"]
  },
  { 
    name: "Internet of Things", 
    category: "Emerging Technologies", 
    difficulty: "Intermediate", 
    description: "Network of interconnected devices that collect and exchange data",
    keywords: ["iot", "internet of things", "sensors", "embedded", "smart devices"]
  },
  { 
    name: "Quantum Computing", 
    category: "Emerging Technologies", 
    difficulty: "Advanced", 
    description: "Computing paradigm using quantum mechanical phenomena",
    keywords: ["quantum computing", "quantum", "qubits", "superposition", "quantum algorithms"]
  },

  // Software Engineering Practices
  { 
    name: "Version Control (Git)", 
    category: "Software Engineering", 
    difficulty: "Beginner", 
    description: "System for tracking changes in source code during development",
    keywords: ["git", "version control", "github", "gitlab", "commit", "branch", "merge"]
  },
  { 
    name: "Software Testing", 
    category: "Software Engineering", 
    difficulty: "Intermediate", 
    description: "Process of evaluating software to detect defects and ensure quality",
    keywords: ["testing", "unit tests", "integration tests", "test-driven", "automation"]
  },
  { 
    name: "Agile Development", 
    category: "Software Engineering", 
    difficulty: "Beginner", 
    description: "Iterative development methodology emphasizing collaboration and adaptability",
    keywords: ["agile", "scrum", "kanban", "sprint", "methodology", "development process"]
  },
  { 
    name: "Design Patterns", 
    category: "Software Engineering", 
    difficulty: "Advanced", 
    description: "Reusable solutions to common problems in software design",
    keywords: ["design patterns", "singleton", "factory", "observer", "mvc", "solid principles"]
  }
];

// Enhanced local search function with intelligent scoring
export const searchCSTopicsLocally = (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const results = [];

  CS_TOPICS_DATABASE.forEach(topic => {
    let score = 0;
    
    // Exact name match (highest priority)
    if (topic.name.toLowerCase() === searchTerm) {
      score += 100;
    }
    // Name starts with search term
    else if (topic.name.toLowerCase().startsWith(searchTerm)) {
      score += 50;
    }
    // Name contains search term
    else if (topic.name.toLowerCase().includes(searchTerm)) {
      score += 30;
    }
    
    // Check keywords (important for alternative names)
    const keywordMatch = topic.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm) || searchTerm.includes(keyword.toLowerCase())
    );
    if (keywordMatch) {
      score += 20;
    }
    
    // Category match
    if (topic.category.toLowerCase().includes(searchTerm)) {
      score += 15;
    }
    
    // Description match
    if (topic.description.toLowerCase().includes(searchTerm)) {
      score += 10;
    }
    
    // Add partial word matches for multi-word searches
    const words = searchTerm.split(' ');
    words.forEach(word => {
      if (word.length > 2) {
        if (topic.name.toLowerCase().includes(word)) {
          score += 5;
        }
        topic.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(word)) {
            score += 3;
          }
        });
      }
    });
    
    if (score > 0) {
      results.push({ ...topic, score });
    }
  });

  // Sort by score (descending) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Limit to top 8 results
    .map(({ score, ...topic }) => topic); // Remove score from final results
};

// Get random suggested topics for empty search
export const getSuggestedTopics = (count = 6) => {
  const shuffled = [...CS_TOPICS_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get topics by category
export const getTopicsByCategory = (category) => {
  return CS_TOPICS_DATABASE.filter(topic => 
    topic.category.toLowerCase() === category.toLowerCase()
  );
};

// Get topics by difficulty
export const getTopicsByDifficulty = (difficulty) => {
  return CS_TOPICS_DATABASE.filter(topic => 
    topic.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};
