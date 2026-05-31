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
}

const props = defineProps<{
  item: MenuItem
  labels: Record<string, MenuLabel>
}>()

const { t } = useI18n()

const visibleLabels = computed(() =>
  props.item.labels?.map(label => props.labels[label]).filter((label): label is MenuLabel => Boolean(label)) ?? []
)
</script>

<template>
  <article class="min-w-0 overflow-hidden rounded-lg border border-default bg-elevated/80 shadow-sm">
    <div class="grid min-w-0 sm:grid-cols-[160px_minmax(0,1fr)] md:grid-cols-1">
      <NuxtImg
        v-bind="item.image"
        format="webp"
        sizes="sm:100vw md:50vw lg:640px xl:420px"
        class="aspect-[4/3] h-full w-full object-cover sm:aspect-auto md:aspect-[3/2] md:h-auto"
        placeholder
      />

      <div class="flex min-w-0 flex-col gap-4 p-4 sm:p-5 md:gap-3">
        <div class="flex min-w-0 items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="text-lg font-semibold leading-tight text-highlighted">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ item.description }}
            </p>
          </div>
          <UBadge
            color="primary"
            variant="soft"
            size="lg"
            class="shrink-0 whitespace-nowrap"
          >
            {{ item.price }}
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
