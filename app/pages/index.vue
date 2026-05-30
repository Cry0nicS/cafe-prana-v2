<script setup lang="ts">
const { locale } = useI18n()
const localizeLinks = useLocalizedLinks()

const { data: page } = await useAsyncData(
  `index-${locale.value}`,
  () => queryCollection('index').where('locale', '=', locale.value).first(),
  { watch: [locale] }
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
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

const heroLinks = computed(() => localizeLinks(page.value?.hero.links))
const menuLinks = computed(() => localizeLinks(page.value?.menu.links))
const eventLinks = computed(() => localizeLinks(page.value?.events.links))
const testimonialCta = computed(() => localizeLinks(page.value?.testimonials.cta ? [page.value.testimonials.cta] : [])[0])
const directionsLinks = computed(() => localizeLinks(page.value?.directions.links))
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
        container: 'py-12 sm:py-16 lg:py-24',
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

    <UPageSection
      :title="page.philosophy.title"
      :description="page.philosophy.description"
      :icon="page.philosophy.icon"
    >
      <UPageColumns>
        <UPageFeature
          v-for="feature in page.philosophy.features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
        />
      </UPageColumns>
    </UPageSection>

    <UPageSection
      id="menu"
      :title="page.menu.title"
      :description="page.menu.description"
      :icon="page.menu.icon"
    >
      <UPageGrid class="gap-6 lg:grid-cols-2">
        <UPageCard
          v-for="item in page.menu.items"
          :key="item.title"
          :title="item.title"
          :description="item.description"
          orientation="horizontal"
          reverse
          class="bg-muted/50"
          :ui="{ root: 'overflow-hidden', body: 'flex flex-col justify-center' }"
        >
          <NuxtImg
            v-bind="item.image"
            format="webp"
            sizes="sm:100vw md:360px lg:260px"
            class="aspect-[4/3] w-full rounded-lg object-cover"
            placeholder
          />
        </UPageCard>
      </UPageGrid>

      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <UButton
          v-for="link in menuLinks"
          :key="link.label"
          v-bind="link"
          class="justify-center"
        />
      </div>
    </UPageSection>

    <UPageSection
      :headline="page.events.headline"
      :title="page.events.title"
      :description="page.events.description"
      :icon="page.events.icon"
      :features="page.events.features"
      :links="eventLinks"
      orientation="horizontal"
    >
      <NuxtImg
        v-bind="page.events.image"
        format="webp"
        sizes="sm:100vw md:50vw lg:540px"
        class="aspect-[4/3] w-full rounded-lg object-cover shadow-lg ring-1 ring-default"
        placeholder
      />
    </UPageSection>

    <UPageSection
      :title="page.gallery.title"
      :description="page.gallery.description"
      :icon="page.gallery.icon"
    >
      <UCarousel
        v-slot="{ item }"
        :items="page.gallery.images"
        :autoplay="{ delay: 3500 }"
        loop
        :ui="{ item: 'basis-4/5 sm:basis-1/2 lg:basis-1/3' }"
        class="rounded-lg"
      >
        <NuxtImg
          v-bind="item"
          format="webp"
          sizes="sm:80vw md:50vw lg:360px"
          class="aspect-[4/5] w-full rounded-lg object-cover ring-1 ring-default"
          placeholder
        />
      </UCarousel>
    </UPageSection>

    <UPageSection
      :title="page.story.title"
      :icon="page.story.icon"
      orientation="horizontal"
      reverse
    >
      <template #description>
        <p class="text-muted text-justify leading-7">
          {{ page.story.description }}
        </p>
      </template>

      <NuxtImg
        v-bind="page.story.image"
        format="webp"
        sizes="sm:100vw md:50vw lg:460px"
        class="aspect-[2/3] w-full rounded-lg object-cover shadow-lg ring-1 ring-default"
        placeholder
      />
    </UPageSection>

    <UPageSection
      :title="page.testimonials.title"
      :description="page.testimonials.description"
      :icon="page.testimonials.icon"
    >
      <UPageGrid class="gap-6 lg:grid-cols-3">
        <UPageCard
          v-for="testimonial in page.testimonials.items"
          :key="`${testimonial.author}-${testimonial.quote}`"
          class="bg-muted/50"
        >
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex text-primary">
              <UIcon
                v-for="star in testimonial.rating"
                :key="star"
                name="i-lucide-star"
                class="size-4 fill-current"
              />
            </div>
            <span
              v-if="testimonial.relativeTime"
              class="text-xs text-muted"
            >
              {{ testimonial.relativeTime }}
            </span>
          </div>
          <p class="text-muted italic">
            "{{ testimonial.quote }}"
          </p>
          <p class="mt-4 text-sm font-medium">
            {{ testimonial.author }}
          </p>
        </UPageCard>
      </UPageGrid>

      <div class="flex justify-center">
        <UButton
          v-bind="testimonialCta"
          class="justify-center"
        />
      </div>
    </UPageSection>

    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
      :icon="page.faq.icon"
      orientation="horizontal"
    >
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
      />
    </UPageSection>

    <UPageCTA
      :id="page.directions.id"
      :title="page.directions.title"
      :links="directionsLinks"
      orientation="horizontal"
      variant="outline"
      class="mb-24 overflow-hidden"
    >
      <template #description>
        <p>{{ page.directions.description }}</p>
        <div class="mt-6 max-w-md">
          <h3 class="font-semibold text-highlighted">
            {{ page.directions.hours.heading }}
          </h3>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in page.directions.hours.items"
              :key="item.day"
              class="flex items-center justify-between gap-4 border-b border-default pb-2"
            >
              <span>{{ item.day }}</span>
              <UBadge
                variant="soft"
                :color="item.closed ? 'error' : 'success'"
              >
                {{ item.time }}
              </UBadge>
            </li>
          </ul>
        </div>
      </template>

      <iframe
        :src="page.directions.mapEmbedUrl"
        width="100%"
        class="h-[420px] w-full rounded-lg border-0 lg:h-full"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Café Prana map"
      />
    </UPageCTA>
  </UPage>
</template>
