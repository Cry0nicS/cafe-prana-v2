<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  links: NavigationMenuItem[]
}>()

const { global } = useAppConfig()

const dropdownLinks = computed<DropdownMenuItem[]>(() =>
  props.links.map(link => ({
    label: link.label,
    icon: link.icon,
    to: link.to,
    target: link.target
  }))
)
</script>

<template>
  <header class="sticky top-0 z-20 -mx-4 border-b border-default bg-default/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div class="flex items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="flex min-w-0 items-center gap-3"
        :aria-label="`${global.name} home`"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm dark:text-prana-warm-950">
          <UIcon
            name="i-lucide-sprout"
            class="size-5"
          />
        </span>
        <span class="min-w-0">
          <span class="block truncate font-semibold text-highlighted">{{ global.name }}</span>
          <span class="block truncate text-xs text-muted">{{ global.address }}</span>
        </span>
      </NuxtLink>

      <div class="hidden items-center gap-2 md:flex">
        <UNavigationMenu
          :items="links"
          variant="link"
          color="neutral"
          :ui="{
            link: 'px-3 py-2',
            linkLeadingIcon: 'size-4'
          }"
        />
        <ColorModeButton />
      </div>

      <div class="flex items-center gap-1 md:hidden">
        <ColorModeButton />
        <UDropdownMenu :items="dropdownLinks">
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            aria-label="Open navigation"
          />
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>
