<script setup lang="ts">
type MenuLabel = {
  id: string
  label: string
  icon?: string
}

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

const { t } = useI18n()

const visibleLabels = computed(() =>
  props.item.labels?.map(label => props.labels[label]).filter((label): label is MenuLabel => Boolean(label)) ?? []
)

// Only an explicit `false` takes an item off. A file written before the field
// existed, or one a hand edit stripped it from, arrives as `undefined` and has
// to read as available - the safe direction, since the alternative is silently
// marking the whole menu unavailable. See `content.config.ts` for why the field
// is allowed to be absent in the first place.
const isUnavailable = computed(() => props.item.available === false)
</script>

<template>
  <article
    :data-availability="isUnavailable ? 'unavailable' : undefined"
    class="group min-w-0 overflow-hidden rounded-lg border border-default shadow-sm transition duration-200"
    :class="isUnavailable
      ? 'bg-muted/40'
      : 'bg-elevated/80 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'"
  >
    <div class="grid min-w-0 overflow-hidden sm:grid-cols-[160px_minmax(0,1fr)] md:grid-cols-1">
      <NuxtImg
        v-bind="item.image"
        format="webp"
        sizes="sm:100vw md:50vw lg:640px xl:420px"
        class="aspect-[4/3] h-full w-full object-cover transition duration-500 sm:aspect-auto md:aspect-[3/2] md:h-auto"
        :class="isUnavailable ? 'opacity-75 grayscale' : 'group-hover:scale-105'"
        placeholder
      />

      <div class="flex min-w-0 flex-col gap-4 p-4 sm:p-5 md:gap-3">
        <div class="flex min-w-0 items-start justify-between gap-4">
          <div class="min-w-0">
            <UBadge
              v-if="isUnavailable"
              color="neutral"
              variant="solid"
              size="sm"
              class="mb-2"
            >
              {{ t('menu.unavailable') }}
            </UBadge>
            <h3 class="font-serif text-xl font-medium leading-tight text-highlighted">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ item.description }}
            </p>
          </div>
          <UBadge
            :color="isUnavailable ? 'neutral' : 'primary'"
            variant="soft"
            size="lg"
            class="shrink-0 whitespace-nowrap font-mono font-bold tabular-nums"
          >
            {{ item.price }}€
          </UBadge>
        </div>

        <div
          v-if="visibleLabels.length"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="label in visibleLabels"
            :key="label.id"
            color="neutral"
            variant="subtle"
          >
            <UIcon
              v-if="label.icon"
              :name="label.icon"
              class="mr-1 size-3.5"
            />
            {{ label.label }}
          </UBadge>
        </div>

        <details class="group rounded-md bg-muted/60 px-3 py-2">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-highlighted">
            {{ t('menu.ingredients') }}
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ item.ingredients }}
          </p>
        </details>
      </div>
    </div>
  </article>
</template>
