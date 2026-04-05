<script setup lang="ts">
defineProps<{
  status: 'available' | 'charging' | 'offline' | 'error' | 'fault' | 'reserved' | 'active' | 'completed' | 'failed' | 'stopped'
  label: string
}>()

const classMap: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  charging: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  offline: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20',
  error: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  fault: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  reserved: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  failed: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  stopped: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
}

const dotMap: Record<string, string> = {
  available: 'bg-emerald-500',
  charging: 'bg-blue-500 animate-pulse',
  offline: 'bg-slate-400',
  error: 'bg-red-500',
  fault: 'bg-red-500',
  reserved: 'bg-amber-500',
  active: 'bg-blue-500 animate-pulse',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
  stopped: 'bg-slate-400'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      classMap[status]
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', dotMap[status]]" />
    {{ label }}
  </span>
</template>
