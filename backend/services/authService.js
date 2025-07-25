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

  async authenticateUser(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      let user = await userStorage.findById(uid);
      
      if (!user) {
        const userData = {
          email: decodedToken.email || null,
          username: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          currentProgress: {}
        };
        
        user = await userStorage.create({ ...userData });
        user.uid = uid;
      } else {
        user.uid = uid;
      }
      
      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async createUser(email, password, username) {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: username
      });

      const userData = {
        email,
        username: username || email.split('@')[0],
        currentProgress: {}
      };

      const user = await userStorage.create(userData);

      return {
        uid: userRecord.uid,
        ...user
      };
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  async getUser(uid) {
    try {
      const user = await userStorage.findById(uid);
      if (user) {
        user.uid = uid;
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async updateUserProfile(uid, updates) {
    try {
      const user = await userStorage.update(uid, updates);

      if (updates.username) {
        await admin.auth().updateUser(uid, {
          displayName: updates.username
        });
      }

      user.uid = uid;
      return user;
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  async updateUserProgress(uid, roadmapId, topicId, percentage) {
    try {
      const user = await userStorage.findById(uid);
      
      if (!user) {
        throw new Error('User not found');
      }

      let currentProgress = user.currentProgress || {};

      if (!currentProgress[roadmapId]) {
        currentProgress[roadmapId] = {};
      }

      currentProgress[roadmapId][topicId] = {
        percentage: percentage,
        completed: percentage >= 100,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      await userStorage.update(uid, {
        currentProgress: currentProgress
      });

      return currentProgress[roadmapId];
    } catch (error) {
      throw new Error(`Progress update failed: ${error.message}`);
    }
  }

  async deleteUser(uid) {
    try {
      await admin.auth().deleteUser(uid);

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