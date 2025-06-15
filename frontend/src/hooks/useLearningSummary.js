// src/hooks/useLearningSummary.js - Custom hook for managing learning summary

import { useState, useEffect, useCallback } from 'react';
import aiService from '../services/aiService';
import { useApiKey } from './useApiKey';

export const useLearningSummary = (userLearningData) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { apiKey } = useApiKey();

  // Function to aggregate learning data
  const aggregateUserData = useCallback((rawData) => {
    // Assuming rawData comes from your backend/storage
    // Adjust this based on your actual data structure
    return {
      completedSessions: rawData.sessions?.length || 0,
      totalQuestions: rawData.questions?.length || 0,
      correctAnswers: rawData.questions?.filter(q => q.correct).length || 0,
      topicsStudied: [...new Set(rawData.questions?.map(q => q.topic) || [])],
      recentTopics: rawData.recentTopics || [],
      strengths: rawData.strengths || [],
      weaknesses: rawData.weaknesses || [],
      timeSpent: rawData.totalTimeMinutes || 0,
      streak: rawData.currentStreak || 0
    };
  }, []);

  // Function to generate learning summary
  const generateSummary = useCallback(async () => {
    if (!userLearningData || !apiKey) return;

    setIsLoading(true);
    setError(null);

    try {
      aiService.setApiKey(apiKey);
      const aggregatedData = aggregateUserData(userLearningData);
      
      // Only generate summary if there's meaningful data
      if (aggregatedData.totalQuestions === 0) {
        setSummary('Welcome to your learning journey! Start answering questions to see your personalized progress summary here.');
        setLastUpdated(new Date());
        return;
      }

      const response = await aiService.generateLearningSummary(aggregatedData);
      setSummary(response.summary || response.message || 'Unable to generate summary at this time.');
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error generating learning summary:', err);
      setError(err.message);
      setSummary('Unable to generate your learning summary right now. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [userLearningData, apiKey, aggregateUserData]);

  // Auto-generate summary when data changes
  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  // Function to manually refresh summary
  const refreshSummary = useCallback(() => {
    generateSummary();
  }, [generateSummary]);

  return {
    summary,
    isLoading,
    error,
    lastUpdated,
    refreshSummary,
    hasData: userLearningData && aggregateUserData(userLearningData).totalQuestions > 0
  };
};