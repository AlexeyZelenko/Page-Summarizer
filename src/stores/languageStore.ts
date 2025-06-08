import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    selectedLanguage: 'English',
    languages: [
      'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Italian', 'Portuguese',
      'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish', 'Arabic', 'Hebrew', 'Hindi',
      'Indonesian', 'Vietnamese', 'Thai', 'Greek', 'Czech', 'Hungarian', 'Romanian', 'Ukrainian', 'Slovak', 'Croatian',
      'Bulgarian', 'Lithuanian', 'Latvian', 'Estonian', 'Slovenian', 'Maltese', 'Icelandic', 'Irish', 'Basque', 'Catalan',
      'Galician', 'Filipino', 'Malay', 'Swahili', 'Afrikaans', 'Zulu', 'Xhosa', 'Persian', 'Urdu', 'Bengali'
    ]
  }),
  actions: {
    setSelectedLanguage(language: string) {
      this.selectedLanguage = language;
    }
  }
}); 