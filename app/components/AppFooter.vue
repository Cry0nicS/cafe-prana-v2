<script setup lang="ts">
const { footer, global } = useAppConfig()
</script>

<template>
  <UFooter
    class="z-10 border-t border-default bg-default"
    :ui="{ left: 'text-muted text-xs', right: 'gap-1' }"
  >
    <template #left>
      <div class="flex flex-col gap-1">
        <span>{{ footer.credits }}</span>
        <span>{{ global.description }}</span>
        <ULink
          to="/cookies"
          class="text-xs text-muted underline-offset-4 hover:text-highlighted hover:underline"
        >
          Cookie policy
        </ULink>
      </div>
    </template>

    <template #right>
      <UButton
        v-for="(link, index) of footer.links"
        :key="index"
        v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
      />
    </template>
  </UFooter>
</template>
