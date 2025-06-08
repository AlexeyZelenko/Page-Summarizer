<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Collections</h3>
      <Button icon="pi pi-plus" text rounded @click="isAddDialogVisible = true" v-tooltip.bottom="'New Collection'" />
    </div>
    <div class="collection-list">
      <a 
        href="#" 
        @click.prevent="collectionStore.setActiveCollection(null)" 
        :class="{ 'active': collectionStore.activeCollectionId === null }"
        class="collection-item all-summaries"
      >
        <i class="pi pi-inbox"></i>
        <span>All Summaries</span>
      </a>
      <a 
        v-for="collection in collectionStore.collections" 
        :key="collection.id"
        href="#"
        @click.prevent="collectionStore.setActiveCollection(collection.id)"
        :class="{ 'active': collectionStore.activeCollectionId === collection.id }"
        class="collection-item"
      >
        <div class="collection-item-main">
          <i class="pi pi-folder"></i>
          <span>{{ collection.name }}</span>
        </div>
        <Button 
          icon="pi pi-trash" 
          text 
          rounded 
          class="delete-btn" 
          v-tooltip.bottom="'Delete Collection'"
          @click.stop="confirmDelete(collection)" 
        />
      </a>
    </div>

    <Dialog v-model:visible="isAddDialogVisible" modal header="New Collection" :style="{ width: '300px' }">
      <div class="p-fluid">
        <div class="p-field">
          <label for="collectionName">Collection Name</label>
          <InputText id="collectionName" v-model="newCollectionName" @keyup.enter="handleAddNewCollection" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="isAddDialogVisible = false" />
        <Button label="Save" icon="pi pi-check" @click="handleAddNewCollection" :loading="isAdding" />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCollectionStore } from '../../stores/collectionStore';
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import type { Collection } from '../../types';

const collectionStore = useCollectionStore();
const isAddDialogVisible = ref(false);
const newCollectionName = ref('');
const isAdding = ref(false);
const confirm = useConfirm();

onMounted(() => {
  collectionStore.fetchCollections();
});

const handleAddNewCollection = async () => {
  if (!newCollectionName.value.trim()) return;
  isAdding.value = true;
  await collectionStore.addCollection(newCollectionName.value);
  isAdding.value = false;
  isAddDialogVisible.value = false;
  newCollectionName.value = '';
};

const confirmDelete = (collection: Collection) => {
  confirm.require({
    message: `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
    header: 'Confirm Deletion',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await collectionStore.deleteCollection(collection.id);
    },
  });
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}
.sidebar-header .p-button {
    color: #475569;
}
.sidebar-header .p-button:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}
.collection-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.collection-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: background-color 0.2s;
  justify-content: space-between;
}
.collection-item:hover {
  background-color: #f1f5f9;
}
.collection-item.active {
  background-color: #eef2ff;
  color: #4338ca;
  font-weight: 600;
}
.collection-item i {
  font-size: 1.1rem;
}
.collection-item-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 1;
  overflow: hidden;
}
.collection-item-main span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.delete-btn {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;
  flex-shrink: 0;
}
.collection-item:hover .delete-btn {
  visibility: visible;
  opacity: 1;
}
</style> 