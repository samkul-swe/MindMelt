const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'mindmelt-cf760-firebase-adminsdk-fbsvc-967d6327f6.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Course data
const courses = [
  {
    id: 'dsa-fundamentals',
    name: 'Data Structures & Algorithms Fundamentals',
    description: 'Master the core concepts of DSA from basics to advanced topics',
    category: 'Programming Fundamentals',
    difficulty: 'Beginner to Advanced',
    color: '#FF6B35',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    duration: '8-12 weeks',
    totalTopics: 15,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'web-development',
    name: 'Complete Web Development',
    description: 'From HTML basics to full-stack web applications',
    category: 'Web Development',
    difficulty: 'Beginner to Advanced',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    duration: '12-16 weeks',
    totalTopics: 14,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning Mastery',
    description: 'Complete journey from ML basics to deep learning',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate to Advanced',
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
    duration: '10-14 weeks',
    totalTopics: 12,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'system-design',
    name: 'System Design Interview Prep',
    description: 'Master large-scale system design for tech interviews',
    category: 'System Architecture',
    difficulty: 'Advanced',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    duration: '8-10 weeks',
    totalTopics: 12,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'android-development',
    name: 'Android App Development',
    description: 'Build modern Android applications with Kotlin',
    category: 'Mobile Development',
    difficulty: 'Beginner to Advanced',
    color: '#2ECC71',
    gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
    duration: '10-12 weeks',
    totalTopics: 13,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'interview-preparation',
    name: 'Interview Preparation Mastery',
    description: 'Complete technical interview preparation for top tech companies',
    category: 'Interview Prep',
    difficulty: 'Intermediate to Advanced',
    color: '#FF1493',
    gradient: 'linear-gradient(135deg, #ff1493 0%, #e91e63 100%)',
    duration: '12-16 weeks',
    totalTopics: 16,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Topics data organized by course
const topicsByCourse = {
  'dsa-fundamentals': [
    { id: 1, name: "Arrays & Strings", difficulty: "Beginner", duration: "3-4 hours", description: "Master array manipulation and string algorithms", order: 1 },
    { id: 2, name: "Linked Lists", difficulty: "Beginner", duration: "2-3 hours", description: "Understand pointer concepts and list operations", order: 2 },
    { id: 3, name: "Stacks & Queues", difficulty: "Beginner", duration: "2-3 hours", description: "Learn LIFO and FIFO data structures", order: 3 },
    { id: 4, name: "Trees & Binary Trees", difficulty: "Intermediate", duration: "4-5 hours", description: "Explore hierarchical data structures", order: 4 },
    { id: 5, name: "Binary Search Trees", difficulty: "Intermediate", duration: "3-4 hours", description: "Efficient searching and sorting with BSTs", order: 5 },
    { id: 6, name: "Heaps & Priority Queues", difficulty: "Intermediate", duration: "3-4 hours", description: "Priority-based data structures", order: 6 },
    { id: 7, name: "Hash Tables", difficulty: "Intermediate", duration: "3-4 hours", description: "Fast lookups with hashing", order: 7 },
    { id: 8, name: "Graphs", difficulty: "Advanced", duration: "5-6 hours", description: "Network representations and traversals", order: 8 },
    { id: 9, name: "Dynamic Programming", difficulty: "Advanced", duration: "6-8 hours", description: "Optimization through memoization", order: 9 },
    { id: 10, name: "Greedy Algorithms", difficulty: "Advanced", duration: "4-5 hours", description: "Locally optimal choices", order: 10 },
    { id: 11, name: "Backtracking", difficulty: "Advanced", duration: "4-5 hours", description: "Systematic solution exploration", order: 11 },
    { id: 12, name: "Divide & Conquer", difficulty: "Advanced", duration: "4-5 hours", description: "Break problems into subproblems", order: 12 },
    { id: 13, name: "String Algorithms", difficulty: "Advanced", duration: "4-5 hours", description: "Pattern matching and manipulation", order: 13 },
    { id: 14, name: "Advanced Graph Algorithms", difficulty: "Expert", duration: "6-7 hours", description: "Shortest paths and network flows", order: 14 },
    { id: 15, name: "Computational Complexity", difficulty: "Expert", duration: "3-4 hours", description: "Big O analysis and optimization", order: 15 }
  ],
  'web-development': [
    { id: 1, name: "HTML Fundamentals", difficulty: "Beginner", duration: "2-3 hours", description: "Structure and semantic markup", order: 1 },
    { id: 2, name: "CSS Styling & Layout", difficulty: "Beginner", duration: "4-5 hours", description: "Visual design and responsive layouts", order: 2 },
    { id: 3, name: "JavaScript Basics", difficulty: "Beginner", duration: "6-8 hours", description: "Programming fundamentals for the web", order: 3 },
    { id: 4, name: "DOM Manipulation", difficulty: "Intermediate", duration: "4-5 hours", description: "Dynamic web interactions", order: 4 },
    { id: 5, name: "Responsive Design", difficulty: "Intermediate", duration: "4-5 hours", description: "Mobile-first approach", order: 5 },
    { id: 6, name: "CSS Frameworks", difficulty: "Intermediate", duration: "5-6 hours", description: "Bootstrap, Tailwind CSS", order: 6 },
    { id: 7, name: "JavaScript ES6+", difficulty: "Intermediate", duration: "6-7 hours", description: "Modern JavaScript features", order: 7 },
    { id: 8, name: "React Fundamentals", difficulty: "Intermediate", duration: "8-10 hours", description: "Component-based development", order: 8 },
    { id: 9, name: "React Hooks & State", difficulty: "Advanced", duration: "6-8 hours", description: "Modern React patterns", order: 9 },
    { id: 10, name: "Backend with Node.js", difficulty: "Advanced", duration: "8-10 hours", description: "Server-side JavaScript", order: 10 },
    { id: 11, name: "Express.js & APIs", difficulty: "Advanced", duration: "6-8 hours", description: "RESTful web services", order: 11 },
    { id: 12, name: "Database Integration", difficulty: "Advanced", duration: "6-8 hours", description: "MongoDB, PostgreSQL", order: 12 },
    { id: 13, name: "Full-Stack Integration", difficulty: "Expert", duration: "8-10 hours", description: "Connecting frontend and backend", order: 13 },
    { id: 14, name: "Deployment & DevOps", difficulty: "Expert", duration: "6-8 hours", description: "Production deployment strategies", order: 14 }
  ],
  'machine-learning': [
    { id: 1, name: "Python for ML", difficulty: "Beginner", duration: "4-5 hours", description: "NumPy, Pandas, and basic libraries", order: 1 },
    { id: 2, name: "Statistics & Probability", difficulty: "Beginner", duration: "5-6 hours", description: "Mathematical foundations", order: 2 },
    { id: 3, name: "Data Preprocessing", difficulty: "Intermediate", duration: "4-5 hours", description: "Cleaning and preparing data", order: 3 },
    { id: 4, name: "Supervised Learning", difficulty: "Intermediate", duration: "6-8 hours", description: "Classification and regression", order: 4 },
    { id: 5, name: "Unsupervised Learning", difficulty: "Intermediate", duration: "5-6 hours", description: "Clustering and dimensionality reduction", order: 5 },
    { id: 6, name: "Model Evaluation", difficulty: "Intermediate", duration: "4-5 hours", description: "Metrics and validation techniques", order: 6 },
    { id: 7, name: "Feature Engineering", difficulty: "Advanced", duration: "5-6 hours", description: "Creating better input features", order: 7 },
    { id: 8, name: "Ensemble Methods", difficulty: "Advanced", duration: "6-7 hours", description: "Random Forest, XGBoost", order: 8 },
    { id: 9, name: "Neural Networks", difficulty: "Advanced", duration: "8-10 hours", description: "Deep learning fundamentals", order: 9 },
    { id: 10, name: "Deep Learning", difficulty: "Expert", duration: "10-12 hours", description: "CNNs, RNNs, and advanced architectures", order: 10 },
    { id: 11, name: "Natural Language Processing", difficulty: "Expert", duration: "8-10 hours", description: "Text analysis and processing", order: 11 },
    { id: 12, name: "MLOps & Deployment", difficulty: "Expert", duration: "6-8 hours", description: "Production ML systems", order: 12 }
  ],
  'system-design': [
    { id: 1, name: "Scalability Fundamentals", difficulty: "Intermediate", duration: "3-4 hours", description: "Horizontal vs vertical scaling", order: 1 },
    { id: 2, name: "Load Balancing", difficulty: "Intermediate", duration: "3-4 hours", description: "Distributing traffic effectively", order: 2 },
    { id: 3, name: "Database Design", difficulty: "Intermediate", duration: "5-6 hours", description: "SQL vs NoSQL trade-offs", order: 3 },
    { id: 4, name: "Caching Strategies", difficulty: "Advanced", duration: "4-5 hours", description: "Redis, Memcached, CDNs", order: 4 },
    { id: 5, name: "Message Queues", difficulty: "Advanced", duration: "4-5 hours", description: "Asynchronous communication", order: 5 },
    { id: 6, name: "Microservices Architecture", difficulty: "Advanced", duration: "6-7 hours", description: "Service decomposition", order: 6 },
    { id: 7, name: "API Design", difficulty: "Advanced", duration: "4-5 hours", description: "RESTful and GraphQL APIs", order: 7 },
    { id: 8, name: "Distributed Systems", difficulty: "Expert", duration: "8-10 hours", description: "CAP theorem, consistency", order: 8 },
    { id: 9, name: "Data Storage Solutions", difficulty: "Expert", duration: "6-8 hours", description: "HDFS, data lakes, warehouses", order: 9 },
    { id: 10, name: "Security & Authentication", difficulty: "Expert", duration: "5-6 hours", description: "OAuth, JWT, encryption", order: 10 },
    { id: 11, name: "Monitoring & Logging", difficulty: "Expert", duration: "4-5 hours", description: "Observability in production", order: 11 },
    { id: 12, name: "Case Studies", difficulty: "Expert", duration: "6-8 hours", description: "Real-world system designs", order: 12 }
  ],
  'android-development': [
    { id: 1, name: "Kotlin Fundamentals", difficulty: "Beginner", duration: "4-5 hours", description: "Modern Android programming language", order: 1 },
    { id: 2, name: "Android Studio Setup", difficulty: "Beginner", duration: "2-3 hours", description: "Development environment", order: 2 },
    { id: 3, name: "Activities & Fragments", difficulty: "Beginner", duration: "4-5 hours", description: "App navigation basics", order: 3 },
    { id: 4, name: "Layouts & UI Design", difficulty: "Intermediate", duration: "5-6 hours", description: "Creating beautiful interfaces", order: 4 },
    { id: 5, name: "RecyclerView & Adapters", difficulty: "Intermediate", duration: "4-5 hours", description: "Efficient list display", order: 5 },
    { id: 6, name: "Intent & Navigation", difficulty: "Intermediate", duration: "3-4 hours", description: "Moving between screens", order: 6 },
    { id: 7, name: "Data Storage", difficulty: "Intermediate", duration: "5-6 hours", description: "SQLite, Room database", order: 7 },
    { id: 8, name: "Networking & APIs", difficulty: "Advanced", duration: "6-7 hours", description: "Retrofit, HTTP requests", order: 8 },
    { id: 9, name: "MVVM Architecture", difficulty: "Advanced", duration: "6-8 hours", description: "Clean architecture patterns", order: 9 },
    { id: 10, name: "Background Tasks", difficulty: "Advanced", duration: "5-6 hours", description: "Services, WorkManager", order: 10 },
    { id: 11, name: "Push Notifications", difficulty: "Advanced", duration: "4-5 hours", description: "Firebase Cloud Messaging", order: 11 },
    { id: 12, name: "Testing & Debugging", difficulty: "Expert", duration: "5-6 hours", description: "Unit and UI testing", order: 12 },
    { id: 13, name: "Publishing & Play Store", difficulty: "Expert", duration: "3-4 hours", description: "App deployment", order: 13 }
  ],
  'interview-preparation': [
    { id: 1, name: "Resume & Portfolio", difficulty: "Beginner", duration: "3-4 hours", description: "Crafting compelling applications", order: 1 },
    { id: 2, name: "Technical Interview Basics", difficulty: "Beginner", duration: "4-5 hours", description: "What to expect and how to prepare", order: 2 },
    { id: 3, name: "Problem-Solving Approach", difficulty: "Intermediate", duration: "4-5 hours", description: "Structured thinking for coding problems", order: 3 },
    { id: 4, name: "Arrays & Strings Problems", difficulty: "Intermediate", duration: "6-8 hours", description: "Common coding interview patterns", order: 4 },
    { id: 5, name: "Linked List Problems", difficulty: "Intermediate", duration: "4-5 hours", description: "Pointer manipulation techniques", order: 5 },
    { id: 6, name: "Tree & Graph Problems", difficulty: "Advanced", duration: "8-10 hours", description: "Traversal and search algorithms", order: 6 },
    { id: 7, name: "Dynamic Programming", difficulty: "Advanced", duration: "8-10 hours", description: "Optimization interview questions", order: 7 },
    { id: 8, name: "System Design Interviews", difficulty: "Advanced", duration: "6-8 hours", description: "High-level architecture questions", order: 8 },
    { id: 9, name: "Behavioral Interviews", difficulty: "Intermediate", duration: "4-5 hours", description: "STAR method and soft skills", order: 9 },
    { id: 10, name: "Mock Interviews", difficulty: "Advanced", duration: "6-8 hours", description: "Practice with realistic scenarios", order: 10 },
    { id: 11, name: "Salary Negotiation", difficulty: "Intermediate", duration: "2-3 hours", description: "Getting the best offer", order: 11 },
    { id: 12, name: "Company-Specific Prep", difficulty: "Advanced", duration: "4-6 hours", description: "FAANG and top-tier companies", order: 12 },
    { id: 13, name: "Technical Leadership", difficulty: "Expert", duration: "4-5 hours", description: "Senior-level interview topics", order: 13 },
    { id: 14, name: "Cross-functional Skills", difficulty: "Advanced", duration: "3-4 hours", description: "Product sense and business acumen", order: 14 },
    { id: 15, name: "Interview Psychology", difficulty: "Intermediate", duration: "2-3 hours", description: "Managing stress and confidence", order: 15 },
    { id: 16, name: "Post-Interview Process", difficulty: "Beginner", duration: "2-3 hours", description: "Follow-up and decision making", order: 16 }
  ]
};

async function initializeFirestoreData() {
  console.log('🚀 Starting Firestore data initialization...');
  
  try {
    // Initialize courses collection
    console.log('📚 Creating courses collection...');
    const batch = db.batch();
    
    for (const course of courses) {
      const courseRef = db.collection('courses').doc(course.id);
      batch.set(courseRef, course);
    }
    
    await batch.commit();
    console.log('✅ Courses collection created successfully');
    
    // Initialize topics collection
    console.log('📖 Creating topics collection...');
    const topicsBatch = db.batch();
    
    for (const [courseId, topics] of Object.entries(topicsByCourse)) {
      for (const topic of topics) {
        const topicRef = db.collection('topics').doc(`${courseId}_topic_${topic.id}`);
        const topicData = {
          ...topic,
          courseId: courseId,
          topicId: `${courseId}_topic_${topic.id}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        topicsBatch.set(topicRef, topicData);
      }
    }
    
    await topicsBatch.commit();
    console.log('✅ Topics collection created successfully');
    
    console.log('🎉 Firestore data initialization completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${courses.length} courses created`);
    console.log(`   - ${Object.values(topicsByCourse).flat().length} topics created`);
    console.log('');
    console.log('🔥 Your Firebase is now ready with the new structure!');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore data:', error);
    throw error;
  }
}

// Run the initialization
if (require.main === module) {
  initializeFirestoreData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize data:', error);
      process.exit(1);
    });
}

module.exports = { initializeFirestoreData };
