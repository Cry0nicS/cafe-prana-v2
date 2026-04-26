<script setup lang="ts">
type Category = {
  id: string
  title: string
  description?: string
  options?: string
  icon?: string
}

const [{ data: page }, { data: items }] = await Promise.all([
  useAsyncData('menu-page', () => queryCollection('menuPage').first()),
  useAsyncData('menu-items', () => queryCollection('menuItems').order('order', 'ASC').all())
])

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu page not found',
    fatal: true
  })
}

if (!items.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu items not found',
    fatal: true
  })
}

useSeoMeta({
  title: page.value.seo.title,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description,
  ogImage: page.value.seo.ogImage
})

const labelLookup = computed(() =>
  Object.fromEntries((page.value?.labels ?? []).map(label => [label.id, label]))
)

const categoriesWithItems = computed(() =>
  page.value!.categories.map((category: Category) => ({
    ...category,
    items: items.value!.filter(item => item.category === category.id)
  })).filter(category => category.items.length)
)

const totalItems = computed(() => items.value?.length ?? 0)

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
      :links="page.hero.links"
      orientation="horizontal"
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20',
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
          :key="category.id"
          :icon="category.icon"
          color="neutral"
          variant="soft"
          size="sm"
          class="shrink-0"
          @click="scrollToCategory(category.id)"
        >
          {{ category.title }}
        </UButton>
      </div>
    </nav>

    <UPageSection
      :ui="{
        container: 'pt-8 sm:pt-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10'
      }"
    >
      <aside class="hidden lg:block">
        <div class="sticky top-24 rounded-lg border border-default bg-elevated/70 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            {{ totalItems }} items
          </p>
          <ul class="mt-4 space-y-1">
            <li
              v-for="category in categoriesWithItems"
              :key="category.id"
            >
              <UButton
                :icon="category.icon"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="scrollToCategory(category.id)"
              >
                {{ category.title }}
              </UButton>
            </li>
          </ul>
        </div>
      </aside>

      <div class="space-y-14">
        <section
          v-for="category in categoriesWithItems"
          :id="category.id"
          :key="category.id"
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

          <div class="grid gap-4 xl:grid-cols-2">
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
