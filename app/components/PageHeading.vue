<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { riseIn } from '~/utils/motion'

// The top of every page: a small mono label, the title in Fraunces, a quiet
// summary and the page's buttons, on the breathing green glow. One component,
// so a heading cannot drift from the others the way the old per-page
// `UPageHero` overrides did.
//
// Slots:
// - `before`   above the label (a back link)
// - `headline` replaces the label's text (a `<time>`)
// - default    under the buttons (a line of details)
// - `aside`    a second column beside the heading on wide screens
withDefaults(defineProps<{
  headline?: string
  title: string
  description?: string
  links?: ButtonProps[]
  align?: 'start' | 'center'
  // Where the `aside` moves beside the heading. The homepage waits until `xl`,
  // so its photo does not squeeze the title on a laptop.
  split?: 'lg' | 'xl'
}>(), {
  headline: undefined,
  description: undefined,
  links: () => [],
  align: 'start',
  split: 'lg'
})

const slots = useSlots()
</script>

<template>
  <section
    class="relative isolate px-2 pt-12 pb-14 sm:px-6 sm:pt-16 lg:pt-20"
    :class="slots.aside ? ['grid items-center gap-14', split === 'xl' ? 'xl:grid-cols-2' : 'lg:grid-cols-2'] : ''"
  >
    <div
      aria-hidden="true"
      class="cafe-glow"
    />

    <Motion
      v-bind="riseIn()"
      :class="align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'"
    >
      <slot name="before" />

      <p
        v-if="headline || slots.headline"
        class="cafe-eyebrow"
        :class="[align === 'center' ? 'justify-center' : '', slots.before ? 'mt-12' : '']"
      >
        <slot name="headline">
          {{ headline }}
        </slot>
      </p>

      <h1 class="mt-5 font-serif text-4xl leading-[1.05] font-medium tracking-tight text-balance text-highlighted sm:text-5xl lg:text-6xl">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-6 text-lg leading-8 text-pretty text-muted"
        :class="align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl'"
      >
        {{ description }}
      </p>

      <div
        v-if="links.length"
        class="mt-9 flex flex-wrap gap-3"
        :class="align === 'center' ? 'justify-center' : ''"
      >
        <UButton
          v-for="link in links"
          :key="String(link.label ?? link.to)"
          v-bind="link"
          size="lg"
          class="px-5"
        />
      </div>

      <slot />
    </Motion>

    <slot name="aside" />
  </section>
</template>
