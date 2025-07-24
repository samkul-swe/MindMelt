require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

let app;

try {
  // Try to initialize using service account file first (recommended for development)
  const serviceAccountPath = path.join(__dirname, '..', 'mindmelt-cf760-firebase-adminsdk-fbsvc-967d6327f6.json');
  
  try {
    console.log('🔧 Loading Firebase service account from file...');
    const serviceAccount = require(serviceAccountPath);
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('🔥 Firebase Admin initialized successfully with service account file');
    console.log(`📊 Connected to project: ${serviceAccount.project_id}`);
    
  } catch (fileError) {
    console.log('📝 Service account file not found, trying environment variables...');
    
    // Fallback to environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      try {
        // Check if it's a file path or JSON string
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.startsWith('{')) {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } else {
          serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        }
      } catch (parseError) {
        throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`);
      }
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('🔥 Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_KEY');
      console.log(`📊 Connected to project: ${serviceAccount.project_id}`);
      
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use individual environment variables
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('🔥 Firebase Admin initialized from individual environment variables');
      console.log(`📊 Connected to project: ${process.env.FIREBASE_PROJECT_ID}`);
      
    } else {
      throw new Error('No Firebase credentials found in environment variables');
    }
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
  console.error('Option 2: Use FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
  console.error('  - Set FIREBASE_SERVICE_ACCOUNT_KEY to the path of your JSON file');
  console.error('  - Or set it to the JSON content as a string');
  console.error('');
  console.error('Option 3: Use individual environment variables');
  console.error('  - Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, etc.');
  console.error('  - Check .env.example for all required variables');
  console.error('');
  console.error('💡 The JSON file method is most reliable for development');
  process.exit(1);
}

// Get Firestore instance
const db = admin.firestore();

// Export Firebase Admin app and Firestore database
module.exports = {
  admin,
  app,
  db
};
