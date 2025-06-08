function extractPageContentForScripting(): string {
  // This function is executed in the context of the web page
  // It should be self-contained and not rely on any external scope.

  // Create a clone of the document to avoid modifying the live page
  const docClone = document.cloneNode(true) as Document;

  // Remove elements that are unlikely to contain main content from the clone
  docClone
    .querySelectorAll(
      'script, style, nav, header, footer, aside, .ad, .advert, .popup, [role="navigation"], [role="banner"], [role="complementary"], [role="contentinfo"]'
    )
    .forEach((el) => el.remove());

  // Get selected text first (from the original window)
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 50) {
    return selection;
  }

  // Otherwise get main content from the clone
  let content = '';

  // Try to find main content areas using a list of common selectors
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.post',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-body',
    '.article-content',
    '#content',
    '#main',
    '#main-content',
    '#article'
  ];

  for (const selector of contentSelectors) {
    const element = docClone.querySelector(selector); // Search in the clone
    if (element) {
      content = (element as HTMLElement).innerText || '';
      if (content.trim()) {
        break;
      }
    }
  }

  // Fallback to body's innerText from the clone if no specific content is found
  if (!content.trim()) {
    content = docClone.body?.innerText || '';
  }

  // Final cleanup of the content
  if (content) {
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/(\r\n|\n|\r)/gm, ' ') // Replace line breaks with spaces
      .trim();
  }

  return content;
}

class ChromeService {
  async getPageContent(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!chrome?.tabs) {
        reject(new Error('Chrome tabs API not available'));
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id || !tab.url) {
          reject(new Error('No active tab found'));
          return;
        }

        if (
          tab.url.startsWith('chrome://') ||
          tab.url.startsWith('https://chrome.google.com/webstore')
        ) {
          reject(new Error('Cannot run on this page'));
          return;
        }

        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: extractPageContentForScripting
          },
          (results) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message || 'Script execution failed'));
              return;
            }

            const content = results?.[0]?.result;
            if (typeof content !== 'string' || !content.trim()) {
              reject(new Error('Could not extract page content'));
              return;
            }

            resolve(content);
          }
        );
      });
    });
  }

  async getCurrentUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!chrome?.tabs) {
        reject(new Error('Chrome tabs API not available'));
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.url) {
          reject(new Error('No active tab URL found'));
          return;
        }
        resolve(tabs[0].url);
      });
    });
  }

  async getCurrentTitle(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!chrome?.tabs) {
        reject(new Error('Chrome tabs API not available'));
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.title) {
          reject(new Error('No active tab title found'));
          return;
        }
        resolve(tabs[0].title);
      });
    });
  }
}

export const chromeService = new ChromeService();