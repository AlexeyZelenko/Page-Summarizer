<template>
  <Card class="history-item">
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
          <Badge v-if="getCollectionName(item.collectionId)" :value="getCollectionName(item.collectionId)" class="custom-badge collection-badge" v-tooltip.bottom="'Collection'" />
          <Badge :value="item.settings.length" class="custom-badge length-badge" />
          <Badge :value="item.settings.type.replace('_', ' ')" class="custom-badge type-badge" />
          <Badge :value="item.settings.language" class="custom-badge lang-badge" />
        </div>
        <div class="item-actions">
          <Button icon="pi pi-folder-open" label="Move to collection" v-tooltip.bottom="'Move to collection'" @click="emit('open-collection-menu', $event, item)" />
          <Button icon="pi pi-copy" label="Copy Summary" v-tooltip.bottom="'Copy Summary'" @click="emit('copy', item.summary)" />
          <Button icon="pi pi-trash" label="Delete" rounded severity="danger" v-tooltip.bottom="'Delete'" @click="emit('delete', item.id)" />
          <Button icon="pi pi-eye" label="View Details" rounded v-tooltip.bottom="'View Details'" @click="emit('view-details', item)" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { SummaryHistoryItem, Collection } from '../../types';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Button from 'primevue/button';

const props = defineProps<{
  item: SummaryHistoryItem;
  collections: Collection[];
}>();

const emit = defineEmits(['delete', 'copy', 'view-details', 'open-collection-menu']);

const getCollectionName = (collectionId?: string): string => {
  if (!collectionId) return '';
  const collection = props.collections.find(c => c.id === collectionId);
  return collection ? collection.name : '';
};

const formatDate = (date: Date): string => {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const timeAgo = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'a few moments ago';
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return `just now`;
};

const getShortUrl = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
};
</script>

<style scoped>
/* All the styles from HistoryPage.vue related to history-item, card, badges, actions etc. */
.history-item { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); transition: all 0.2s ease-in-out; }
.history-item:hover { border-color: #d1d5db; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
:deep(.p-card-content) { padding: 1.5rem !important; }
:deep(.p-card-body) { padding: 0 !important; }
.card-header { margin-bottom: 1rem; }
.item-title { font-size: 1.25rem; font-weight: 600; color: #111827; text-decoration: none; display: block; margin-bottom: 0.5rem; }
.item-title:hover { color: #1d4ed8; }
.item-meta { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: #6b7280; }
.url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.summary-text { color: #4b5563; line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: pre-wrap; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.item-tags { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.custom-badge { font-size: 0.8rem; font-weight: 500; padding: 0.25rem 0.65rem; border-radius: 9999px; text-transform: capitalize; }
.collection-badge { background-color: #e0e7ff; color: #3730a3; }
.length-badge { background-color: #dcfce7; color: #166534; }
.type-badge { background-color: #f3e8ff; color: #6b21a8; }
.lang-badge { background-color: #fffbeb; color: #b45309; }
.item-actions { display: flex; gap: 0.5rem; }
.history-item .item-actions { opacity: 1; visibility: visible; }
</style> 