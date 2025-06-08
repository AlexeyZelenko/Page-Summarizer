<template>
  <Card class="history-card">
    <template #title>
      <div class="card-title">
        <i class="pi pi-history"></i>
        Recent Summaries
        <div class="title-buttons">
          <Button
            icon="pi pi-external-link"
            size="small"
            text
            severity="secondary"
            @click="openHistoryPage"
            v-tooltip="'Open full history'"
            class="history-link-btn"
          />
          <Button
            v-if="history.length > 0"
            icon="pi pi-trash"
            size="small"
            text
            severity="danger"
            @click="$emit('clear-history')"
            v-tooltip="'Clear all history'"
            class="clear-btn"
          />
        </div>
      </div>
    </template>
    
    <template #content>
      <div class="history-content">
        <div v-if="history.length === 0" class="empty-history">
          <i class="pi pi-clock empty-icon"></i>
          <p>No summaries yet</p>
        </div>
        
        <div v-else class="history-list">
          <div 
            v-for="item in history.slice(0, 5)" 
            :key="item.id"
            class="history-item"
            @click="$emit('select-summary', item)"
          >
            <div class="item-header">
              <h4 class="item-title">{{ truncateTitle(item.title) }}</h4>
              <span class="item-time">{{ formatTime(item.timestamp) }}</span>
            </div>
            <div class="item-details">
              <span class="item-url">{{ truncateUrl(item.url) }}</span>
              <div class="item-badges">
                <Badge :value="item.settings.length" severity="info" />
                <Badge :value="item.settings.type.replace('_', ' ')" />
              </div>
            </div>
            <p class="item-preview">{{ truncateText(item.summary, 100) }}</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import type { SummaryHistoryItem } from '../types'

interface Props {
  history: SummaryHistoryItem[]
}

interface Emits {
  (e: 'select-summary', item: SummaryHistoryItem): void
  (e: 'clear-history'): void
}

defineProps<Props>()
defineEmits<Emits>()

const truncateTitle = (title: string): string => {
  return title.length > 50 ? title.substring(0, 50) + '...' : title
}

const truncateUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url.length > 30 ? url.substring(0, 30) + '...' : url
  }
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const openHistoryPage = () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
};

const formatTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
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
  if (diffSeconds < 5) return 'just now';
  return `${diffSeconds}s ago`;
};
</script>

<style scoped>
.history-card {
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  width: 100%;
}

.title-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.clear-btn {
  margin-left: auto;
}

.history-content {
  max-height: 300px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 32px;
  color: #6B7280;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: block;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #3B82F6;
  background: #F8FAFC;
  transform: translateY(-1px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.item-time {
  font-size: 0.75rem;
  color: #6B7280;
  white-space: nowrap;
  margin-left: 8px;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-url {
  font-size: 0.8rem;
  color: #6B7280;
  flex: 1;
}

.item-badges {
  display: flex;
  gap: 4px;
}

.item-preview {
  margin: 0;
  font-size: 0.8rem;
  color: #6B7280;
  line-height: 1.4;
}
</style>