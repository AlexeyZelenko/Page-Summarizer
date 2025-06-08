<!-- src/components/history/NoHistoryMessage.vue -->
<template>
  <div class="no-history-message">
    <i class="pi pi-inbox"></i>
    <p>Your summary history is empty.</p>
    <span>Summarize a page to see it here.</span>
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
.no-history-message {
  text-align: center;
  margin-top: 5rem;
  color: #6b7280;
}
.no-history-message .pi {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}
.no-history-message p {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}
.no-history-message span {
  font-size: 0.9rem;
}
</style> 