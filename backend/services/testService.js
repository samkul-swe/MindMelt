import { createDoc, updateDoc, findOne } from '../utils/firestore.js';
import db from '../config/firebase.js';

/**
 * Test Service - Handles MCQ skill validation tests
 */

class TestService {
  /**
   * Get test questions for a role
   */
  async getTestQuestions(role) {
    try {
      const snapshot = await db.collection('test_questions')
        .where('role', '==', role)
        .get();

      const questions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);

      // Don't send correct answers to frontend
      return questions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text
          // Don't send 'correct' or 'explanation' yet
        })),
        order: q.order
      }));
    } catch (error) {
      console.error('Error fetching test questions:', error);
      throw error;
    }
  }

  /**
   * Start a test session
   */
  async startTest(userId, targetRole) {
    try {
      const testSession = {
        userId,
        targetRole,
        status: 'in_progress',
        answers: [],
        startedAt: new Date()
      };

      const doc = await createDoc('skill_tests', testSession);
      
      console.log(`✅ Test session started: ${doc.id}`);
      
      return doc;
    } catch (error) {
      console.error('Error starting test:', error);
      throw error;
    }
  }

  /**
   * Submit test answers and calculate score
   */
  async submitTest(testId, answers) {
    try {
      console.log(`📝 Grading test ${testId}...`);

      // Get all questions with correct answers
      const questionsSnapshot = await db.collection('test_questions')
        .where('id', 'in', answers.map(a => a.questionId))
        .get();

      const questionsMap = {};
      questionsSnapshot.docs.forEach(doc => {
        questionsMap[doc.id] = doc.data();
      });

      // Grade each answer
      const gradedAnswers = answers.map(answer => {
        const question = questionsMap[answer.questionId];
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOption);
        const correctOption = question.options.find(opt => opt.correct);

        return {
          questionId: answer.questionId,
          category: question.category,
          selectedOption: answer.selectedOption,
          correct: selectedOption?.correct || false,
          explanation: selectedOption?.explanation || '',
          correctAnswer: correctOption?.id
        };
      });

      // Calculate scores
      const totalQuestions = gradedAnswers.length;
      const correctCount = gradedAnswers.filter(a => a.correct).length;
      const percentage = Math.round((correctCount / totalQuestions) * 100);

      // Calculate category scores
      const categoryScores = {};
      gradedAnswers.forEach(answer => {
        if (!categoryScores[answer.category]) {
          categoryScores[answer.category] = { correct: 0, total: 0 };
        }
        categoryScores[answer.category].total++;
        if (answer.correct) {
          categoryScores[answer.category].correct++;
        }
      });

      // Calculate percentages for each category
      Object.keys(categoryScores).forEach(category => {
        const { correct, total } = categoryScores[category];
        categoryScores[category].percentage = Math.round((correct / total) * 100);
      });

      // Identify strengths and weak areas
      const strengths = Object.keys(categoryScores)
        .filter(cat => categoryScores[cat].percentage >= 80)
        .sort((a, b) => categoryScores[b].percentage - categoryScores[a].percentage);

      const weakAreas = Object.keys(categoryScores)
        .filter(cat => categoryScores[cat].percentage < 70)
        .sort((a, b) => categoryScores[a].percentage - categoryScores[b].percentage);

      // Generate recommendations
      const recommendations = this.generateRecommendations(weakAreas, categoryScores);

      // Update test session
      const results = {
        answers: gradedAnswers,
        score: correctCount,
        totalQuestions,
        percentage,
        categoryScores,
        strengths,
        weakAreas,
        recommendations,
        status: 'completed',
        completedAt: new Date()
      };

      await updateDoc('skill_tests', testId, results);

      console.log(`✅ Test graded: ${correctCount}/${totalQuestions} (${percentage}%)`);

      return results;
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on weak areas
   */
  generateRecommendations(weakAreas, categoryScores) {
    const recommendations = [];

    weakAreas.forEach(area => {
      const score = categoryScores[area].percentage;
      
      if (area === 'Architecture') {
        recommendations.push('Focus on component design patterns and state management architecture');
      } else if (area === 'Performance') {
        recommendations.push('Study mobile performance optimization techniques and profiling tools');
      } else if (area === 'Mobile Patterns') {
        recommendations.push('Learn platform-specific APIs and mobile-first design patterns');
      } else if (area === 'Best Practices') {
        recommendations.push('Review error handling, testing strategies, and code organization');
      } else if (area === 'Real-World') {
        recommendations.push('Practice debugging production issues and deployment workflows');
      }
    });

    return recommendations;
  }

  /**
   * Get test results
   */
  async getTestResults(testId) {
    try {
      const test = await findOne('skill_tests', 'id', testId);
      return test;
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  }

  /**
   * Get user's test for a role
   */
  async getUserTest(userId, targetRole) {
    try {
      const snapshot = await db.collection('skill_tests')
        .where('userId', '==', userId)
        .where('targetRole', '==', targetRole)
        .where('status', '==', 'completed')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching user test:', error);
      throw error;
    }
  }
}

export default new TestService();