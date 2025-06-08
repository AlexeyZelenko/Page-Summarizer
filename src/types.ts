export interface SummarySettings {
  apiKey: string;
  summaryLength: 'short' | 'medium' | 'detailed';
  summaryType: 'key_points' | 'narrative' | 'technical';
  selectedLanguage: string;
}

export interface SummaryHistoryItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  timestamp: Date;
  settings: {
    length: 'short' | 'medium' | 'detailed';
    type: 'key_points' | 'narrative' | 'technical';
    language: string;
  };
} 