<script setup lang="ts">
const route = useRoute()
const navigationLinks = useNavigationLinks()

const wideLayout = computed(() => route.path.endsWith('/menu') || route.path.endsWith('/events'))
</script>

<template>
  <div class="min-h-svh bg-default">
    <UContainer
      class="min-h-svh border-default sm:border-x"
      :class="wideLayout ? 'max-w-6xl!' : ''"
    >
      <AppHeader :links="navigationLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
