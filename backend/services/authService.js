const { admin, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');

class AuthService {
  // Create a custom JWT token for the user
  createCustomToken(user) {
    const payload = {
      uid: user.uid,
      email: user.email,
      username: user.username
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // Verify Firebase ID token and create user session
  async authenticateUser(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid,
          email: decodedToken.email,
          ...userData
        };
      } else {
        // Create user document if it doesn't exist
        const newUser = {
          email: decodedToken.email || null,
          username: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          currentProgress: {},
          totalLearningTime: 0,
          completedSessions: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(uid).set(newUser);
        
        return {
          uid,
          email: decodedToken.email,
          ...newUser
        };
      }
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Create user with email and password
  async createUser(email, password, username) {
    try {
      // Create Firebase user
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: username
      });

      // Create user document in Firestore
      const userData = {
        email,
        username: username || email.split('@')[0],
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        currentProgress: {},
        totalLearningTime: 0,
        completedSessions: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        ...userData
      };
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      const userRef = db.collection('users').doc(uid);
      const updateData = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.update(updateData);

      // Also update Firebase Auth profile if username changed
      if (updates.username) {
        await admin.auth().updateUser(uid, {
          displayName: updates.username
        });
      }

      const userDoc = await userRef.get();
      return { uid, ...userDoc.data() };
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  // Get user by ID
  async getUser(uid) {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user progress
  async updateUserProgress(uid, courseId, topicId, percentage) {
    try {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      let currentProgress = {};
      if (userDoc.exists()) {
        currentProgress = userDoc.data().currentProgress || {};
      }

      // Initialize course progress if it doesn't exist
      if (!currentProgress[courseId]) {
        currentProgress[courseId] = {
          percentage: 0,
          topics: {}
        };
      }

      // Update topic progress
      currentProgress[courseId].topics[topicId] = {
        percentage: percentage,
        completed: percentage >= 100,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      // Calculate overall course progress
      const topics = currentProgress[courseId].topics;
      const topicKeys = Object.keys(topics);
      const totalPercentage = topicKeys.reduce((sum, key) => sum + topics[key].percentage, 0);
      currentProgress[courseId].percentage = topicKeys.length > 0 ? Math.round(totalPercentage / topicKeys.length) : 0;

      // Update user document
      await userRef.update({
        currentProgress: currentProgress,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return currentProgress[courseId];
    } catch (error) {
      throw new Error(`Progress update failed: ${error.message}`);
    }
  }

  // Record learning session
  async recordLearningSession(uid, sessionData) {
    try {
      const userRef = db.collection('users').doc(uid);
      
      // Update user statistics
      await userRef.update({
        totalLearningTime: admin.firestore.FieldValue.increment(sessionData.duration || 0),
        completedSessions: admin.firestore.FieldValue.increment(1),
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update progress if course and topic provided
      if (sessionData.courseId && sessionData.topicId && sessionData.progress !== undefined) {
        await this.updateUserProgress(uid, sessionData.courseId, sessionData.topicId, sessionData.progress);
      }

      // Optionally create a session record
      if (sessionData.createRecord) {
        await db.collection('sessions').add({
          userId: uid,
          ...sessionData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      throw new Error(`Session recording failed: ${error.message}`);
    }
  }

  // Delete user account
  async deleteUser(uid) {
    try {
      // Delete from Firebase Auth
      await admin.auth().deleteUser(uid);
      
      // Delete user document from Firestore
      await db.collection('users').doc(uid).delete();
      
      return true;
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
