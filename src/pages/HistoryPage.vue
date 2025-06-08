<template>
  <div class="history-page-layout">
    <CollectionSidebar />
    <div class="history-page">
      <HistoryHeader :has-history="history.length > 0" @clear-history="clearHistory" />

      <main class="main-content">
        <NoHistoryMessage v-if="history.length === 0" />
        <HistoryList
          v-else
          :items="filteredHistory"
          :collections="collectionStore.collections"
          @delete="deleteItem"
          @copy="copySummary"
          @view-details="viewDetails"
          @open-collection-menu="openCollectionMenu"
        />
      </main>

      <SummaryDetailsDialog v-model:visible="isDialogVisible" :summary="selectedSummary" />
      <Menu ref="collectionMenu" :model="collectionMenuItems" :popup="true" appendTo="body" />
      <Toast />
      <ConfirmDialog></ConfirmDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storageService } from '../services/storage';
import { useCollectionStore } from '../stores/collectionStore';
import type { SummaryHistoryItem } from '../types';
import { useToast } from 'primevue/usetoast';

// Layout & Child Components
import CollectionSidebar from '../components/collections/CollectionSidebar.vue';
import HistoryHeader from '../components/history/HistoryHeader.vue';
import HistoryList from '../components/history/HistoryList.vue';
import NoHistoryMessage from '../components/history/NoHistoryMessage.vue';
import SummaryDetailsDialog from '../components/history/SummaryDetailsDialog.vue';

// PrimeVue Components
import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// State
const history = ref<SummaryHistoryItem[]>([]);
const collectionStore = useCollectionStore();
const isDialogVisible = ref(false);
const selectedSummary = ref<SummaryHistoryItem | null>(null);
const collectionMenu = ref();
const selectedHistoryItem = ref<SummaryHistoryItem | null>(null);
const toast = useToast();

// Computed Properties
const filteredHistory = computed(() => {
  if (!collectionStore.activeCollectionId) {
    return history.value;
  }
  return history.value.filter(item => item.collectionId === collectionStore.activeCollectionId);
});

const collectionMenuItems = computed(() => {
  const items: any[] = [];
  if (selectedHistoryItem.value?.collectionId) {
    items.push({ label: 'Remove from Collection', icon: 'pi pi-folder-open', command: () => assignToCollection(null) }, { separator: true });
  }
  collectionStore.collections.forEach(collection => {
    items.push({ label: collection.name, icon: 'pi pi-folder', command: () => assignToCollection(collection.id) });
  });
  if (collectionStore.collections.length === 0 && !selectedHistoryItem.value?.collectionId) {
    items.push({ label: 'No collections available', icon: 'pi pi-inbox', disabled: true });
  }
  return items;
});

// Methods
const loadHistory = async () => {
  history.value = await storageService.getHistory();
};

const clearHistory = async () => {
  await storageService.clearHistory();
  await loadHistory();
  toast.add({ severity: 'success', summary: 'Success', detail: 'History cleared', life: 3000 });
}

const deleteItem = async (id: string) => {
  await storageService.deleteHistoryItem(id);
  await loadHistory();
  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Summary removed from history', life: 3000 });
};

const copySummary = (summary: string) => {
  navigator.clipboard.writeText(summary);
  toast.add({ severity: 'success', summary: 'Copied', detail: 'Summary copied to clipboard', life: 3000 });
};

const viewDetails = (item: SummaryHistoryItem) => {
  selectedSummary.value = item;
  isDialogVisible.value = true;
};

const openCollectionMenu = (event: Event, item: SummaryHistoryItem) => {
  selectedHistoryItem.value = item;
  collectionMenu.value.toggle(event);
};

const assignToCollection = async (collectionId: string | null) => {
  if (!selectedHistoryItem.value) return;
  await storageService.updateHistoryItem({ ...selectedHistoryItem.value, collectionId: collectionId || undefined });
  await loadHistory();
  toast.add({ severity: 'info', summary: 'Moved', detail: 'Summary moved to new collection', life: 3000 });
};

// Lifecycle
onMounted(loadHistory);
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
.main-content {
  padding: 1.5rem;
  flex-grow: 1;
}
</style> 