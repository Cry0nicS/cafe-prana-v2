<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  links: NavigationMenuItem[]
}>()

const { global } = useAppConfig()
const { locale, locales, setLocale, t } = useI18n()
const localePath = useLocalePath()

const dropdownLinks = computed<DropdownMenuItem[]>(() =>
  props.links.map(link => ({
    label: link.label,
    icon: link.icon,
    to: link.to,
    target: link.target
  }))
)

const languageItems = computed<DropdownMenuItem[]>(() =>
  locales.value.map((item) => {
    return {
      label: item.name || item.code,
      icon: item.code === locale.value ? 'i-lucide-check' : undefined,
      active: item.code === locale.value,
      onSelect: () => {
        if (item.code !== locale.value) {
          void setLocale(item.code)
        }
      }
    }
  })
)
</script>

<template>
  <header class="sticky top-0 z-20 -mx-4 border-b border-default bg-default/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div class="flex items-center justify-between gap-4">
      <NuxtLink
        :to="localePath('/')"
        class="flex min-w-0 items-center gap-3"
        :aria-label="`${global.name} home`"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-inverted shadow-sm ring-2 ring-[var(--cafe-spark)]/60">
          <UIcon
            name="i-lucide-sprout"
            class="size-5"
          />
        </span>
        <span class="min-w-0">
          <span class="block truncate font-serif text-lg font-medium tracking-tight text-highlighted">{{ global.name }}</span>
          <span class="block truncate font-mono text-[0.7rem] tracking-wide text-muted">{{ global.address }}</span>
        </span>
      </NuxtLink>

      <div class="hidden items-center gap-2 md:flex">
        <UNavigationMenu
          :items="links"
          variant="link"
          color="neutral"
          highlight
          highlight-color="primary"
          :ui="{
            link: 'px-3 py-2',
            linkLeadingIcon: 'size-4'
          }"
        />
        <UDropdownMenu :items="languageItems">
          <UButton
            icon="i-lucide-languages"
            color="neutral"
            variant="ghost"
            :label="t('language.label')"
            :aria-label="t('language.switch')"
            class="px-2"
          />
        </UDropdownMenu>
        <ColorModeButton />
      </div>

      <div class="flex items-center gap-1 md:hidden">
        <UDropdownMenu :items="languageItems">
          <UButton
            icon="i-lucide-languages"
            color="neutral"
            variant="ghost"
            :aria-label="t('language.switch')"
          />
        </UDropdownMenu>
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
