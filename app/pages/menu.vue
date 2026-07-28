<script setup lang="ts">
const { locale, t } = useI18n()

const [{ data: page }, { data: categories }, { data: items }] = await Promise.all([
  useAsyncData(
    `menu-page-${locale.value}`,
    () => queryCollection('menuPage').where('locale', '=', locale.value).first(),
    { watch: [locale] }
  ),
  useAsyncData(
    `menu-categories-${locale.value}`,
    () => queryCollection('menuCategories').where('locale', '=', locale.value).order('order', 'ASC').all(),
    { watch: [locale] }
  ),
  useAsyncData(
    `menu-items-${locale.value}`,
    () => queryCollection('menuItems').where('locale', '=', locale.value).order('order', 'ASC').all(),
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
  title: page.value.seo.title,
  description: page.value.seo.description,
  image: page.value.seo.ogImage
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
    <UPageHero
      :headline="page.hero.headline"
      :title="page.hero.title"
      :description="page.hero.description"
      :links="heroLinks"
      orientation="horizontal"
      :ui="{
        container: 'max-w-6xl! py-12 sm:py-16 lg:py-20',
        title: 'max-w-2xl text-left text-4xl font-semibold tracking-normal sm:text-5xl',
        description: 'max-w-xl text-left text-lg text-muted',
        links: 'justify-start'
      }"
    >
      <NuxtImg
        v-bind="page.hero.image"
        format="webp"
        sizes="sm:100vw md:50vw lg:560px"
        class="aspect-[16/11] w-full rounded-lg object-cover shadow-xl ring-1 ring-default"
        placeholder
      />
    </UPageHero>

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
        <div class="sticky top-24 rounded-lg border border-default bg-elevated/70 p-4">
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
              <h2 class="text-2xl font-semibold text-highlighted sm:text-3xl">
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
