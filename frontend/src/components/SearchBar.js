import React, { useState, useCallback, useEffect } from 'react';

const SearchBar = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  onSelectTopic, 
  isSearching,
  searchError,
  hasSearched,
  performSearch,
  performLiveSearch,
  clearSearch,
  hideSuggestions,
  showSuggestions,
  setShowSuggestions,
  showSuggestedTopics
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced live search
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        performLiveSearch(searchQuery);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else if (searchQuery.trim().length === 0) {
      // Show suggested topics when search is empty and focused
      if (isFocused) {
        showSuggestedTopics();
      }
    }
  }, [searchQuery, performLiveSearch, showSuggestedTopics, isFocused]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        onSelectTopic(searchResults[selectedIndex]);
        hideSuggestions();
        setSelectedIndex(-1);
      } else if (searchQuery.trim()) {
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
      setIsFocused(false);
    }
  }, [selectedIndex, searchResults, onSelectTopic, performSearch, hideSuggestions, searchQuery]);

  const handleSearchClick = useCallback(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [performSearch, searchQuery]);

  const handleTopicSelect = useCallback((topic) => {
    onSelectTopic(topic);
    hideSuggestions();
    setSelectedIndex(-1);
    setIsFocused(false);
  }, [onSelectTopic, hideSuggestions]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  }, [setSearchQuery]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      showSuggestedTopics();
    } else if (searchResults.length > 0) {
      setShowSuggestions(true);
    }
  }, [searchQuery, showSuggestedTopics, searchResults.length, setShowSuggestions]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsFocused(false);
      hideSuggestions();
    }, 150);
  }, [hideSuggestions]);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Search CS topics: React, Python, Machine Learning, Blockchain..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isSearching}
          autoComplete="off"
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

      {(showSuggestions && searchResults.length > 0) && (
        <div className="search-results-container">
          <div className="search-results-section">
            <div className="results-header">
              {!hasSearched ? (
                <>
                  <h3>💡 Popular CS Topics</h3>
                  <p>Here are some popular topics to get you started</p>
                </>
              ) : (
                <>
                  <h3>🎯 CS Topics for "{searchQuery}"</h3>
                  <p>Found {searchResults.length} topics - Select one to start learning</p>
                </>
              )}
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
                      <span className={`topic-difficulty difficulty-${topic.difficulty.toLowerCase()}`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchError && (
        <div className="search-results-container">
          <div className="search-error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{searchError}</div>
            <div className="error-suggestions">
              <strong>Try these popular topics:</strong><br/>
              React, Python, Machine Learning, JavaScript, Docker, AWS, Data Structures, Algorithms
            </div>
          </div>
        </div>
      )}

      {!hasSearched && !showSuggestions && searchQuery.trim() && (
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