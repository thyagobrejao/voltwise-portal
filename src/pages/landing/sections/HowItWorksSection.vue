<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  WifiIcon,
  AdjustmentsHorizontalIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

const steps = [
  { key: 'connect', icon: WifiIcon, color: 'bg-blue-500', ring: 'ring-blue-100' },
  { key: 'configure', icon: AdjustmentsHorizontalIcon, color: 'bg-violet-500', ring: 'ring-violet-100' },
  { key: 'monitor', icon: ComputerDesktopIcon, color: 'bg-emerald-500', ring: 'ring-emerald-100' },
  { key: 'optimize', icon: ArrowTrendingUpIcon, color: 'bg-amber-500', ring: 'ring-amber-100' }
]
</script>

<template>
  <section id="how-it-works" class="section-padding bg-slate-50">
    <div class="container-custom">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold mb-4 tracking-wide uppercase">
          Como funciona
        </span>
        <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
          {{ t('howItWorks.title') }}
          <span class="gradient-text"> {{ t('howItWorks.highlight') }}</span>
        </h2>
        <p class="text-lg text-slate-500">{{ t('howItWorks.subtitle') }}</p>
      </div>

      <!-- Steps -->
      <div class="relative">
        <!-- Connector line (desktop) -->
        <div class="absolute top-14 left-0 right-0 hidden lg:block">
          <div class="max-w-4xl mx-auto px-20">
            <div class="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          <div
            v-for="(step, index) in steps"
            :key="step.key"
            class="relative flex flex-col items-center text-center"
          >
            <!-- Step number + icon -->
            <div class="relative mb-6">
              <div
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center ring-4 shadow-md',
                  step.color,
                  step.ring
                ]"
              >
                <component :is="step.icon" class="w-6 h-6 text-white" />
              </div>
              <span
                class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700"
              >
                {{ index + 1 }}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 mb-2">
              {{ t(`howItWorks.steps.${step.key}.title`) }}
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed">
              {{ t(`howItWorks.steps.${step.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
