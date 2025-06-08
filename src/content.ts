// Content script for extracting page content
// This script runs in the context of web pages

(function() {
  'use strict';

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, _sender: chrome.runtime.MessageSender, sendResponse) => {
    if (request.action === 'getPageContent') {
      try {
        const content = extractPageContent();
        sendResponse({ success: true, content });
      } catch (error) {
        sendResponse({ success: false, error: (error as Error).message });
      }
    }
    return true; // Keep the message channel open for async response
  });

  function extractPageContent(): string {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script',
      'style', 
      'nav',
      'header',
      'footer',
      'aside',
      '.advertisement',
      '.ads',
      '.sidebar',
      '.menu',
      '.navigation'
    ];

    // Clone document to avoid modifying the original
    const clonedDoc = document.cloneNode(true) as Document;
    unwantedSelectors.forEach(selector => {
      const elements = clonedDoc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Check for selected text first
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 50) {
      return selection;
    }

    // Try to find main content areas
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content', 
      '.article-content',
      '.main-content',
      '#content',
      '#main'
    ];

    let content = '';

    for (const selector of contentSelectors) {
      const element = clonedDoc.querySelector(selector) as HTMLElement;
      if (element) {
        content = element.textContent || '';
        if (content.trim().length > 100) {
          break;
        }
      }
    }

    // Fallback to body content
    if (!content || content.trim().length < 100) {
      content = clonedDoc.body?.textContent || document.body?.textContent || '';
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    if (content.length < 50) {
      throw new Error('Page content is too short or empty');
    }

    return content;
  }
})(); 