<script setup lang="ts">
</script>

<template>
  <div class="min-h-svh bg-default">
    <UContainer class="min-h-svh border-default sm:border-x">
      <AppHeader :links="navLinks" />
      <slot />
      <AppFooter />
    </UContainer>
  </div>
</template>
