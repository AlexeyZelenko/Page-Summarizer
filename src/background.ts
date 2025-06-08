// src/background.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log('Page Summarizer extension installed.');

  // Initialize default settings
  chrome.storage.local.get(['settings', 'history'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          apiKey: '',
          summaryLength: 'medium',
          summaryType: 'key_points'
        }
      });
    }
    if (!result.history) {
      chrome.storage.local.set({ history: [] });
    }
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, _sender: chrome.runtime.MessageSender, sendResponse) => {
  if (request.action === 'summarize') {
    sendResponse({ error: 'Summarization from background not yet implemented.' });
  }

  // Keep the message channel open for async response
  return true;
}); 