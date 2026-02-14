import db from '../config/firebase.js';

/**
 * Seed MCQ Test Questions for Mobile Engineer
 */

const mobileEngineerQuestions = [
  // ARCHITECTURE & DESIGN (3 questions)
  {
    id: 'mobile_q_001',
    role: 'Mobile Engineer',
    category: 'Architecture',
    difficulty: 'expert',
    order: 1,
    question: 'You\'re building a social media feed that updates in real-time with potentially 1000+ posts. Which state management approach is MOST appropriate?',
    options: [
      {
        id: 'A',
        text: 'useState with a single array of all posts',
        correct: false,
        explanation: 'This would cause excessive re-renders every time any post updates, severely impacting performance.'
      },
      {
        id: 'B',
        text: 'Context API with reducer for normalized state',
        correct: true,
        explanation: 'Normalized state prevents unnecessary re-renders, Context provides global access, and reducer handles complex updates efficiently.'
      },
      {
        id: 'C',
        text: 'Local state with useRef for caching',
        correct: false,
        explanation: 'useRef doesn\'t trigger component updates, so UI won\'t reflect data changes.'
      }
    ]
  },

  {
    id: 'mobile_q_002',
    role: 'Mobile Engineer',
    category: 'Architecture',
    difficulty: 'expert',
    order: 2,
    question: 'For a chat app handling 10,000+ messages, which component architecture is best?',
    options: [
      {
        id: 'A',
        text: 'Single ChatScreen component with all logic',
        correct: false,
        explanation: 'Monolithic components become unmaintainable and hard to optimize.'
      },
      {
        id: 'B',
        text: 'ChatScreen → MessageList → MessageItem with React.memo',
        correct: true,
        explanation: 'Proper component hierarchy with memoization prevents unnecessary re-renders of individual messages.'
      },
      {
        id: 'C',
        text: 'Separate component per message type without memoization',
        correct: false,
        explanation: 'Without memoization, all messages re-render on any update.'
      }
    ]
  },

  {
    id: 'mobile_q_003',
    role: 'Mobile Engineer',
    category: 'Architecture',
    difficulty: 'expert',
    order: 3,
    question: 'You need to share user authentication state across 20+ screens. Best approach?',
    options: [
      {
        id: 'A',
        text: 'Pass props through all screen components',
        correct: false,
        explanation: 'Prop drilling through 20+ screens is unmaintainable and error-prone.'
      },
      {
        id: 'B',
        text: 'Auth Context at app root with custom hook',
        correct: true,
        explanation: 'Context avoids prop drilling, custom hook (useAuth) provides clean API for any component to access auth state.'
      },
      {
        id: 'C',
        text: 'Global variable accessed directly',
        correct: false,
        explanation: 'Global variables don\'t trigger React re-renders and break component reactivity.'
      }
    ]
  },

  // PERFORMANCE & OPTIMIZATION (2 questions)
  {
    id: 'mobile_q_004',
    role: 'Mobile Engineer',
    category: 'Performance',
    difficulty: 'expert',
    order: 4,
    question: 'Your FlatList with 10,000 items is laggy. You already have keyExtractor. What\'s the NEXT optimization?',
    options: [
      {
        id: 'A',
        text: 'Add getItemLayout for fixed-height items',
        correct: true,
        explanation: 'getItemLayout skips expensive measurement calculations, dramatically improving scroll performance for fixed-height items.'
      },
      {
        id: 'B',
        text: 'Increase initialNumToRender to 100',
        correct: false,
        explanation: 'Rendering more items initially actually hurts performance by doing more work upfront.'
      },
      {
        id: 'C',
        text: 'Remove all React.memo() to reduce overhead',
        correct: false,
        explanation: 'React.memo() prevents re-renders, removing it would make performance worse.'
      }
    ]
  },

  {
    id: 'mobile_q_005',
    role: 'Mobile Engineer',
    category: 'Performance',
    difficulty: 'expert',
    order: 5,
    question: 'App crashes on Android with "Out of Memory". Images are the likely culprit. Best solution?',
    options: [
      {
        id: 'A',
        text: 'Load all images at full resolution, rely on device RAM',
        correct: false,
        explanation: 'This is exactly what causes the crash. Mobile devices have limited memory.'
      },
      {
        id: 'B',
        text: 'Use image caching library with automatic resizing',
        correct: true,
        explanation: 'Libraries like react-native-fast-image cache and resize images appropriately, preventing memory issues.'
      },
      {
        id: 'C',
        text: 'Convert all images to base64 strings',
        correct: false,
        explanation: 'Base64 actually increases memory usage by ~33% and makes the problem worse.'
      }
    ]
  },

  // MOBILE-SPECIFIC PATTERNS (2 questions)
  {
    id: 'mobile_q_006',
    role: 'Mobile Engineer',
    category: 'Mobile Patterns',
    difficulty: 'expert',
    order: 6,
    question: 'You need to store sensitive auth tokens that persist across app restarts. Which is secure?',
    options: [
      {
        id: 'A',
        text: 'AsyncStorage with plain text storage',
        correct: false,
        explanation: 'AsyncStorage is not encrypted and can be accessed by other apps on rooted/jailbroken devices.'
      },
      {
        id: 'B',
        text: 'react-native-keychain (iOS Keychain/Android Keystore)',
        correct: true,
        explanation: 'Platform-specific secure storage that encrypts data and is isolated from other apps.'
      },
      {
        id: 'C',
        text: 'Store in app state only, no persistence',
        correct: false,
        explanation: 'User would need to login on every app restart, terrible UX.'
      }
    ]
  },

  {
    id: 'mobile_q_007',
    role: 'Mobile Engineer',
    category: 'Mobile Patterns',
    difficulty: 'expert',
    order: 7,
    question: 'iOS app works perfectly, but Android shows blank screens randomly. Most likely cause?',
    options: [
      {
        id: 'A',
        text: 'Android doesn\'t support React Native properly',
        correct: false,
        explanation: 'React Native supports Android fully. The issue is platform-specific code.'
      },
      {
        id: 'B',
        text: 'Missing Android-specific permissions in AndroidManifest',
        correct: true,
        explanation: 'Android requires explicit permission declarations. iOS and Android have different permission systems.'
      },
      {
        id: 'C',
        text: 'Need to rebuild the app from scratch for Android',
        correct: false,
        explanation: 'React Native shares code across platforms. Usually just configuration or permission issues.'
      }
    ]
  },

  // BEST PRACTICES (2 questions)
  {
    id: 'mobile_q_008',
    role: 'Mobile Engineer',
    category: 'Best Practices',
    difficulty: 'expert',
    order: 8,
    question: 'API call fails with network error. User sees blank screen. What should you implement?',
    options: [
      {
        id: 'A',
        text: 'Show error message and retry button with offline detection',
        correct: true,
        explanation: 'Proper error handling: show what happened, give user action (retry), detect network state for better UX.'
      },
      {
        id: 'B',
        text: 'Console.log the error and show nothing to user',
        correct: false,
        explanation: 'Users can\'t see console logs. Blank screen with no feedback is terrible UX.'
      },
      {
        id: 'C',
        text: 'Automatically retry infinitely until it works',
        correct: false,
        explanation: 'Infinite retries drain battery and data. User has no control or feedback.'
      }
    ]
  },

  {
    id: 'mobile_q_009',
    role: 'Mobile Engineer',
    category: 'Best Practices',
    difficulty: 'expert',
    order: 9,
    question: 'Before releasing to App Store/Play Store, which is MOST critical to test?',
    options: [
      {
        id: 'A',
        text: 'App works on the latest flagship devices only',
        correct: false,
        explanation: 'Many users have older devices. Testing only on latest excludes a large user base.'
      },
      {
        id: 'B',
        text: 'App works on range of devices, OS versions, and network conditions',
        correct: true,
        explanation: 'Production apps must work across device diversity, OS versions, and varying network quality.'
      },
      {
        id: 'C',
        text: 'All features look perfect on iOS simulator',
        correct: false,
        explanation: 'Simulator doesn\'t test real device performance, memory constraints, or actual network conditions.'
      }
    ]
  },

  // REAL-WORLD SCENARIO (1 question)
  {
    id: 'mobile_q_010',
    role: 'Mobile Engineer',
    category: 'Real-World',
    difficulty: 'expert',
    order: 10,
    question: 'Users report app crashes only on Android 11, but works on Android 12+. How do you debug?',
    options: [
      {
        id: 'A',
        text: 'Tell users to upgrade to Android 12',
        correct: false,
        explanation: 'Ignoring a user segment is bad practice. Many can\'t upgrade devices.'
      },
      {
        id: 'B',
        text: 'Test on Android 11 emulator/device, check crash logs, identify API incompatibility',
        correct: true,
        explanation: 'Systematic debugging: reproduce issue, check logs (Crashlytics/Sentry), find version-specific API differences.'
      },
      {
        id: 'C',
        text: 'Remove all Android-specific code and use iOS codebase',
        correct: false,
        explanation: 'iOS and Android have different APIs and behaviors. Can\'t just use iOS code on Android.'
      }
    ]
  }
];

async function seedTestQuestions() {
  try {
    console.log('🌱 Seeding test questions to Firestore...');
    
    const batch = db.batch();
    
    for (const question of mobileEngineerQuestions) {
      const docRef = db.collection('test_questions').doc(question.id);
      batch.set(docRef, {
        ...question,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${mobileEngineerQuestions.length} test questions!`);
    console.log('Categories:');
    console.log('  - Architecture: 3 questions');
    console.log('  - Performance: 2 questions');
    console.log('  - Mobile Patterns: 2 questions');
    console.log('  - Best Practices: 2 questions');
    console.log('  - Real-World: 1 question');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test questions:', error);
    process.exit(1);
  }
}

seedTestQuestions();