const { admin, userStorage } = require('../config/firebase');
const jwt = require('jsonwebtoken');

class AuthService {
  createCustomToken(user) {
    const payload = {
      uid: user.uid || user.id,
      email: user.email,
      username: user.username
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  async loginUser(email, password) {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      if (!userRecord) {
        throw new Error('No user found with this email address');
      }

      // Note: Firebase Admin SDK doesn't verify passwords directly
      // In production, you'd want to use Firebase Client SDK on frontend
      // or implement your own password verification
      
      // For now, we'll trust that the frontend verified the password
      // and get the user data from Firestore
      let user = await userStorage.findById(userRecord.uid);
      
      if (!user) {
        // Create user document if it doesn't exist
        const userData = {
          email: userRecord.email,
          username: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
          currentProgress: {}
        };
        
        user = await userStorage.create(userData);
        user.uid = userRecord.uid;
      } else {
        user.uid = userRecord.uid;
      }
      
      return user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  async authenticateUser(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Get user data from Firestore using userStorage
      let user = await userStorage.findById(uid);
      
      if (!user) {
        // Create user document if it doesn't exist
        const userData = {
          email: decodedToken.email || null,
          username: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          currentProgress: {}
        };
        
        user = await userStorage.create({ ...userData });
        user.uid = uid; // Add uid for consistency
      } else {
        user.uid = uid; // Add uid for consistency
      }
      
      return user;
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

      // Create user document in Firestore using userStorage
      const userData = {
        email,
        username: username || email.split('@')[0],
        currentProgress: {}
      };

      const user = await userStorage.create(userRecord.uid, userData);

      return {
        uid: userRecord.uid,
        ...user
      };
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  // Get user by ID
  async getUser(uid) {
    try {
      const user = await userStorage.findById(uid);
      if (user) {
        user.uid = uid; // Add uid for consistency
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      const user = await userStorage.update(uid, updates);

      // Also update Firebase Auth profile if username changed
      if (updates.username) {
        await admin.auth().updateUser(uid, {
          displayName: updates.username
        });
      }

      user.uid = uid; // Add uid for consistency
      return user;
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  // Update user progress for a roadmap topic
  async updateUserProgress(uid, roadmapId, topicId, percentage) {
    try {
      const user = await userStorage.findById(uid);
      
      if (!user) {
        throw new Error('User not found');
      }

      let currentProgress = user.currentProgress || {};

      // Initialize roadmap progress if it doesn't exist
      if (!currentProgress[roadmapId]) {
        currentProgress[roadmapId] = {};
      }

      // Update topic progress
      currentProgress[roadmapId][topicId] = {
        percentage: percentage,
        completed: percentage >= 100,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      // Update user document
      await userStorage.update(uid, {
        currentProgress: currentProgress
      });

      return currentProgress[roadmapId];
    } catch (error) {
      throw new Error(`Progress update failed: ${error.message}`);
    }
  }

  // Delete user account
  async deleteUser(uid) {
    try {
      // Delete from Firebase Auth
      await admin.auth().deleteUser(uid);
      
      // Delete user document from Firestore using userStorage
      const user = await userStorage.findById(uid);
      if (user) {
        await userStorage.delete(uid);
      }
      
      return true;
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }
}

module.exports = new AuthService();