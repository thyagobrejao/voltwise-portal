<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: boolean
    hover?: boolean
  }>(),
  {
    padding: true,
    hover: false
  }
)
</script>

<template>
  <div
    :class="[
      'bg-white rounded-2xl border border-slate-100 shadow-card transition-all duration-200',
      padding && 'p-6',
      hover && 'hover:shadow-soft hover:-translate-y-0.5 cursor-pointer'
    ]"
  >
    <slot />
  </div>
</template>
