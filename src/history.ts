// src/history.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import HistoryPage from './pages/HistoryPage.vue';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import './style.css';
import 'primeicons/primeicons.css';

const app = createApp(HistoryPage);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark'
    }
  }
});
app.use(ToastService);
app.directive('tooltip', Tooltip);

app.mount('#app'); 