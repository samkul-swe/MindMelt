const { _, _, db } = require('./firebase');

const roadmaps = [
  {
    id: 'dsa-fundamentals',
    name: 'Data Structures & Algorithms Fundamentals',
    description: 'Master the core concepts of DSA from basics to advanced topics',
    color: '#FF6B35',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
  },
  {
    id: 'web-development',
    name: 'Complete Web Development',
    description: 'From HTML basics to full-stack web applications',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)'
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning Mastery',
    description: 'Complete journey from ML basics to deep learning',
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
  },
  {
    id: 'system-design',
    name: 'System Design Interview Prep',
    description: 'Master large-scale system design for tech interviews',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  },
  {
    id: 'android-development',
    name: 'Android App Development',
    description: 'Build modern Android applications with Kotlin',
    color: '#2ECC71',
    gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
  },
  {
    id: 'interview-preparation',
    name: 'Interview Preparation Mastery',
    description: 'Complete technical interview preparation for top tech companies',
    color: '#FF1493',
    gradient: 'linear-gradient(135deg, #ff1493 0%, #e91e63 100%)'
  }
];

const topicsByRoadmap = {
  'dsa-fundamentals': [
    { id: 1, name: "Arrays & Strings", difficulty: "Beginner", description: "Master array manipulation and string algorithms" },
    { id: 2, name: "Linked Lists", difficulty: "Beginner", description: "Understand pointer concepts and list operations" },
    { id: 3, name: "Stacks & Queues", difficulty: "Beginner", description: "Learn LIFO and FIFO data structures" },
    { id: 4, name: "Trees & Binary Trees", difficulty: "Intermediate", description: "Explore hierarchical data structures" },
    { id: 5, name: "Binary Search Trees", difficulty: "Intermediate", description: "Efficient searching and sorting with BSTs" },
    { id: 6, name: "Heaps & Priority Queues", difficulty: "Intermediate", description: "Priority-based data structures" },
    { id: 7, name: "Hash Tables", difficulty: "Intermediate", description: "Fast lookups with hashing" },
    { id: 8, name: "Graphs", difficulty: "Advanced", description: "Network representations and traversals" },
    { id: 9, name: "Dynamic Programming", difficulty: "Advanced", description: "Optimization through memoization" },
    { id: 10, name: "Greedy Algorithms", difficulty: "Advanced", description: "Locally optimal choices" },
    { id: 11, name: "Backtracking", difficulty: "Advanced", description: "Systematic solution exploration" },
    { id: 12, name: "Divide & Conquer", difficulty: "Advanced", description: "Break problems into subproblems" },
    { id: 13, name: "String Algorithms", difficulty: "Advanced", description: "Pattern matching and manipulation" },
    { id: 14, name: "Advanced Graph Algorithms", difficulty: "Expert", description: "Shortest paths and network flows" },
    { id: 15, name: "Computational Complexity", difficulty: "Expert", description: "Big O analysis and optimization" }
  ],
  'web-development': [
    { id: 1, name: "HTML Fundamentals", difficulty: "Beginner", description: "Structure and semantic markup" },
    { id: 2, name: "CSS Styling & Layout", difficulty: "Beginner", description: "Visual design and responsive layouts" },
    { id: 3, name: "JavaScript Basics", difficulty: "Beginner", description: "Programming fundamentals for the web" },
    { id: 4, name: "DOM Manipulation", difficulty: "Intermediate", description: "Dynamic web interactions" },
    { id: 5, name: "Responsive Design", difficulty: "Intermediate", description: "Mobile-first approach" },
    { id: 6, name: "CSS Frameworks", difficulty: "Intermediate", description: "Bootstrap, Tailwind CSS" },
    { id: 7, name: "JavaScript ES6+", difficulty: "Intermediate", description: "Modern JavaScript features" },
    { id: 8, name: "React Fundamentals", difficulty: "Intermediate", description: "Component-based development" },
    { id: 9, name: "React Hooks & State", difficulty: "Advanced", description: "Modern React patterns" },
    { id: 10, name: "Backend with Node.js", difficulty: "Advanced", description: "Server-side JavaScript" },
    { id: 11, name: "Express.js & APIs", difficulty: "Advanced", description: "RESTful web services" },
    { id: 12, name: "Database Integration", difficulty: "Advanced", description: "MongoDB, PostgreSQL" },
    { id: 13, name: "Full-Stack Integration", difficulty: "Expert", description: "Connecting frontend and backend" },
    { id: 14, name: "Deployment & DevOps", difficulty: "Expert", description: "Production deployment strategies" }
  ],
  'machine-learning': [
    { id: 1, name: "Python for ML", difficulty: "Beginner", description: "NumPy, Pandas, and basic libraries" },
    { id: 2, name: "Statistics & Probability", difficulty: "Beginner", description: "Mathematical foundations" },
    { id: 3, name: "Data Preprocessing", difficulty: "Intermediate", description: "Cleaning and preparing data" },
    { id: 4, name: "Supervised Learning", difficulty: "Intermediate", description: "Classification and regression" },
    { id: 5, name: "Unsupervised Learning", difficulty: "Intermediate", description: "Clustering and dimensionality reduction" },
    { id: 6, name: "Model Evaluation", difficulty: "Intermediate", description: "Metrics and validation techniques" },
    { id: 7, name: "Feature Engineering", difficulty: "Advanced", description: "Creating better input features" },
    { id: 8, name: "Ensemble Methods", difficulty: "Advanced", description: "Random Forest, XGBoost" },
    { id: 9, name: "Neural Networks", difficulty: "Advanced", description: "Deep learning fundamentals" },
    { id: 10, name: "Deep Learning", difficulty: "Expert", description: "CNNs, RNNs, and advanced architectures" },
    { id: 11, name: "Natural Language Processing", difficulty: "Expert", description: "Text analysis and processing" },
    { id: 12, name: "MLOps & Deployment", difficulty: "Expert", description: "Production ML systems" }
  ],
  'system-design': [
    { id: 1, name: "Scalability Fundamentals", difficulty: "Intermediate", description: "Horizontal vs vertical scaling" },
    { id: 2, name: "Load Balancing", difficulty: "Intermediate", description: "Distributing traffic effectively" },
    { id: 3, name: "Database Design", difficulty: "Intermediate", description: "SQL vs NoSQL trade-offs" },
    { id: 4, name: "Caching Strategies", difficulty: "Advanced", description: "Redis, Memcached, CDNs" },
    { id: 5, name: "Message Queues", difficulty: "Advanced", description: "Asynchronous communication" },
    { id: 6, name: "Microservices Architecture", difficulty: "Advanced", description: "Service decomposition" },
    { id: 7, name: "API Design", difficulty: "Advanced", description: "RESTful and GraphQL APIs" },
    { id: 8, name: "Distributed Systems", difficulty: "Expert", description: "CAP theorem, consistency" },
    { id: 9, name: "Data Storage Solutions", difficulty: "Expert", description: "HDFS, data lakes, warehouses" },
    { id: 10, name: "Security & Authentication", difficulty: "Expert", description: "OAuth, JWT, encryption" },
    { id: 11, name: "Monitoring & Logging", difficulty: "Expert", description: "Observability in production" },
    { id: 12, name: "Case Studies", difficulty: "Expert", description: "Real-world system designs" }
  ],
  'android-development': [
    { id: 1, name: "Kotlin Fundamentals", difficulty: "Beginner", description: "Modern Android programming language" },
    { id: 2, name: "Android Studio Setup", difficulty: "Beginner", description: "Development environment" },
    { id: 3, name: "Activities & Fragments", difficulty: "Beginner", description: "App navigation basics" },
    { id: 4, name: "Layouts & UI Design", difficulty: "Intermediate", description: "Creating beautiful interfaces" },
    { id: 5, name: "RecyclerView & Adapters", difficulty: "Intermediate", description: "Efficient list display" },
    { id: 6, name: "Intent & Navigation", difficulty: "Intermediate", description: "Moving between screens" },
    { id: 7, name: "Data Storage", difficulty: "Intermediate", description: "SQLite, Room database" },
    { id: 8, name: "Networking & APIs", difficulty: "Advanced", description: "Retrofit, HTTP requests" },
    { id: 9, name: "MVVM Architecture", difficulty: "Advanced", description: "Clean architecture patterns" },
    { id: 10, name: "Background Tasks", difficulty: "Advanced", description: "Services, WorkManager" },
    { id: 11, name: "Push Notifications", difficulty: "Advanced", description: "Firebase Cloud Messaging" },
    { id: 12, name: "Testing & Debugging", difficulty: "Expert", description: "Unit and UI testing" },
    { id: 13, name: "Publishing & Play Store", difficulty: "Expert", description: "App deployment" }
  ],
  'interview-preparation': [
    { id: 1, name: "Resume & Portfolio", difficulty: "Beginner", description: "Crafting compelling applications" },
    { id: 2, name: "Technical Interview Basics", difficulty: "Beginner", description: "What to expect and how to prepare" },
    { id: 3, name: "Problem-Solving Approach", difficulty: "Intermediate", description: "Structured thinking for coding problems" },
    { id: 4, name: "Arrays & Strings Problems", difficulty: "Intermediate", description: "Common coding interview patterns" },
    { id: 5, name: "Linked List Problems", difficulty: "Intermediate", description: "Pointer manipulation techniques" },
    { id: 6, name: "Tree & Graph Problems", difficulty: "Advanced", description: "Traversal and search algorithms" },
    { id: 7, name: "Dynamic Programming", difficulty: "Advanced", description: "Optimization interview questions" },
    { id: 8, name: "System Design Interviews", difficulty: "Advanced", description: "High-level architecture questions" },
    { id: 9, name: "Behavioral Interviews", difficulty: "Intermediate", description: "STAR method and soft skills" },
    { id: 10, name: "Mock Interviews", difficulty: "Advanced", description: "Practice with realistic scenarios" },
    { id: 11, name: "Salary Negotiation", difficulty: "Intermediate", description: "Getting the best offer" },
    { id: 12, name: "Company-Specific Prep", difficulty: "Advanced", description: "FAANG and top-tier companies" },
    { id: 13, name: "Technical Leadership", difficulty: "Expert", description: "Senior-level interview topics" },
    { id: 14, name: "Cross-functional Skills", difficulty: "Advanced", description: "Product sense and business acumen" },
    { id: 15, name: "Interview Psychology", difficulty: "Intermediate", description: "Managing stress and confidence" },
    { id: 16, name: "Post-Interview Process", difficulty: "Beginner", description: "Follow-up and decision making" }
  ]
};

