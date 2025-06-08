<template>
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
        <Card v-for="item in history" :key="item.id" class="history-item">
          <template #title>
            <a :href="item.url" target="_blank" class="item-title" :title="item.title">{{ item.title }}</a>
          </template>
          <template #subtitle>
            <div class="item-subtitle">
              <span>{{ formatTime(item.timestamp) }}</span>
              <a :href="item.url" target="_blank" class="item-url" :title="item.url">{{ truncateUrl(item.url) }}</a>
            </div>
          </template>
          <template #content>
            <p class="item-summary">{{ item.summary }}</p>
          </template>
          <template #footer>
            <div class="item-footer">
              <div class="item-tags">
                <Badge :value="item.settings.length" severity="info" />
                <Badge :value="item.settings.type.replace('_', ' ')" />
                <Badge :value="item.settings.language" severity="warning" />
              </div>
              <div class="item-actions">
                <Button 
                  icon="pi pi-copy" 
                  text 
                  rounded 
                  v-tooltip.bottom="'Copy summary'"
                  @click="copySummary(item.summary)"
                />
                <Button 
                  icon="pi pi-eye" 
                  text 
                  rounded 
                  v-tooltip.bottom="'View full summary'"
                  @click="viewSummary(item)"
                />
                <Button 
                  icon="pi pi-trash" 
                  text 
                  rounded 
                  severity="danger"
                  v-tooltip.bottom="'Delete summary'"
                  @click="deleteItem(item.id)"
                />
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storageService } from '../services/storage';
import type { SummaryHistoryItem } from '../types';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const history = ref<SummaryHistoryItem[]>([]);
const isDialogVisible = ref(false);
const selectedSummary = ref<SummaryHistoryItem | null>(null);
const toast = useToast();

const loadHistory = async () => {
  const storedHistory = await storageService.getHistory();
  history.value = storedHistory
    .map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

onMounted(loadHistory);

const deleteItem = async (id: string) => {
  await storageService.deleteHistoryItem(id);
  await loadHistory(); // Refresh the list
};

const clearAllHistory = async () => {
  await storageService.saveHistory([]);
  await loadHistory(); // Refresh the list
};

const viewSummary = (item: SummaryHistoryItem) => {
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

function formatTime(timestamp: Date): string {
  if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
    return 'a few moments ago'; // More graceful fallback
  }
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return `just now`;
}

function truncateUrl(url: string, length = 50): string {
  if (url.length <= length) return url;
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  return domain.length > length ? domain.slice(0, length) + '...' : domain;
}
</script>

<style scoped>
.history-page {
  width: 100%;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.page-header {
  background-color: #ffffff;
  padding: 1rem 2rem;
  border-bottom: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 1.75rem;
  color: #343a40;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}
.history-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
:deep(.p-card-body) {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.p-card-content) {
  flex-grow: 1;
}
.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-subtitle {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
  flex-wrap: wrap;
  gap: 8px;
}
.item-url {
  color: #6c757d;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-summary {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.item-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.delete-btn {
  margin-left: auto;
}
.summary-dialog-content {
  white-space: pre-wrap; /* Allows text to wrap and respects newlines */
  line-height: 1.7;
  font-size: 1rem;
  color: #333;
}
</style> 