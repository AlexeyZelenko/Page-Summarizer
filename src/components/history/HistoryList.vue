<template>
  <div class="history-list">
    <HistoryItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :collections="collections"
      @delete="emit('delete', $event)"
      @copy="emit('copy', $event)"
      @view-details="emit('view-details', $event)"
      @open-collection-menu="emit('open-collection-menu', $event[0], $event[1])"
    />
  </div>
</template>

<script setup lang="ts">
import type { SummaryHistoryItem, Collection } from '../../types';
import HistoryItemCard from './HistoryItemCard.vue';

defineProps<{
  items: SummaryHistoryItem[];
  collections: Collection[];
}>();

const emit = defineEmits(['delete', 'copy', 'view-details', 'open-collection-menu']);
</script> 