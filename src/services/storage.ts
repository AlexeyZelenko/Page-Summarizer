import type { SummarySettings, SummaryHistoryItem } from '../types'

class StorageService {
  private readonly SETTINGS_KEY = 'summarizer_settings'
  private readonly HISTORY_KEY = 'summarizer_history'
  private readonly MAX_HISTORY_ITEMS = 50

  async saveSettings(settings: SummarySettings): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'))
        return
      }

      chrome.storage.local.set({ [this.SETTINGS_KEY]: settings }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    })
  }

  async getSettings(): Promise<SummarySettings | null> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'))
        return
      }

      chrome.storage.local.get([this.SETTINGS_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(result[this.SETTINGS_KEY] || null)
        }
      })
    })
  }

  async saveHistory(history: SummaryHistoryItem[]): Promise<void> {
    // Limit history size
    const limitedHistory = history.slice(0, this.MAX_HISTORY_ITEMS)
    
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'))
        return
      }

      chrome.storage.local.set({ [this.HISTORY_KEY]: limitedHistory }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    })
  }

  async getHistory(): Promise<SummaryHistoryItem[]> {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'))
        return
      }

      chrome.storage.local.get([this.HISTORY_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          const history = result[this.HISTORY_KEY] || []
          // Convert timestamp strings back to Date objects
          const processedHistory = history.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
          resolve(processedHistory)
        }
      })
    })
  }

  async clearHistory(): Promise<void> {
    return this.saveHistory([])
  }
}

export const storageService = new StorageService()