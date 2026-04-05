<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  BoltIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
  LifebuoyIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

const features = [
  { key: 'ocpp', icon: BoltIcon, gradient: 'from-blue-500 to-primary-600' },
  { key: 'realtime', icon: ChartBarIcon, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'multisite', icon: BuildingOfficeIcon, gradient: 'from-violet-500 to-purple-600' },
  { key: 'reports', icon: DocumentChartBarIcon, gradient: 'from-amber-500 to-orange-600' },
  { key: 'payments', icon: CreditCardIcon, gradient: 'from-pink-500 to-rose-600' },
  { key: 'support', icon: LifebuoyIcon, gradient: 'from-primary-500 to-blue-600' }
]
</script>

<template>
  <section id="features" class="section-padding bg-white">
    <div class="container-custom">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4 tracking-wide uppercase">
          Recursos
        </span>
        <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
          {{ t('features.title') }}
          <span class="gradient-text"> {{ t('features.highlight') }}</span>
        </h2>
        <p class="text-lg text-slate-500">{{ t('features.subtitle') }}</p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="group relative p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-soft transition-all duration-300 hover:-translate-y-1 bg-white"
        >
          <!-- Icon -->
          <div
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br',
              feature.gradient
            ]"
          >
            <component :is="feature.icon" class="w-6 h-6 text-white" />
          </div>

          <h3 class="text-base font-bold text-slate-900 mb-2">
            {{ t(`features.items.${feature.key}.title`) }}
          </h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            {{ t(`features.items.${feature.key}.description`) }}
          </p>

          <!-- Hover accent -->
          <div
            :class="[
              'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              feature.gradient
            ]"
          />
        </div>
      </div>
    </div>
  </section>
</template>
