import type { SummarySettings, SummaryHistoryItem } from '../types'

const SETTINGS_KEY = 'summarizer_settings'
const HISTORY_KEY = 'summarizer_history'

class StorageService {
  async saveSettings(settings: SummarySettings): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve()
      })
    })
  }

  async getSettings(): Promise<SummarySettings> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(SETTINGS_KEY, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve(result[SETTINGS_KEY] as SummarySettings)
      })
    })
  }

  async saveHistory(history: SummaryHistoryItem[]): Promise<void> {
    // Sort by date descending before saving
    const sortedHistory = history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [HISTORY_KEY]: sortedHistory }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve()
      })
    })
  }

  async getHistory(): Promise<SummaryHistoryItem[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(HISTORY_KEY, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        const history = result[HISTORY_KEY] || []
        resolve(history as SummaryHistoryItem[])
      })
    })
  }

  async deleteHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    await this.saveHistory(filteredHistory)
  }

  async clearHistory(): Promise<void> {
    return this.saveHistory([])
  }
}

export const storageService = new StorageService()