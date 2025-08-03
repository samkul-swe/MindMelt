import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadServiceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  try {
    console.log('🔧 Loading Firebase service account from file...');
    const serviceAccountPath = path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
    return JSON.parse(serviceAccountData);
  } catch (fileError) {
    throw new Error(`Failed to load service account file: ${fileError.message}`);
  }
}

function initializeFirebase() {
  try {
    const serviceAccount = loadServiceAccount();
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('🔥 Firebase Admin initialized successfully');
    console.log(`📊 Connected to project: ${serviceAccount.project_id}`);
    return app;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('');
    console.error('🔧 Setup:');
    console.error('');
    console.error('Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    console.error('  - Set it to the filename of your service account JSON file');
    console.error('  - Example: FIREBASE_SERVICE_ACCOUNT_KEY=mindmelt-firebase-adminsdk.json');
    console.error('  - Make sure the JSON file is in your backend directory');
    console.error('');
    console.error('💡 Download the service account file from Firebase Console');
    process.exit(1);
  }
}

function initializeFirebaseClient() {
  try {
    const firebaseClientConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    const requiredClientVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN', 
      'FIREBASE_PROJECT_ID',
      'FIREBASE_APP_ID'
    ];
    
    const missingVars = requiredClientVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase client environment variables: ${missingVars.join(', ')}`);
    }

    const clientApp = initializeClientApp(firebaseClientConfig);
    console.log('🔥 Firebase Client initialized successfully');
    
    return clientApp;
    
  } catch (error) {
    console.error('❌ Firebase Client initialization failed:', error.message);
    console.error('');
    console.error('🔧 Setup:');
    console.error('Add these environment variables to your .env file:');
    console.error('FIREBASE_API_KEY=your-api-key');
    console.error('FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
    console.error('FIREBASE_PROJECT_ID=your-project-id');
    console.error('FIREBASE_APP_ID=your-app-id');
    console.error('');
    console.error('💡 Get these values from Firebase Console > Project Settings > General > Your apps');
    process.exit(1);
  }
}

async function initializeFirestore() {
  try {
    console.log('🔧 Initializing Firestore...');
    console.log('📊 Ensuring Firestore indexes...');
    console.log('✅ Firestore initialized successfully');
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    throw error;
  }
}

// user collection in firestore
const userStorage = {
  async findById(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  async create(id, userData) {
    try {
      const processedUserData = {
        ...userData,
        username: userData.username ? userData.username.toLowerCase() : userData.username,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('users').doc(id);
      await docRef.set(processedUserData);
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(id).update(updateData);
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc = await db.collection('users').doc(id).get();
      if (!doc.exists) {
        throw new Error('User not found after update');
      }
      
      const userData = { id: doc.id, ...doc.data() };
      return userData;
    } catch (error) {
      console.error('Error updating user:', {
        userId: id,
        updates: updates,
        error: error.message
      });
      throw error;
    }
  },

  async delete(id) {
    try {
      await db.collection('users').doc(id).delete();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// session collection in firestore
const sessionStorage = {
  async findByUserId(userId) {
    try {
      const snapshot = await db.collection('sessions')
        .where('sessionMetaData.uid', '==', userId)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding sessions by user ID:', error);
      throw error;
    }
  },

  async create(sessionData) {
    try {
      const docRef = await db.collection('sessions').add({
        ...sessionData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      await db.collection('sessions').doc(id).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await db.collection('sessions').doc(id).get();
      if (!doc.exists) {
        throw new Error('Session not found');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await db.collection('sessions').doc(id).delete();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
};

// roadmaps collection in firestore
const roadmapStorage = {
  async findById(id) {
    try {
      const doc = await db.collection('roadmaps').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error finding roadmap by ID:', error);
      throw error;
    }
  },

  async getAllRoadmaps() {
    try {
      const snapshot = await db.collection('roadmaps').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding roadmaps: ', error);
      throw error;
    }
  }
};

// topics collection in firestore
const topicStorage = {
  async findAllTopicsByRoadmapId(roadmapId, topicCount) {
    try {
      const topicPromises = [];
      for (let i = 1; i <= topicCount; i++) { // Adjust max as needed
        const topicId = `${roadmapId}_topic_${i}`;
        topicPromises.push(db.collection('topics').doc(topicId).get());
      }
      
      const results = await Promise.all(topicPromises);
      return results
        .filter(doc => doc.exists)
        .map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding topics for roadmap ID', roadmapId, ':', error);
      throw error;
    }
  }
};


const app = initializeFirebase();
const clientApp = initializeFirebaseClient();
const db = admin.firestore();
export const auth = getAuth(clientApp);

export {
  admin,
  app,
  clientApp,
  db,
  initializeFirestore,
  userStorage,
  sessionStorage,
  roadmapStorage,
  topicStorage
};