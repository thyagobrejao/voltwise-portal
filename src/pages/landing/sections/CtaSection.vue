<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()

const email = ref('')

function submit() {
  if (email.value) {
    router.push({ name: 'register' })
  }
}
</script>

<template>
  <section class="section-padding relative overflow-hidden">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800" />

    <!-- Glow -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

    <!-- Grid pattern -->
    <div
      class="absolute inset-0 opacity-[0.04]"
      style="background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 40px 40px"
    />

    <div class="container-custom relative z-10">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
          {{ t('cta.title') }}<br />
          <span class="text-primary-200">{{ t('cta.highlight') }}</span>
        </h2>
        <p class="text-lg text-primary-100/80 mb-10">
          {{ t('cta.subtitle') }}
        </p>

        <!-- Email form -->
        <form
          class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-5"
          @submit.prevent="submit"
        >
          <input
            v-model="email"
            type="email"
            :placeholder="t('cta.placeholder')"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-primary-200/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 backdrop-blur-sm text-sm"
          />
          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            {{ t('cta.button') }}
            <ArrowRightIcon class="w-4 h-4" />
          </button>
        </form>

        <p class="text-xs text-primary-200/60">{{ t('cta.note') }}</p>
      </div>
    </div>
  </section>
</template>
