<template>
  <div class="extension-container">
    <Header />
    <main class="main-content">
      <Settings 
        v-model:apiKey="apiKey"
        v-model:summaryLength="summaryLength" 
        v-model:summaryType="summaryType"
        v-model:selectedLanguage="selectedLanguage"
        @settings-changed="saveSettings"
      />
      <SummaryPanel 
        :loading="loading"
        :summary="currentSummary"
        :error="error"
        @summarize="handleSummarize"
        @copy="handleCopy"
      />
      <HistoryPanel 
        :history="summaryHistory"
        @select-summary="selectFromHistory"
        @clear-history="clearHistory"
      />
    </main>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Header from './components/Header.vue'
import Settings from './components/Settings.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import Toast from 'primevue/toast'
import { openAIService } from './services/openai'
import { chromeService } from './services/chrome'
import { storageService } from './services/storage'
import type { SummarySettings, SummaryHistoryItem } from './types'
import { useLanguageStore } from './stores/languageStore'

const toast = useToast()
const languageStore = useLanguageStore()

// Reactive state
const loading = ref(false)
const currentSummary = ref('')
const error = ref('')
const apiKey = ref('')
const summaryLength = ref<'short' | 'medium' | 'detailed'>('medium')
const summaryType = ref<'key_points' | 'narrative' | 'technical'>('key_points')
const selectedLanguage = ref(languageStore.selectedLanguage)
const summaryHistory = ref<SummaryHistoryItem[]>([])

// Load settings on mount
onMounted(async () => {
  await loadSettings()
  await loadHistory()
})

// Load user settings
const loadSettings = async () => {
  const settings = await storageService.getSettings()
  if (settings) {
    apiKey.value = settings.apiKey || ''
    summaryLength.value = settings.summaryLength || 'medium'
    summaryType.value = settings.summaryType || 'key_points'
    selectedLanguage.value = settings.selectedLanguage || 'English'
    languageStore.setSelectedLanguage(selectedLanguage.value)
  }
}

// Save settings
const saveSettings = async () => {
  const settings: SummarySettings = {
    apiKey: apiKey.value,
    summaryLength: summaryLength.value,
    summaryType: summaryType.value,
    selectedLanguage: selectedLanguage.value
  }
  await storageService.saveSettings(settings)
  toast.add({
    severity: 'success',
    summary: 'Settings saved',
    detail: 'Your preferences have been saved',
    life: 3000
  })
}

// Load summary history
const loadHistory = async () => {
  summaryHistory.value = await storageService.getHistory()
}

// Handle summarization
const handleSummarize = async () => {
  if (!apiKey.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'API Key Required',
      detail: 'Please enter your OpenAI API key in settings',
      life: 5000
    })
    return
  }

  loading.value = true
  error.value = ''
  currentSummary.value = ''

  try {
    // Get page content
    const pageContent = await chromeService.getPageContent()
    
    if (!pageContent || pageContent.trim().length < 100) {
      throw new Error('Page content is too short or empty')
    }

    // Generate summary
    const summary = await openAIService.summarize(
      pageContent,
      apiKey.value,
      {
        length: summaryLength.value,
        type: summaryType.value,
        language: selectedLanguage.value
      }
    )

    currentSummary.value = summary
    
    // Save to history
    const historyItem: SummaryHistoryItem = {
      id: Date.now().toString(),
      url: await chromeService.getCurrentUrl(),
      title: await chromeService.getCurrentTitle(),
      summary,
      timestamp: new Date(),
      settings: {
        length: summaryLength.value,
        type: summaryType.value,
        language: selectedLanguage.value
      }
    }
    
    summaryHistory.value.unshift(historyItem)
    await storageService.saveHistory(summaryHistory.value)

    toast.add({
      severity: 'success',
      summary: 'Summary generated',
      detail: 'Page has been successfully summarized',
      life: 3000
    })
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    toast.add({
      severity: 'error',
      summary: 'Summarization failed',
      detail: error.value,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Copy to clipboard
const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Summary copied to clipboard',
      life: 2000
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Copy failed',
      detail: 'Could not copy to clipboard',
      life: 3000
    })
  }
}

// Select from history
const selectFromHistory = (item: SummaryHistoryItem) => {
  currentSummary.value = item.summary
  summaryLength.value = item.settings.length
  summaryType.value = item.settings.type
}

// Clear history
const clearHistory = async () => {
  summaryHistory.value = []
  await storageService.saveHistory([])
  toast.add({
    severity: 'info',
    summary: 'History cleared',
    detail: 'Summary history has been cleared',
    life: 3000
  })
}
</script>