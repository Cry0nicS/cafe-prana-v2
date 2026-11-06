<script setup lang="ts">
const { locale, t } = useI18n()

const [{ data: page }, { data: categories }, { data: items }] = await Promise.all([
  useAsyncData(
    `menu-page-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'menuPageDe' : 'menuPageEn').first(),
    { watch: [locale] }
  ),
  useAsyncData(
    `menu-categories-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'menuCategoriesDe' : 'menuCategoriesEn').order('order', 'ASC').all(),
    { watch: [locale] }
  ),
  useAsyncData(
    `menu-items-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'menuItemsDe' : 'menuItemsEn').order('order', 'ASC').all(),
    { watch: [locale] }
  )
])

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu page not found',
    fatal: true
  })
}

useCafeSeo({
  title: () => t('seo.menu.title'),
  description: () => t('seo.menu.description'),
  image: '/images/hero.webp'
})

const labelLookup = computed(() =>
  Object.fromEntries((page.value?.labels ?? []).map(label => [label.id, label]))
)

const categoriesWithItems = computed(() =>
  (categories.value ?? []).map(category => ({
    ...category,
    items: (items.value ?? []).filter(item => item.category === category.slug)
  })).filter(category => category.items.length)
)

const tabs = computed(() =>
  categoriesWithItems.value.map(({ slug, title, icon, items }) => ({ slug, title, icon, count: items.length }))
)

// One category at a time. The URL keeps `#<category>`, so a link from the
// homepage or a shared link opens the right one, and switching updates it.
const route = useRoute()
const current = ref(categoriesWithItems.value[0]?.slug ?? '')
const panels = useTemplateRef<HTMLElement>('panels')

onMounted(() => {
  const fromHash = route.hash.slice(1)
  if (categoriesWithItems.value.some(c => c.slug === fromHash)) {
    current.value = fromHash
  }
})

watch(current, (slug) => {
  history.replaceState(history.state, '', `#${slug}`)
  // Down the list, a switch would leave the guest in the middle of the new
  // category; bring them back to its top, just under the sticky switch.
  if (panels.value && panels.value.getBoundingClientRect().top < 0) {
    panels.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<template>
  <div
    v-if="page"
    class="pb-28"
  >
    <PageHeading
      :headline="page.hero.headline"
      :title="page.hero.title"
      :description="page.hero.description"
    >
      <p class="mt-8 inline-flex items-center gap-3 rounded-full bg-primary/8 px-4 py-2 text-sm text-toned ring-1 ring-primary/15">
        <UIcon
          name="i-lucide-leaf"
          class="size-4 shrink-0 text-primary"
        />
        {{ t('event.dietary') }}
      </p>
      <template
        v-if="page.hero.image?.src"
        #aside
      >
        <NuxtImg
          v-bind="page.hero.image"
          format="webp"
          sizes="sm:100vw md:50vw lg:560px"
          class="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/15 ring-1 ring-default"
          fetchpriority="high"
          preload
        />
      </template>
    </PageHeading>

    <div class="sticky top-[73px] z-10 -mx-4 mt-4 border-y border-default bg-default/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <MenuCategoryTabs
        v-model="current"
        :categories="tabs"
      />
    </div>

    <!-- Every category is in the page, so search engines and the image
         prerender see the whole menu; only the chosen one is shown. -->
    <div
      ref="panels"
      class="scroll-mt-36"
    >
      <Transition
        v-for="category in categoriesWithItems"
        :key="category.slug"
        enter-active-class="transition duration-400 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0 translate-y-3"
      >
        <section
          v-show="current === category.slug"
          :id="category.slug"
          role="tabpanel"
          :aria-labelledby="`menu-tab-${category.slug}`"
          class="px-2 pt-12 sm:px-6"
        >
          <h2 class="font-serif text-3xl font-medium text-highlighted sm:text-4xl">
            {{ category.title }}
          </h2>
          <p
            v-if="category.description"
            class="mt-2 max-w-xl text-muted"
          >
            {{ category.description }}
          </p>

          <p
            v-if="category.options"
            class="cafe-surface mt-6 flex items-start gap-3 p-4 text-sm leading-6 text-toned"
          >
            <UIcon
              name="i-lucide-info"
              class="mt-0.5 size-4 shrink-0 text-primary"
            />
            {{ category.options }}
          </p>

          <ul class="mt-8 space-y-4">
            <li
              v-for="item in category.items"
              :key="item.id"
            >
              <MenuItemCard
                :item="item"
                :labels="labelLookup"
              />
            </li>
          </ul>
        </section>
      </Transition>
    </div>
  </div>
</template>
