import jwt from 'jsonwebtoken';
import { admin, userStorage, sessionStorage } from '../config/firebase.js';

class AuthService {
  async createCustomToken(user) {
    const payload = {
      uid: user.uid || user.id,
      email: user.email,
      username: user.username
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    let jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    let uid = user.uid;
    const userSessionData = {
      uid,
      jwtToken,
      expiresAt
    }
    let sessionDoc = await sessionStorage.create(userSessionData);
    return sessionDoc.jwtToken;
  }

  async getUserToken(user) {
    let token = await sessionStorage.findByUserId(user.uid);
    const expirationDate = token.expiresAt.toDate();
    const now = new Date();
    const isExpired = now > expirationDate;

    if (isExpired) {
      console.log("Token is expired");
      await sessionStorage.delete(token.sessionId);
      await this.createCustomToken(user);
      return;
    }
    console.log("Token is still valid");
    return token.jwtToken;
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
        
        user = await userStorage.create(uid, userData);
        user.uid = uid;
      } else {
        user.uid = uid;
      }
      
      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async createUser(uid, email, username) {
    try {
      const userData = {
        email,
        username: username || email.split('@')[0],
        currentProgress: {}
      };

      const user = await userStorage.create(uid, userData);

      return {
        uid: uid,
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

export default new AuthService();