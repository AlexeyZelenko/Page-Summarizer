import { defineStore } from 'pinia';
import { storageService } from '../services/storage';
import type { Collection } from '../types';

export const useCollectionStore = defineStore('collections', {
  state: () => ({
    collections: [] as Collection[],
    activeCollectionId: null as string | null,
    isLoading: false,
  }),
  getters: {
    getCollectionById: (state) => (id: string) => {
      return state.collections.find(c => c.id === id);
    }
  },
  actions: {
    async fetchCollections() {
      this.isLoading = true;
      try {
        this.collections = await storageService.getCollections();
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async addCollection(name: string) {
      if (!name.trim()) return;
      try {
        const newCollection = await storageService.addCollection(name);
        this.collections.push(newCollection);
      } catch (error) {
        console.error('Failed to add collection:', error);
      }
    },
    async deleteCollection(id: string) {
      try {
        await storageService.deleteCollection(id);
        this.collections = this.collections.filter(c => c.id !== id);
        if (this.activeCollectionId === id) {
          this.activeCollectionId = null;
        }
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    },
    setActiveCollection(id: string | null) {
      this.activeCollectionId = id;
    }
  }
}); 