async function initializeFirestoreData() {
  console.log('🚀 Starting Firestore data initialization...');
  
  try {
    console.log('🗺️ Creating roadmaps collection...');
    const batch = db.batch();
    
    for (const roadmap of roadmaps) {
      const roadmapRef = db.collection('roadmaps').doc(roadmap.id);
      batch.set(roadmapRef, roadmap);
    }
    
    await batch.commit();
    console.log('✅ Roadmaps collection created successfully');

    console.log('📖 Creating topics collection...');
    const topicsBatch = db.batch();
    
    for (const [roadmapId, topics] of Object.entries(topicsByRoadmap)) {
      for (const topic of topics) {
        const topicRef = db.collection('topics').doc(`${roadmapId}_topic_${topic.id}`);
        const topicData = {
          ...topic,
          roadmapId: roadmapId,
          topicId: `${roadmapId}_topic_${topic.id}`
        };
        topicsBatch.set(topicRef, topicData);
      }
    }
    
    await topicsBatch.commit();
    console.log('✅ Topics collection created successfully');
    
    console.log('🎉 Firestore data initialization completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${roadmaps.length} roadmaps created`);
    console.log(`   - ${Object.values(topicsByRoadmap).flat().length} topics created`);
    console.log('');
    console.log('🔥 Your Firebase is now ready with the new structure!');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore data:', error);
    throw error;
  }
}

if (require.main === module) {
  initializeFirestoreData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize data:', error);
      process.exit(1);
    });
}

module.exports = { initializeFirestoreData };