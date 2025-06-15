import { useState, useEffect, useCallback } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySource, setApiKeySource] = useState('');
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState(false);

  const getCurrentApiKey = useCallback(() => {
    return apiKey || 
           process.env.REACT_APP_AI_API_KEY || 
           localStorage.getItem('mindmelt_ai_key') || 
           null;
  }, [apiKey]);

  const saveApiKey = useCallback((key) => {
    try {
      localStorage.setItem('mindmelt_ai_key', key);
      setApiKey(key);
      setApiKeySource('localStorage');
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  }, []);

  const getApiKeyStatus = useCallback(() => {
    const envKey = process.env.REACT_APP_AI_API_KEY;
    const savedKey = localStorage.getItem('mindmelt_ai_key');
    console.log(envKey);
    
    if (envKey?.trim() && envKey !== 'undefined') {
      return { 
        status: 'env', 
        message: '✅ API Key from Environment (.env file)',
        showChange: false
      };
    } else if (savedKey?.trim() && savedKey !== 'null' && savedKey !== 'undefined') {
      return { 
        status: 'saved', 
        message: '✅ API Key Configured (User Input)',
        showChange: true
      };
    } else {
      return { 
        status: 'missing', 
        message: '⚠️ API Key Required',
        showChange: false
      };
    }
  }, []);

  useEffect(() => {
    const envApiKey = process.env.REACT_APP_AI_API_KEY;
    const savedApiKey = localStorage.getItem('mindmelt_ai_key');
    
    let finalKey = null;
    let source = '';
    
    if (envApiKey?.trim() && envApiKey !== 'undefined') {
      finalKey = envApiKey.trim();
      source = 'environment';
    } else if (savedApiKey?.trim() && savedApiKey !== 'null' && savedApiKey !== 'undefined') {
      finalKey = savedApiKey.trim();
      source = 'localStorage';
    }
    
    if (finalKey) {
      setApiKey(finalKey);
      setApiKeySource(source);
    } else {
      setApiKeySource('none');
    }
    
    setIsApiKeyLoaded(true);
  }, []);

  return {
    apiKey,
    isApiKeyLoaded,
    apiKeySource,
    getCurrentApiKey,
    saveApiKey,
    getApiKeyStatus
  };
};