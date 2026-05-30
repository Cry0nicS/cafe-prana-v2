<script setup lang="ts">
const route = useRoute()

const wideLayout = computed(() => route.path === '/menu' || route.path === '/events')
</script>

<template>
  <div class="min-h-svh bg-default">
    <UContainer
      class="min-h-svh border-default sm:border-x"
      :class="wideLayout ? 'max-w-6xl!' : ''"
    >
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
