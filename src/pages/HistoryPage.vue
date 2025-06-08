<template>
  <div class="history-page-layout">
    <CollectionSidebar />
    <div class="history-page">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="pi pi-history"></i> Summary History</h1>
          <Button
            v-if="history.length > 0"
            label="Clear All"
            icon="pi pi-trash"
            severity="danger"
            @click="clearAllHistory"
          />
        </div>
      </header>

      <main class="main-content">
        <div v-if="history.length === 0" class="no-history">
          <i class="pi pi-clock empty-icon"></i>
          <p>Your summary history is empty.</p>
          <span>Summarize a page to see it here.</span>
        </div>
        
        <div v-else class="history-list">
          <Card v-for="item in filteredHistory" :key="item.id" class="history-item">
            <template #content>
              <div class="card-header">
                <a :href="item.url" target="_blank" class="item-title" :title="item.title">{{ item.title }}</a>
                <div class="item-meta">
                  <span class="timestamp" v-tooltip.bottom="formatDate(item.timestamp)">{{ timeAgo(item.timestamp) }}</span>
                  <span class="url" v-tooltip.bottom="item.url">{{ getShortUrl(item.url) }}</span>
                </div>
              </div>

              <p class="summary-text">{{ item.summary }}</p>

              <div class="card-footer">
                <div class="item-tags">
                  <Badge v-if="item.collectionId" :value="getCollectionName(item.collectionId)" class="custom-badge collection-badge" v-tooltip.bottom="'Collection'" />
                  <Badge :value="item.settings.length" class="custom-badge length-badge" />
                  <Badge :value="item.settings.type.replace('_', ' ')" class="custom-badge type-badge" />
                  <Badge :value="item.settings.language" class="custom-badge lang-badge" />
                </div>
                <div class="item-actions">
                  <Button icon="pi pi-folder-open" rounded v-tooltip.bottom="'Move to collection'" @click="openCollectionMenu($event, item)" />
                  <Button icon="pi pi-copy" rounded v-tooltip.bottom="'Copy Summary'" @click="copySummary(item.summary)" />
                  <Button icon="pi pi-trash" rounded severity="danger" v-tooltip.bottom="'Delete'" @click="deleteItem(item.id)" />
                  <Button icon="pi pi-eye" rounded v-tooltip.bottom="'View Details'" @click="viewDetails(item)" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </main>

      <Dialog v-model:visible="isDialogVisible" modal :header="selectedSummary?.title" :style="{ width: '60vw', maxWidth: '900px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }">
        <p class="summary-dialog-content">{{ selectedSummary?.summary }}</p>
      </Dialog>
      
      <Toast />
    </div>

    <Menu ref="collectionMenu" :model="collectionMenuItems" :popup="true" appendTo="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storageService } from '../services/storage';
import { useCollectionStore } from '../stores/collectionStore';
import type { SummaryHistoryItem } from '../types';
import CollectionSidebar from '../components/collections/CollectionSidebar.vue';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import Menu from 'primevue/menu';

const history = ref<SummaryHistoryItem[]>([]);
const collectionStore = useCollectionStore();
const isDialogVisible = ref(false);
const selectedSummary = ref<SummaryHistoryItem | null>(null);
const toast = useToast();
const collectionMenu = ref();
const selectedHistoryItem = ref<SummaryHistoryItem | null>(null);

const filteredHistory = computed(() => {
  if (!collectionStore.activeCollectionId) {
    return history.value;
  }
  return history.value.filter(item => item.collectionId === collectionStore.activeCollectionId);
});

const collectionMenuItems = computed(() => {
  const items: any[] = [];

  if (selectedHistoryItem.value?.collectionId) {
    items.push(
      {
        label: 'Remove from Collection',
        icon: 'pi pi-folder-open',
        command: () => assignToCollection(null)
      },
      { separator: true }
    );
  }
  
  collectionStore.collections.forEach(collection => {
    items.push({
      label: collection.name,
      icon: 'pi pi-folder',
      command: () => assignToCollection(collection.id)
    });
  });

  if (collectionStore.collections.length === 0) {
    if (!selectedHistoryItem.value?.collectionId) {
      items.push({
        label: 'No collections available',
        icon: 'pi pi-inbox',
        disabled: true
      });
    }
  }

  return items;
});

