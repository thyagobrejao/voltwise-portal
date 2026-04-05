<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Bars3Icon, XMarkIcon, BoltIcon } from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const scrolled = ref(false)

const navLinks = [
  { key: 'features', hash: '#features' },
  { key: 'howItWorks', hash: '#how-it-works' },
  { key: 'benefits', hash: '#benefits' }
]

function toggleLocale() {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
  localStorage.setItem('locale', locale.value)
}

function handleScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

function goToDashboard() {
  router.push({ name: 'overview' })
}
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
    ]"
  >
    <div class="container-custom">
      <nav class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
            <BoltIcon class="w-5 h-5 text-white" />
          </div>
          <span
            :class="[
              'text-lg font-bold tracking-tight transition-colors',
              scrolled ? 'text-slate-900' : 'text-white'
            ]"
          >
            VoltWise
          </span>
        </RouterLink>

        <!-- Desktop nav links -->
        <div class="hidden md:flex items-center gap-1">
          <a
            v-for="link in navLinks"
            :key="link.key"
            :href="link.hash"
            :class="[
              'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
              scrolled
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            ]"
          >
            {{ t(`nav.${link.key}`) }}
          </a>
        </div>

        <!-- Desktop right actions -->
        <div class="hidden md:flex items-center gap-2">
          <!-- Language toggle -->
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
              scrolled
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'border-white/20 text-white/80 hover:bg-white/10'
            ]"
            @click="toggleLocale"
          >
            {{ locale === 'pt' ? 'EN' : 'PT' }}
          </button>

          <template v-if="authStore.isAuthenticated">
            <button class="btn-primary" @click="goToDashboard">
              {{ t('nav.dashboard') }}
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                scrolled
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              ]"
            >
              {{ t('nav.login') }}
            </RouterLink>
            <RouterLink to="/register" class="btn-primary">
              {{ t('nav.getStarted') }}
            </RouterLink>
          </template>
        </div>

        <!-- Mobile hamburger -->
        <button
          :class="[
            'md:hidden p-2 rounded-lg transition-colors',
            scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          ]"
          @click="menuOpen = !menuOpen"
        >
          <Bars3Icon v-if="!menuOpen" class="w-6 h-6" />
          <XMarkIcon v-else class="w-6 h-6" />
        </button>
      </nav>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="menuOpen" class="md:hidden bg-white border-b border-slate-100 shadow-lg">
        <div class="container-custom py-4 space-y-1">
          <a
            v-for="link in navLinks"
            :key="link.key"
            :href="link.hash"
            class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="menuOpen = false"
          >
            {{ t(`nav.${link.key}`) }}
          </a>

          <div class="pt-3 pb-1 flex flex-col gap-2 border-t border-slate-100">
            <button
              class="btn-secondary text-xs self-start"
              @click="toggleLocale"
            >
              {{ locale === 'pt' ? '🇺🇸 English' : '🇧🇷 Português' }}
            </button>
            <template v-if="authStore.isAuthenticated">
              <button class="btn-primary self-start" @click="goToDashboard">
                {{ t('nav.dashboard') }}
              </button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="btn-secondary self-start" @click="menuOpen = false">
                {{ t('nav.login') }}
              </RouterLink>
              <RouterLink to="/register" class="btn-primary self-start" @click="menuOpen = false">
                {{ t('nav.getStarted') }}
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
