import db from '../config/firebase.js';

/**
 * Firestore Helper Functions
 * Reusable database operations with error handling
 */

// Get a single document
export const getDoc = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error(`Error getting doc from ${collection}:`, error);
    throw error;
  }
};

// Create a new document
export const createDoc = async (collection, data) => {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error creating doc in ${collection}:`, error);
    throw error;
  }
};

// Update a document
export const updateDoc = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: new Date()
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating doc in ${collection}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDoc = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
    return { id: docId, deleted: true };
  } catch (error) {
    console.error(`Error deleting doc from ${collection}:`, error);
    throw error;
  }
};

// Query documents with conditions
export const queryDocs = async (collection, conditions = []) => {
  try {
    let query = db.collection(collection);
    
    conditions.forEach(({ field, op, value }) => {
      query = query.where(field, op, value);
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    throw error;
  }
};

// Get all documents in a collection (use sparingly!)
export const getAllDocs = async (collection, limit = 100) => {
  try {
    const snapshot = await db.collection(collection).limit(limit).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting all docs from ${collection}:`, error);
    throw error;
  }
};

// Batch operations
export const batchWrite = async (operations) => {
  try {
    const batch = db.batch();
    
    operations.forEach(({ type, collection, docId, data }) => {
      const docRef = docId 
        ? db.collection(collection).doc(docId)
        : db.collection(collection).doc();

      if (type === 'set') {
        batch.set(docRef, { ...data, createdAt: new Date(), updatedAt: new Date() });
      } else if (type === 'update') {
        batch.update(docRef, { ...data, updatedAt: new Date() });
      } else if (type === 'delete') {
        batch.delete(docRef);
      }
    });

    await batch.commit();
    return { success: true, operations: operations.length };
  } catch (error) {
    console.error('Error in batch write:', error);
    throw error;
  }
};

// Check if document exists
export const docExists = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists;
  } catch (error) {
    console.error(`Error checking if doc exists in ${collection}:`, error);
    throw error;
  }
};

// Find one document by field
export const findOne = async (collection, field, value) => {
  try {
    const snapshot = await db.collection(collection)
      .where(field, '==', value)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(`Error finding doc in ${collection}:`, error);
    throw error;
  }
};

export default db;