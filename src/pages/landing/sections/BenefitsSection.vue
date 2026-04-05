<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  UserGroupIcon,
  BanknotesIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

const benefits = [
  {
    key: 'guests',
    icon: UserGroupIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    statColor: 'text-blue-600'
  },
  {
    key: 'revenue',
    icon: BanknotesIcon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    statColor: 'text-emerald-600'
  },
  {
    key: 'esg',
    icon: SparklesIcon,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    statColor: 'text-violet-600'
  },
  {
    key: 'support',
    icon: StarIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    statColor: 'text-amber-600'
  }
]
</script>

<template>
  <section id="benefits" class="section-padding bg-white">
    <div class="container-custom">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="inline-block px-3 py-1 rounded-full bg-volt-50 text-volt-700 text-xs font-semibold mb-4 tracking-wide uppercase">
          Benefícios
        </span>
        <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
          {{ t('benefits.title') }}
          <span class="gradient-text"> {{ t('benefits.highlight') }}</span>
        </h2>
        <p class="text-lg text-slate-500">{{ t('benefits.subtitle') }}</p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="benefit in benefits"
          :key="benefit.key"
          class="relative p-8 rounded-2xl border border-slate-100 hover:shadow-soft transition-all duration-300 group"
        >
          <div class="flex items-start justify-between mb-6">
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                benefit.bg
              ]"
            >
              <component :is="benefit.icon" :class="['w-6 h-6', benefit.color]" />
            </div>

            <div class="text-right">
              <div :class="['text-3xl font-extrabold', benefit.statColor]">
                {{ t(`benefits.items.${benefit.key}.stat`) }}
              </div>
              <div class="text-xs text-slate-500 font-medium">
                {{ t(`benefits.items.${benefit.key}.statLabel`) }}
              </div>
            </div>
          </div>

          <h3 class="text-lg font-bold text-slate-900 mb-2">
            {{ t(`benefits.items.${benefit.key}.title`) }}
          </h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            {{ t(`benefits.items.${benefit.key}.description`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
