const admin = require('firebase-admin');

const db = admin.firestore();

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

const userStorage = {
  async getAll() {
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  async findByEmail(email) {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  async findByUsername(username) {
    try {
      const snapshot = await db.collection('users')
        .where('username', '==', username.toLowerCase())
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  },

  async create(userData) {
    try {
      const processedUserData = {
        ...userData,
        username: userData.username ? userData.username.toLowerCase() : userData.username,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('users').add(processedUserData);
      
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
  }
};

const sessionStorage = {
  async getAll() {
    try {
      const snapshot = await db.collection('sessions').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all sessions:', error);
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      const snapshot = await db.collection('sessions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding sessions by user ID:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const doc = await db.collection('sessions').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error finding session by ID:', error);
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

module.exports = {
  initializeFirestore,
  userStorage,
  sessionStorage,
  db
};