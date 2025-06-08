<template>
  <Dialog 
    :visible="visible" 
    @update:visible="emit('update:visible', $event)" 
    modal 
    :header="summary?.title" 
    :style="{ width: '50vw' }"
  >
    <div v-if="summary" class="summary-dialog-content">
      <p>{{ summary.summary }}</p>
      <div class="p-divider p-component p-divider-horizontal p-divider-solid p-divider-left" role="separator"></div>
      <div class="summary-meta">
        <div><strong>URL:</strong> <a :href="summary.url" target="_blank">{{ summary.url }}</a></div>
        <div><strong>Language:</strong> <span>{{ summary.settings.language }}</span></div>
        <div><strong>Length:</strong> <span>{{ summary.settings.length }}</span></div>
        <div><strong>Type:</strong> <span>{{ summary.settings.type }}</span></div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { SummaryHistoryItem } from '../../types';
import Dialog from 'primevue/dialog';

defineProps<{
  summary: SummaryHistoryItem | null;
  visible: boolean;
}>();

const emit = defineEmits(['update:visible']);
</script>

<style scoped>
.summary-dialog-content p {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  margin-top: 0;
}
.summary-meta {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
}
.summary-meta div {
  margin-bottom: 0.5rem;
}
.summary-meta a {
  color: #1d4ed8;
  text-decoration: none;
}
.summary-meta a:hover {
  text-decoration: underline;
}
</style> 