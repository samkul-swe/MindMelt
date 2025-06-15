// ============================================================================
// components/SearchBar.js - Reusable Search Bar Component
// ============================================================================

import React, { useState, useCallback } from 'react';

const SearchBar = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  onSelectTopic, 
  selectedTopic,
  isSearching,
  searchError,
  hasSearched,
  performSearch,
  clearSearch,
  hideSuggestions,
  showSuggestions
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        onSelectTopic(searchResults[selectedIndex]);
        hideSuggestions();
        setSelectedIndex(-1);
      } else {
        performSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
      hideSuggestions();
    }
  }, [selectedIndex, searchResults, onSelectTopic, performSearch, hideSuggestions]);

  const handleSearchClick = useCallback(() => {
    performSearch();
  }, [performSearch]);

  const handleTopicSelect = useCallback((topic) => {
    onSelectTopic(topic);
    hideSuggestions();
    setSelectedIndex(-1);
  }, [onSelectTopic, hideSuggestions]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  }, [setSearchQuery]);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Enter CS topic: React, Python, Machine Learning, Blockchain..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />
        
        {isSearching && (
          <div className="search-loading">
            <div className="search-spinner"></div>
          </div>
        )}
        
        {searchQuery && !isSearching && (
          <button 
            className="clear-search"
            onClick={clearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
        
        {searchQuery.trim() && !isSearching && (
          <button 
            className="search-btn"
            onClick={handleSearchClick}
            title="Search for CS topics"
          >
            Search
          </button>
        )}
      </div>

      {hasSearched && showSuggestions && (
        <div className="search-results-container">
          {searchError ? (
            <div className="search-error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{searchError}</div>
              {!searchError.includes('API key') && (
                <div className="error-suggestions">
                  <strong>Try these CS topics:</strong> React, Python, Machine Learning, JavaScript, Docker, AWS, MongoDB, TypeScript, Flutter, Cybersecurity
                </div>
              )}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-results-section">
              <div className="results-header">
                <h3>🎯 CS Topics for "{searchQuery}"</h3>
                <p>Found {searchResults.length} topics - Select one to start learning</p>
              </div>
              <div className="results-list">
                {searchResults.map((topic, index) => (
                  <div
                    key={`${topic.name}-${index}`}
                    className={`topic-result-card ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleTopicSelect(topic)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="topic-icon">{topic.icon}</div>
                    <div className="topic-info">
                      <div className="topic-name">{topic.name}</div>
                      <div className="topic-description">{topic.description}</div>
                      <div className="topic-tags">
                        <span className="topic-category">{topic.category}</span>
                        <span className="topic-difficulty">{topic.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {!hasSearched && searchQuery.trim() && (
        <div className="search-help">
          <p className="search-help-text">
            💡 Press <strong>Enter</strong> or click <strong>Search</strong> to find CS topics
          </p>
        </div>
      )}
    </div>
  );
});

export default SearchBar;