const loadHistory = async () => {
  const storedHistory = await storageService.getHistory();
  history.value = storedHistory
    .map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

onMounted(async () => {
  await loadHistory();
});

const deleteItem = async (id: string) => {
  await storageService.deleteHistoryItem(id);
  await loadHistory(); // Refresh the list
};

const clearAllHistory = async () => {
  await storageService.saveHistory([]);
  await loadHistory(); // Refresh the list
};

const viewDetails = (item: SummaryHistoryItem) => {
  selectedSummary.value = item;
  isDialogVisible.value = true;
};

const copySummary = async (summary: string) => {
  try {
    await navigator.clipboard.writeText(summary);
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Summary copied to clipboard!', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Copy Failed', detail: 'Could not copy summary.', life: 3000 });
  }
};

const formatTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'a few moments ago'; // More graceful fallback
  }
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return `just now`;
};

const timeAgo = (date: Date): string => {
  return formatTime(date);
};

const getShortUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (e) {
    return url; // Возвращает исходный URL, если он невалиден
  }
};

const openCollectionMenu = (event: Event, item: SummaryHistoryItem) => {
  selectedHistoryItem.value = item;
  collectionMenu.value.toggle(event);
};

const assignToCollection = async (collectionId: string | null) => {
  if (!selectedHistoryItem.value) return;
  await storageService.updateHistoryItem({
    ...selectedHistoryItem.value,
    collectionId: collectionId || undefined
  });
  await loadHistory();
};

const getCollectionName = (collectionId?: string): string => {
  if (!collectionId) return 'No collection';
  const collection = collectionStore.getCollectionById(collectionId);
  return collection ? collection.name : 'Unknown Collection';
};

const formatDate = (date: Date): string => {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.history-page-layout {
  display: flex;
  height: 100vh;
}
.history-page {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
}
.page-header {
  padding: 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
}
.main-content {
  padding: 1.5rem;
  flex-grow: 1;
}
.no-history {
  text-align: center;
  font-size: 1.2rem;
  color: #6c757d;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-icon {
  font-size: 3rem;
  color: #adb5bd;
}
.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
.history-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  transition: all 0.2s ease-in-out;
}
.history-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
}
:deep(.p-card-content) {
  padding: 1.5rem !important;
}
:deep(.p-card-body) {
  padding: 0 !important;
}
.card-header {
  margin-bottom: 1rem;
}
.item-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
}
.item-title:hover {
  color: #1d4ed8;
}
.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}
.url {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.summary-text {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.collection-badge {
  background-color: #e0e7ff;
  color: #3730a3;
  text-transform: capitalize;
}
.custom-badge {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  text-transform: capitalize;
}
.length-badge {
  background-color: #dcfce7;
  color: #166534;
}
.type-badge {
  background-color: #f3e8ff;
  color: #6b21a8;
}
.lang-badge {
  background-color: #fffbeb;
  color: #b45309;
}
.item-actions {
  display: flex;
  gap: 0.5rem;
}

.history-item .item-actions {
  opacity: 1;
  visibility: visible;
}

.item-actions .p-button {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  width: 2.25rem;
  height: 2.25rem;
}

.item-actions .p-button:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.item-actions .p-button.p-button-danger {
  background: #fef2f2;
  color: #ef4444;
}

.item-actions .p-button.p-button-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}
.summary-dialog-content {
  white-space: pre-wrap; /* Allows text to wrap and respects newlines */
  line-height: 1.7;
  font-size: 1rem;
  color: #333;
}
.collection-icon {
  margin-right: 8px;
  color: #2a2c2e;
  background-color: #fef3c7;
}
</style> 