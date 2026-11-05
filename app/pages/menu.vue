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

const totalItems = computed(() => items.value?.length ?? 0)

const heroLinks = computed(() =>
  categoriesWithItems.value.map((category, index) => ({
    label: category.title,
    to: `#${category.slug}`,
    icon: category.icon,
    color: 'neutral' as const,
    variant: index === 0 ? 'solid' as const : 'outline' as const
  }))
)

function scrollToCategory(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <UPage v-if="page">
    <PageHeading
      :headline="page.hero.headline"
      :title="page.hero.title"
      :description="page.hero.description"
      :links="heroLinks"
    >
      <template #aside>
        <NuxtImg
          v-bind="page.hero.image"
          format="webp"
          sizes="sm:100vw md:50vw lg:560px"
          class="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/15 ring-1 ring-default"
          placeholder
        />
      </template>
    </PageHeading>

    <nav class="sticky top-[73px] z-10 -mx-4 border-y border-default bg-default/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <div class="flex gap-2 overflow-x-auto">
        <UButton
          v-for="category in categoriesWithItems"
          :key="category.slug"
          :icon="category.icon"
          color="neutral"
          variant="soft"
          size="sm"
          class="shrink-0"
          @click="scrollToCategory(category.slug)"
        >
          {{ category.title }}
        </UButton>
      </div>
    </nav>

    <UPageSection
      :ui="{
        container: 'max-w-6xl! pt-8 sm:pt-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12'
      }"
    >
      <aside class="hidden lg:block">
        <div class="cafe-surface sticky top-24 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            {{ t('menu.itemCount', totalItems) }}
          </p>
          <ul class="mt-4 space-y-1">
            <li
              v-for="category in categoriesWithItems"
              :key="category.slug"
            >
              <UButton
                :icon="category.icon"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="scrollToCategory(category.slug)"
              >
                {{ category.title }}
              </UButton>
            </li>
          </ul>
        </div>
      </aside>

      <div class="min-w-0 space-y-14">
        <section
          v-for="category in categoriesWithItems"
          :id="category.slug"
          :key="category.slug"
          class="scroll-mt-32"
        >
          <div class="mb-6">
            <div class="flex items-center gap-3">
              <UIcon
                v-if="category.icon"
                :name="category.icon"
                class="size-6 text-primary"
              />
              <h2 class="font-serif text-2xl font-medium text-highlighted sm:text-3xl">
                {{ category.title }}
              </h2>
            </div>
            <p
              v-if="category.description"
              class="mt-3 max-w-2xl text-muted"
            >
              {{ category.description }}
            </p>
            <UAlert
              v-if="category.options"
              color="primary"
              variant="soft"
              icon="i-lucide-info"
              class="mt-4"
              :description="category.options"
            />
          </div>

          <div class="grid min-w-0 gap-5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MenuItemCard
              v-for="item in category.items"
              :key="item.id"
              :item="item"
              :labels="labelLookup"
            />
          </div>
        </section>
      </div>
    </UPageSection>
  </UPage>
</template>
