// Firebase configuration and services for MindMelt
import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('🔥 Firebase Client SDK initialized successfully');
  console.log(`📊 Connected to project: ${firebaseConfig.projectId}`);
} catch (error) {
  console.error('❌ Firebase Client SDK initialization failed:', error);
  
  // Don't fail completely - show error but continue
  if (process.env.NODE_ENV === 'development') {
    console.error('🔧 Please check your Firebase configuration in .env file');
    console.error('📋 Required variables:');
    console.error('  - REACT_APP_FIREBASE_API_KEY');
    console.error('  - REACT_APP_FIREBASE_AUTH_DOMAIN');
    console.error('  - REACT_APP_FIREBASE_PROJECT_ID');
    console.error('  - REACT_APP_FIREBASE_STORAGE_BUCKET');
    console.error('  - REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
    console.error('  - REACT_APP_FIREBASE_APP_ID');
  }
}

// Export Firebase services
export { 
  app, 
  auth, 
  db,
  // Auth functions
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  // Firestore functions
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch
};

// Default export
export default {
  app,
  auth,
  db
};
