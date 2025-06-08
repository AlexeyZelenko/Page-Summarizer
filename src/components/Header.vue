<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <i class="pi pi-file-text text-2xl text-primary"></i>
        <h1 class="title">Page Summarizer</h1>
      </div>
      <div class="version">v1.0.0</div>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  color: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.version {
  font-size: 0.75rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
}
</style>