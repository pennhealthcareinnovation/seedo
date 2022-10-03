import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { apiRequest } from './lib/api'

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: typeof apiRequest
  }
}

const app = createApp(App)
app.config.globalProperties.$api = apiRequest

app.use(createPinia())
app.use(router)

app.mount('#app')
