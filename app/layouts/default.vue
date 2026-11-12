<script setup lang="ts">
const route = useRoute()
const navigationLinks = useNavigationLinks()

const wideLayout = computed(() => route.path.endsWith('/menu') || route.path.endsWith('/events'))
// The homepage is a landing page: its bands run edge to edge, so the page
// sits outside the container and each section brings its own column.
const home = computed(() => route.path === '/' || route.path === '/de')
</script>

<template>
  <div
    v-if="home"
    class="min-h-svh bg-default"
  >
    <!-- The bar spans the window; `AppHeader` keeps its own column inside it
         and gives up the surface it draws on the other pages. -->
    <div class="sticky top-0 z-20 border-b border-default bg-default/85 backdrop-blur">
      <UContainer>
        <AppHeader
          :links="navigationLinks"
          class="border-b-0! bg-transparent! backdrop-blur-none!"
        />
      </UContainer>
    </div>
    <slot />
    <UContainer>
      <AppFooter />
    </UContainer>
  </div>
  <div
    v-else
    class="min-h-svh bg-default"
  >
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
