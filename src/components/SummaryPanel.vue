<template>
  <Card class="summary-card">
    <template #title>
      <div class="card-title">
        <i class="pi pi-book"></i>
        Page Summary
      </div>
    </template>
    
    <template #content>
      <div class="summary-content">
        <div class="action-bar">
          <Button 
            label="Summarize This Page"
            icon="pi pi-play"
            :loading="loading"
            @click="$emit('summarize')"
            class="summarize-btn"
            :disabled="loading"
          />
        </div>

        <div v-if="loading" class="loading-state">
          <ProgressSpinner />
          <p class="loading-text">Analyzing page content...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <Message severity="error" :closable="false">
            <div class="error-content">
              <i class="pi pi-exclamation-triangle"></i>
              <div>
                <strong>Error:</strong> {{ error }}
              </div>
            </div>
          </Message>
        </div>

        <div v-else-if="summary" class="summary-result">
          <div class="summary-header">
            <h3>Summary</h3>
            <Button 
              icon="pi pi-copy"
              size="small"
              text
              @click="$emit('copy', summary)"
              v-tooltip="'Copy to clipboard'"
            />
          </div>
          <div class="summary-text">
            {{ summary }}
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-content">
            <i class="pi pi-file-text empty-icon"></i>
            <h3>Ready to Summarize</h3>
            <p>Click the button above to generate a summary of the current page.</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

interface Props {
  loading: boolean
  summary: string
  error: string
}

interface Emits {
  (e: 'summarize'): void
  (e: 'copy', text: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.summary-card {
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-bar {
  display: flex;
  justify-content: center;
}

.summarize-btn {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: none;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s;
}

.summarize-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
}

.loading-text {
  color: #6B7280;
  margin: 0;
}

.error-state {
  margin: 16px 0;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-result {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  background: #F9FAFB;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.summary-text {
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state {
  padding: 32px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 3rem;
  color: #D1D5DB;
}

.empty-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.empty-content p {
  margin: 0;
  color: #6B7280;
  font-size: 0.9rem;
}
</style>