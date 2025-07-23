import { useState, useCallback } from 'react';
import { searchCSTopicsLocally, getSuggestedTopics } from '../data/csTopicsDatabase';

export const useTopicSearch = () => {
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
      console.log('🔍 Local Search for:', searchQuery.trim());
      
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const results = searchCSTopicsLocally(searchQuery.trim());
      
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowSuggestions(true);
        setSearchError('');
        console.log(`✅ Found ${results.length} topics for "${searchQuery.trim()}"`);
      } else {
        setSearchResults([]);
        setSearchError(`No CS topics found for "${searchQuery.trim()}". Try terms like: React, Python, Machine Learning, Data Structures, etc.`);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
      setSearchError('Search failed. Please try again.');
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Real-time search as user types (debounced)
  const performLiveSearch = useCallback((query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      setHasSearched(false);
      return;
    }

    const results = searchCSTopicsLocally(query.trim());
    
    if (results && results.length > 0) {
      setSearchResults(results);
      setShowSuggestions(true);
      setSearchError('');
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
    setHasSearched(true);
  }, []);

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

  const showSuggestedTopics = useCallback(() => {
    const suggestions = getSuggestedTopics(6);
    setSearchResults(suggestions);
    setShowSuggestions(true);
    setHasSearched(false); // Don't show as searched since these are suggestions
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
    performLiveSearch,
    clearSearch,
    hideSuggestions,
    showSuggestedTopics
  };
};