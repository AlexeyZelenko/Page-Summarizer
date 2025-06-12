// Default configuration for the extension
export const DEFAULT_CONFIG = {
  // Default OpenAI API key - replace with your working key before building
  DEFAULT_API_KEY: 'sk-proj-your-openai-api-key-here-replace-before-building',
  
  // Default settings
  DEFAULT_SUMMARY_LENGTH: 'medium' as 'short' | 'medium' | 'detailed',
  DEFAULT_SUMMARY_TYPE: 'key_points' as 'key_points' | 'narrative' | 'technical', 
  DEFAULT_LANGUAGE: 'English',
  
  // Error messages that trigger settings panel
  API_ERROR_KEYWORDS: [
    'API key',
    'authentication', 
    '401',
    'invalid',
    'quota',
    'limit',
    'unauthorized',
    'forbidden'
  ]
} 