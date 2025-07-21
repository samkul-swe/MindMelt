require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

let app;

try {
  const serviceAccountPath = path.join(__dirname, '..', 'mindmelt-cf760-firebase-adminsdk-fbsvc-967d6327f6.json');
  
  try {
    console.log('🔧 Loading Firebase service account from file...');
    const serviceAccount = require(serviceAccountPath);
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('🔥 Firebase Admin initialized successfully (Firestore only)');
    console.log(`📊 Connected to project: ${serviceAccount.project_id}`);
    
  } catch (fileError) {
    console.log('📝 Service account file not found, trying environment variable...');
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error('Neither service account file nor FIREBASE_SERVICE_ACCOUNT_KEY found');
    }
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (parseError) {
      throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`);
    }
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('🔥 Firebase Admin initialized from environment variable');
    console.log(`📊 Connected to project: ${serviceAccount.project_id}`);
  }
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.error('');
  console.error('🔧 Setup options:');
  console.error('');
  console.error('Option 1 (Recommended): Use service account JSON file');
  console.error('  - Keep your existing mindmelt-cf760-firebase-adminsdk-fbsvc-967d6327f6.json file');
  console.error('  - Make sure it\'s in the backend directory');
  console.error('');
  console.error('Option 2: Use environment variable');
  console.error('  - Add FIREBASE_SERVICE_ACCOUNT_KEY to .env file');
  console.error('  - Format as single-line JSON with escaped newlines');
  console.error('');
  console.error('💡 The JSON file method is more reliable for development');
  process.exit(1);
}

module.exports = app;