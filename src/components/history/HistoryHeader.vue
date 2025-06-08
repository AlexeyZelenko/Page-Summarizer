<!-- src/components/history/HistoryHeader.vue -->
<template>
  <header class="page-header">
    <h1 class="page-title">Summary History</h1>
    <Button 
      label="Clear All" 
      icon="pi pi-trash" 
      severity="danger" 
      text 
      @click="showClearConfirm" 
      v-if="hasHistory" 
    />
  </header>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';

defineProps<{
  hasHistory: boolean;
}>();

const emit = defineEmits(['clear-history']);

const confirm = useConfirm();

const showClearConfirm = () => {
  confirm.require({
    message: 'Are you sure you want to delete all history? This action cannot be undone.',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      emit('clear-history');
    },
  });
};
</script>

<style scoped>
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
  margin: 0;
}
</style> 