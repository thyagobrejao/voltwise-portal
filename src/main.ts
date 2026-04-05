import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import pt from './locales/pt.json'
import en from './locales/en.json'
import './styles/main.css'
import { useAuthStore } from './stores/auth'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'pt',
  fallbackLocale: 'en',
  messages: { pt, en }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)

// Resolve the user profile BEFORE installing the router.
// app.use(router) triggers the initial navigation internally, which runs
// beforeEach. If we install the router first, user.value is still null
// and the guard redirects to login on every page reload.
const authStore = useAuthStore()
authStore.initialize().finally(() => {
  app.use(router)
  app.mount('#app')
})
