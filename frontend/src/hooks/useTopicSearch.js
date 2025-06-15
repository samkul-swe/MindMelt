import { useState, useCallback } from 'react';
import { searchCSTopics } from '../services/aiService';

export const useTopicSearch = (apiKeyManager) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    setShowSuggestions(false);

    try {
      const apiKey = apiKeyManager?.getCurrentApiKey();
      
      if (!apiKey) {
        throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to search for topics!');
      }

      console.log('🔍 Manual AI Search for:', searchQuery.trim());
      
      const results = await searchCSTopics(searchQuery.trim(), apiKey);
      
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowSuggestions(true);
        setSearchError('');
        console.log(`✅ Found ${results.length} topics for "${searchQuery.trim()}"`);
      } else {
        setSearchResults([]);
        setSearchError(`No CS topics found for "${searchQuery.trim()}". Try terms like: React, Python, Machine Learning, etc.`);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
      setSearchError(error.message || 'Search failed. Please try again.');
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, apiKeyManager]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setHasSearched(false);
    setSearchError('');
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    searchError,
    hasSearched,
    performSearch,
    clearSearch,
    hideSuggestions
  };
};