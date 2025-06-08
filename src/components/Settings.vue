<template>
  <Card class="settings-card">
    <template #title>
      <div class="card-title">
        <i class="pi pi-cog"></i>
        Settings
      </div>
    </template>
    
    <template #content>
      <div class="settings-content">
        <!-- API Key Input -->
        <div class="field">
          <label for="apiKey" class="field-label">OpenAI API Key</label>
          <Password 
            id="apiKey"
            v-model="localApiKey"
            placeholder="sk-..."
            :feedback="false"
            toggleMask
            class="w-full"
            @blur="updateApiKey"
          />
          
          <!-- API Key Instructions -->
          <div v-if="!localApiKey || localApiKey.trim() === ''" class="api-key-instructions">
            <div class="instruction-header">
              <i class="pi pi-info-circle"></i>
              <span>How to get an API key:</span>
            </div>
            <ol class="instruction-list">
              <li>
                Go to <a href="https://platform.openai.com" target="_blank" class="underline">platform.openai.com</a> and sign up
              </li>
              <li>Log in to your account and go to the API Keys section</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key and paste it above</li>
            </ol>
            <div class="instruction-note">
              <i class="pi pi-shield"></i>
              <span>Your key is stored locally and is not shared with third parties</span>
            </div>
          </div>
          
          <small v-else class="field-hint">
            Key saved. Get a new key: <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a>
          </small>
        </div>

        <!-- Summary Length -->
        <div class="field">
          <label class="field-label">Summary Length</label>
          <div class="option-group">
            <RadioButton 
              v-model="localSummaryLength" 
              inputId="short" 
              value="short" 
              @change="updateSummaryLength"
            />
            <label for="short" class="option-label">Short</label>
            
            <RadioButton 
              v-model="localSummaryLength" 
              inputId="medium" 
              value="medium"
              @change="updateSummaryLength" 
            />
            <label for="medium" class="option-label">Medium</label>
            
            <RadioButton 
              v-model="localSummaryLength" 
              inputId="detailed" 
              value="detailed"
              @change="updateSummaryLength" 
            />
            <label for="detailed" class="option-label">Detailed</label>
          </div>
        </div>

        <!-- Summary Type -->
        <div class="field">
          <label class="field-label">Summary Type</label>
          <Select 
            v-model="localSummaryType"
            :options="summaryTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select summary type"
            class="w-full"
            @change="updateSummaryType"
          />
        </div>

        <!-- Language Selection -->
        <div class="field">
          <label class="field-label">Summary Language</label>
          <Select
            v-model="localSelectedLanguage"
            :options="languageStore.languages"
            placeholder="Select language"
            class="w-full"
            @change="updateSelectedLanguage"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Card from 'primevue/card'
import Password from 'primevue/password'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import { useLanguageStore } from '../stores/languageStore'

interface Props {
  apiKey: string
  summaryLength: 'short' | 'medium' | 'detailed'
  summaryType: 'key_points' | 'narrative' | 'technical'
  selectedLanguage: string
}

interface Emits {
  (e: 'update:apiKey', value: string): void
  (e: 'update:summaryLength', value: 'short' | 'medium' | 'detailed'): void
  (e: 'update:summaryType', value: 'key_points' | 'narrative' | 'technical'): void
  (e: 'update:selectedLanguage', value: string): void
  (e: 'settings-changed'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const languageStore = useLanguageStore()

const localApiKey = ref(props.apiKey)
const localSummaryLength = ref(props.summaryLength)
const localSummaryType = ref(props.summaryType)
const localSelectedLanguage = ref(props.selectedLanguage)

const summaryTypeOptions = [
  { label: 'Key Points', value: 'key_points' },
  { label: 'Narrative Summary', value: 'narrative' },
  { label: 'Technical Summary', value: 'technical' }
]

// Watch for prop changes
watch(() => props.apiKey, (newVal) => {
  localApiKey.value = newVal
})

watch(() => props.summaryLength, (newVal) => {
  localSummaryLength.value = newVal
})

watch(() => props.summaryType, (newVal) => {
  localSummaryType.value = newVal
})

watch(() => props.selectedLanguage, (newVal) => {
  localSelectedLanguage.value = newVal
  languageStore.setSelectedLanguage(newVal)
})

const updateApiKey = () => {
  emit('update:apiKey', localApiKey.value)
  emit('settings-changed')
}

const updateSummaryLength = () => {
  emit('update:summaryLength', localSummaryLength.value)
  emit('settings-changed')
}

const updateSummaryType = () => {
  emit('update:summaryType', localSummaryType.value)
  emit('settings-changed')
}

const updateSelectedLanguage = () => {
  emit('update:selectedLanguage', localSelectedLanguage.value)
  emit('settings-changed')
}
</script>

<style scoped>
.settings-card {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
}

.field-hint {
  color: #6B7280;
  font-size: 0.8rem;
}

.field-hint a {
  color: #3B82F6;
  text-decoration: none;
}

.field-hint a:hover {
  text-decoration: underline;
}

.api-key-instructions {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.instruction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0369A1;
  margin-bottom: 12px;
}

.instruction-list {
  margin: 0 0 12px 0;
  padding-left: 20px;
  color: #374151;
}

.instruction-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.instruction-list a {
  color: #2563EB;
  text-decoration: none;
  font-weight: 500;
}

.instruction-list a:hover {
  text-decoration: underline;
}

.instruction-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #059669;
  background: #ECFDF5;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #A7F3D0;
}

.option-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.option-label {  
  margin-right: 16px;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>