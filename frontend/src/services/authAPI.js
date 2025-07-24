import { 
  auth, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  increment
} from './firebase/firebaseService';

class AuthAPI {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.authStateChangeListeners = [];
  }

  // Listen to authentication state changes
  onAuthStateChange(callback) {
    this.authStateChangeListeners.push(callback);
    
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            this.currentUser = {
              id: user.uid,
              email: user.email,
              isAnonymous: user.isAnonymous,
              ...userDoc.data()
            };
          } else {
            // If user document doesn't exist, create it
            await this.createUserDocument(user);
          }
          this.isAuthenticated = true;
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.currentUser = {
            id: user.uid,
            email: user.email,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            isAnonymous: user.isAnonymous
          };
          this.isAuthenticated = true;
        }
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
      }
      
      // Notify all listeners
      this.authStateChangeListeners.forEach(listener => listener(this.currentUser));
      callback(this.currentUser);
    });
  }

  // Create user document in Firestore
  async createUserDocument(user, additionalData = {}) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { username, email } = additionalData;
      
      try {
        const userData = {
          username: username || user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          isAnonymous: user.isAnonymous || false,
          joinedAt: serverTimestamp(),
          currentProgress: {}, // Will store course progress
          totalLearningTime: 0,
          completedSessions: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userRef, userData);
        
        this.currentUser = {
          id: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
          ...userData
        };

        console.log('✅ User document created successfully');
        return this.currentUser;
      } catch (error) {
        console.error('❌ Error creating user document:', error);
        throw error;
      }
    }
  }

  // Sign up with email and password
  async signUp(email, password, username = null) {
    try {
      // Check if username is already taken
      if (username) {
        const isUsernameTaken = await this.checkUsernameExists(username);
        if (isUsernameTaken) {
          throw new Error('Username is already taken');
        }
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if username provided
      if (username) {
        await updateProfile(user, { displayName: username });
      }

      // Create user document
      await this.createUserDocument(user, { username, email });
      
      return this.currentUser;
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        this.currentUser = {
          id: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
          ...userDoc.data()
        };
      }
      
      return this.currentUser;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  }

  // Sign in anonymously
  async signInAnonymously() {
    try {
      const { user } = await signInAnonymously(auth);
      
      // Create anonymous user document
      await this.createUserDocument(user, {
        username: 'Anonymous Learner',
        email: null
      });
      
      return this.currentUser;
    } catch (error) {
      console.error('❌ Anonymous sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.isAuthenticated = false;
      return true;
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Check if username exists
  async checkUsernameExists(username) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Error checking username:', error);
      return false;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userRef = doc(db, 'users', this.currentUser.id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      // Update Firebase Auth profile if username changed
      if (updates.username) {
        await updateProfile(auth.currentUser, {
          displayName: updates.username
        });
      }
      
      // Update local user data
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };

      return this.currentUser;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // Update user progress for a specific course and topic
  async updateUserProgress(courseId, topicId, percentage) {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userRef = doc(db, 'users', this.currentUser.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentProgress = userData.currentProgress || {};
        
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
          lastUpdated: serverTimestamp()
        };

        // Calculate overall course progress
        const topics = currentProgress[courseId].topics;
        const topicKeys = Object.keys(topics);
        const totalPercentage = topicKeys.reduce((sum, key) => sum + topics[key].percentage, 0);
        currentProgress[courseId].percentage = topicKeys.length > 0 ? Math.round(totalPercentage / topicKeys.length) : 0;

        // Update in Firestore
        await updateDoc(userRef, {
          currentProgress: currentProgress,
          updatedAt: serverTimestamp()
        });

        // Update local user data
        this.currentUser.currentProgress = currentProgress;
        
        return currentProgress;
      }
    } catch (error) {
      console.error('❌ Error updating user progress:', error);
      throw error;
    }
  }

  // Get user progress for a specific course
  getUserProgress(courseId) {
    if (!this.currentUser || !this.currentUser.currentProgress) {
      return null;
    }
    
    return this.currentUser.currentProgress[courseId] || null;
  }

  // Get all courses progress
  getAllProgress() {
    if (!this.currentUser) {
      return {};
    }
    
    return this.currentUser.currentProgress || {};
  }

  // Record learning session completion
  async recordLearningSession(sessionData) {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userRef = doc(db, 'users', this.currentUser.id);
      
      // Update user statistics
      await updateDoc(userRef, {
        totalLearningTime: increment(sessionData.duration || 0),
        completedSessions: increment(1),
        lastActiveAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update progress if course and topic provided
      if (sessionData.courseId && sessionData.topicId && sessionData.progress !== undefined) {
        await this.updateUserProgress(sessionData.courseId, sessionData.topicId, sessionData.progress);
      }

      // Create session record if requested
      if (sessionData.createRecord) {
        await addDoc(collection(db, 'sessions'), {
          userId: this.currentUser.id,
          ...sessionData,
          createdAt: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error recording learning session:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Legacy methods for backward compatibility
  async getLearningHistory() {
    if (!this.currentUser) return [];
    
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef, 
        where('userId', '==', this.currentUser.id),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      
      return sessions;
    } catch (error) {
      console.error('❌ Error fetching learning history:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const api = new AuthAPI();
export { api };
