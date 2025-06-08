import type { SummarySettings, SummaryHistoryItem, Collection } from '../types'

const SETTINGS_KEY = 'summarizer_settings'
const HISTORY_KEY = 'summarizer_history'
const COLLECTIONS_KEY = 'summarizer_collections'

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

  public async saveHistory(history: SummaryHistoryItem[]): Promise<void> {
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

  public async getHistory(): Promise<SummaryHistoryItem[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(HISTORY_KEY, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        let history = result[HISTORY_KEY];

        if (!Array.isArray(history)) {
          console.warn('Данные истории не были массивом. Попытка миграции.', { data: history });

          if (typeof history === 'object' && history !== null) {
            const migratedHistory = Object.values(history);
            if (migratedHistory.every(item => typeof item === 'object' && item !== null && item.hasOwnProperty('id'))) {
              history = migratedHistory;
              console.log('Миграция данных истории прошла успешно.');
              this.saveHistory(history).catch(e => console.error('Ошибка при сохранении перенесенной истории:', e));
            } else {
              history = [];
              console.warn('Не удалось выполнить миграцию истории. Сброс.');
              this.saveHistory([]).catch(e => console.error('Ошибка при сохранении сброшенной истории:', e));
            }
          } else {
            history = [];
            this.saveHistory([]).catch(e => console.error('Ошибка при сохранении сброшенной истории:', e));
          }
        }

        const processedHistory = history.map((item: any) => {
          let timestamp = item.timestamp;
          if (!timestamp || (typeof timestamp === 'object' && Object.keys(timestamp).length === 0)) {
            console.warn('Обнаружена неверная временная метка. Используется текущее время.', { item });
            timestamp = new Date();
          }
          return {
            ...item,
            timestamp: new Date(timestamp)
          };
        });
        resolve(processedHistory as SummaryHistoryItem[]);
      });
    });
  }

  async deleteHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    await this.saveHistory(filteredHistory)
  }

  async clearHistory(): Promise<void> {
    return this.saveHistory([])
  }

  public async updateHistoryItem(updatedItem: SummaryHistoryItem): Promise<void> {
    const history = await this.getHistory();
    const itemIndex = history.findIndex(item => item.id === updatedItem.id);
    if (itemIndex > -1) {
      history[itemIndex] = updatedItem;
      await this.saveHistory(history);
    }
  }

  // --- Collection Methods ---

  public async getCollections(): Promise<Collection[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(COLLECTIONS_KEY, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        let collections = result[COLLECTIONS_KEY];

        if (!Array.isArray(collections)) {
          console.warn(`Данные коллекций не были массивом. Сброс. Данные:`, collections);
          collections = [];
          this.saveCollections([]).catch(e => console.error('Ошибка при сохранении сброшенных коллекций:', e));
        }

        const processedCollections = collections.map((coll: any) => {
          let createdAt = coll.createdAt;
          if (!createdAt || (typeof createdAt === 'object' && Object.keys(createdAt).length === 0)) {
            console.warn('Обнаружена неверная дата создания коллекции. Используется текущее время.', { coll });
            createdAt = new Date();
          }
          return {
            ...coll,
            createdAt: new Date(createdAt)
          };
        });

        resolve(processedCollections as Collection[]);
      });
    });
  }

  async saveCollections(collections: Collection[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [COLLECTIONS_KEY]: collections }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        resolve()
      })
    })
  }

  async addCollection(name: string): Promise<Collection> {
    const collections = await this.getCollections()
    const newCollection: Collection = {
      id: `coll_${Date.now()}`,
      name,
      createdAt: new Date()
    }
    collections.push(newCollection)
    await this.saveCollections(collections)
    return newCollection
  }

  public async deleteCollection(id: string): Promise<void> {
    let collections = await this.getCollections();
    collections = collections.filter(c => c.id !== id);
    await this.saveCollections(collections);

    // Un-assign items from the deleted collection
    let history = await this.getHistory();
    history.forEach(item => {
      if (item.collectionId === id) {
        item.collectionId = undefined;
      }
    });
    await this.saveHistory(history);
  }
}

export const storageService = new StorageService()