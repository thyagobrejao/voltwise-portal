<script setup lang="ts">
defineProps<{
  title: string
  value: string
  subtitle?: string
  trend?: string
  trendUp?: boolean
  color?: 'blue' | 'green' | 'amber' | 'purple'
}>()

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    trend: 'text-emerald-600'
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    trend: 'text-amber-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    trend: 'text-purple-600'
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-4">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <p class="mt-1.5 text-3xl font-bold text-slate-900 tracking-tight">{{ value }}</p>
      </div>
      <div
        v-if="$slots.icon"
        :class="[
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          colorMap[color ?? 'blue'].bg
        ]"
      >
        <span :class="['w-5 h-5', colorMap[color ?? 'blue'].icon]">
          <slot name="icon" />
        </span>
      </div>
    </div>

    <div v-if="trend || subtitle" class="flex items-center gap-2">
      <span
        v-if="trend"
        :class="[
          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
          trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        ]"
      >
        {{ trendUp ? '↑' : '↓' }} {{ trend }}
      </span>
      <span v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</span>
    </div>
  </div>
</template>
