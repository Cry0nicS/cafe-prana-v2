<script setup lang="ts">
// The switch between the menu's categories, each with its number of dishes.
// One category shows at a time, so the page stays short on a phone.
const model = defineModel<string>({ required: true })

const props = defineProps<{
  categories: { slug: string, title: string, icon?: string, count: number }[]
}>()

// Arrow keys move between the tabs, as in any tablist, wrapping at the ends.
const tabRefs = useTemplateRef<HTMLButtonElement[]>('tab')
const step = (by: number) => {
  const slugs = props.categories.map(c => c.slug)
  const next = (slugs.indexOf(model.value) + by + slugs.length) % slugs.length
  model.value = slugs[next]!
  tabRefs.value?.[next]?.focus()
}

// On a phone the switch is wider than the screen; keep the chosen tab in
// sight, including when a `#<category>` link picks one off to the side.
const list = useTemplateRef<HTMLElement>('list')
const reveal = () => {
  const tab = tabRefs.value?.[props.categories.findIndex(c => c.slug === model.value)]
  if (!list.value || !tab) return
  const { offsetLeft, offsetWidth } = tab
  const { scrollLeft, clientWidth } = list.value
  if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
    list.value.scrollTo({ left: offsetLeft - (clientWidth - offsetWidth) / 2, behavior: 'smooth' })
  }
}
watch(model, () => nextTick(reveal))
onMounted(reveal)
</script>

<template>
  <div
    ref="list"
    role="tablist"
    :aria-label="$t('nav.menu')"
    class="relative mx-auto flex w-full max-w-full gap-1 overflow-x-auto rounded-full bg-elevated/80 p-1 ring-1 ring-default sm:w-fit"
    @keydown.left.prevent="step(-1)"
    @keydown.right.prevent="step(1)"
  >
    <button
      v-for="category in categories"
      :id="`menu-tab-${category.slug}`"
      :key="category.slug"
      ref="tab"
      role="tab"
      type="button"
      :aria-selected="model === category.slug"
      :aria-controls="category.slug"
      :tabindex="model === category.slug ? 0 : -1"
      class="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary"
      :class="model === category.slug ? 'bg-default text-highlighted shadow-sm ring-1 ring-default' : 'text-muted hover:text-highlighted'"
      @click="model = category.slug"
    >
      <UIcon
        v-if="category.icon"
        :name="category.icon"
        class="size-4"
        :class="model === category.slug ? 'text-primary' : ''"
      />
      {{ category.title }}
      <span
        class="min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-xs transition-colors duration-200"
        :class="model === category.slug ? 'bg-primary text-inverted' : 'bg-accented text-muted'"
      >{{ category.count }}</span>
    </button>
  </div>
</template>
