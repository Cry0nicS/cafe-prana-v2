<script setup lang="ts">
import { distinctLabels, formatMenuPrice, type MenuLabel } from '~/utils/menu'

type MenuItem = {
  title: string
  description: string
  ingredients: string
  price: string
  image: {
    src: string
    alt: string
  }
  labels?: string[]
  available?: boolean
}

const props = defineProps<{
  item: MenuItem
  labels: Record<string, MenuLabel>
}>()

const { locale, t } = useI18n()

const price = computed(() => formatMenuPrice(props.item.price, locale.value))
const shownLabels = computed(() => distinctLabels(props.item.labels, props.labels))

// Only an explicit `false` takes an item off. A file written before the field
// existed, or one a hand edit stripped it from, arrives as `undefined` and has
// to read as available - the safe direction, since the alternative is silently
// marking the whole menu unavailable. See `content.config.ts` for why the field
// is allowed to be absent in the first place.
const isUnavailable = computed(() => props.item.available === false)
</script>

<template>
  <!-- One dish as a soft row, like an event in the events list: the photo in
       the same 16:10 frame, the name and story, the price set large. -->
  <article
    :data-availability="isUnavailable ? 'unavailable' : undefined"
    class="cafe-surface grid grid-cols-1 items-center gap-5 p-3 transition duration-300 ease-out sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:gap-6 sm:pr-6 lg:grid-cols-[13rem_minmax(0,1fr)_auto]"
    :class="isUnavailable ? 'opacity-70' : 'hover:bg-elevated/70'"
  >
    <NuxtImg
      v-bind="item.image"
      format="webp"
      sizes="sm:100vw md:208px"
      class="aspect-[16/10] w-full rounded-2xl object-cover"
      :class="isUnavailable ? 'grayscale' : ''"
      loading="lazy"
    />

    <div class="min-w-0 px-2 pb-2 sm:px-0 sm:pb-0">
      <div class="flex items-baseline justify-between gap-4 sm:block">
        <h3 class="font-serif text-xl leading-snug font-medium text-highlighted sm:text-2xl">
          {{ item.title }}
        </h3>
        <span class="shrink-0 font-mono text-lg whitespace-nowrap text-highlighted tabular-nums sm:hidden">
          {{ price }}
        </span>
      </div>
      <p class="mt-1.5 max-w-xl text-sm leading-6 text-muted">
        {{ item.description }}
      </p>
      <p class="mt-1 max-w-xl text-xs leading-5 text-dimmed">
        <span class="sr-only">{{ t('menu.ingredients') }}: </span>{{ item.ingredients }}
      </p>
      <div
        v-if="isUnavailable || shownLabels.length"
        class="mt-3 flex flex-wrap gap-2 text-xs"
      >
        <span
          v-if="isUnavailable"
          class="rounded-full bg-accented px-2.5 py-1 font-medium whitespace-nowrap text-toned"
        >{{ t('menu.unavailable') }}</span>
        <span
          v-for="label in shownLabels"
          :key="label.id"
          class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 whitespace-nowrap text-primary"
        >
          <UIcon
            v-if="label.icon"
            :name="label.icon"
            class="size-3.5"
          />
          {{ label.label }}
        </span>
      </div>
    </div>

    <!-- Shown here on a wide screen, beside the name on a phone. Only one of
         the two is ever displayed, so a screen reader hears the price once. -->
    <span
      class="hidden font-serif text-3xl whitespace-nowrap text-highlighted tabular-nums sm:block"
    >
      {{ price }}
    </span>
  </article>
</template>
