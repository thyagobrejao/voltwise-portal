<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { ArrowRightIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { BoltIcon } from '@heroicons/vue/24/solid'

const { t } = useI18n()

const stats = [
  { value: '150+', key: 'stats.hotels' },
  { value: '2.5k+', key: 'stats.chargers' },
  { value: '99.9%', key: 'stats.uptime' }
]
</script>

<template>
  <section class="relative min-h-screen flex items-center bg-slate-950 overflow-hidden">
    <!-- Background glow effects -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-volt-500/10 rounded-full blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/30 rounded-full blur-3xl" />
    </div>

    <!-- Grid pattern overlay -->
    <div
      class="absolute inset-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 60px 60px"
    />

    <div class="container-custom relative z-10 pt-24 pb-16">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-950/80 border border-primary-800/60 text-primary-300 text-xs font-semibold mb-8 animate-fade-in">
          <BoltIcon class="w-3.5 h-3.5 text-primary-400" />
          {{ t('hero.badge') }}
        </div>

        <!-- Headline -->
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6 animate-slide-up">
          {{ t('hero.title') }}<br />
          <span class="bg-gradient-to-r from-primary-400 via-blue-400 to-volt-400 bg-clip-text text-transparent">
            {{ t('hero.highlight') }}
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up">
          {{ t('hero.subtitle') }}
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
          <RouterLink
            to="/register"
            class="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-500 transition-all duration-200 shadow-lg shadow-primary-900/40 hover:shadow-primary-800/50 hover:-translate-y-0.5"
          >
            {{ t('hero.cta') }}
            <ArrowRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
          <a
            href="#how-it-works"
            class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-base hover:border-slate-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            <PlayIcon class="w-4 h-4" />
            {{ t('hero.demo') }}
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto animate-fade-in">
          <div
            v-for="stat in stats"
            :key="stat.key"
            class="text-center"
          >
            <div class="text-2xl md:text-3xl font-extrabold text-white mb-1">{{ stat.value }}</div>
            <div class="text-xs text-slate-500 font-medium">{{ t(`hero.${stat.key}`) }}</div>
          </div>
        </div>
      </div>

      <!-- Dashboard preview mockup -->
      <div class="mt-20 max-w-5xl mx-auto animate-slide-up">
        <div class="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/60">
          <!-- Browser chrome -->
          <div class="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-red-500/60" />
              <div class="w-3 h-3 rounded-full bg-amber-500/60" />
              <div class="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div class="flex-1 mx-4">
              <div class="bg-slate-800 rounded-md h-6 flex items-center px-3">
                <span class="text-slate-500 text-xs">app.voltwise.io/dashboard</span>
              </div>
            </div>
          </div>

          <!-- Dashboard mockup content -->
          <div class="bg-slate-900/95 p-6">
            <!-- Stats row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div
                v-for="(item, i) in [
                  { label: 'Carregadores', value: '6', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                  { label: 'Sessões Ativas', value: '2', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                  { label: 'Energia (mês)', value: '1.2 MWh', color: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
                  { label: 'Receita (mês)', value: 'R$ 4.8k', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' }
                ]"
                :key="i"
                class="rounded-xl border p-3"
                :class="item.color"
              >
                <div class="text-xs text-slate-500 mb-1">{{ item.label }}</div>
                <div class="text-xl font-bold text-white">{{ item.value }}</div>
              </div>
            </div>

            <!-- Table mockup -->
            <div class="rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
              <div class="px-4 py-3 border-b border-slate-700/50">
                <div class="h-3 w-28 bg-slate-600/60 rounded" />
              </div>
              <div
                v-for="i in 3"
                :key="i"
                class="px-4 py-3 flex items-center gap-4 border-b border-slate-700/30 last:border-0"
              >
                <div class="h-2.5 w-16 bg-slate-700/80 rounded" />
                <div class="h-2.5 flex-1 bg-slate-700/60 rounded" />
                <div
                  class="h-5 w-16 rounded-full"
                  :class="i === 1 ? 'bg-emerald-900/60' : i === 2 ? 'bg-blue-900/60' : 'bg-slate-700/60'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Glow under mockup -->
        <div class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-primary-700/20 blur-3xl rounded-full pointer-events-none" />
      </div>
    </div>
  </section>
</template>
