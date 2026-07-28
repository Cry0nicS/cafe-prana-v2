<script setup lang="ts">
defineProps<{
  headline?: string
  title?: string
  description?: string
  image?: { src?: string, alt?: string }
}>()

const { t } = useI18n()

const links = computed(() => [
  {
    label: t('home.hero.menu'),
    to: '#menu',
    icon: 'i-lucide-sparkles',
    color: 'primary' as const,
    size: 'xl' as const
  },
  {
    label: t('home.hero.directions'),
    to: '#directions',
    icon: 'i-lucide-map',
    color: 'neutral' as const,
    variant: 'outline' as const,
    size: 'xl' as const
  }
])
</script>

<template>
  <UPageHero
    :headline="headline"
    :title="title"
    :description="description"
    :links="links"
    orientation="horizontal"
    :ui="{
      container: 'py-12 sm:py-16 lg:py-24',
      title: 'max-w-2xl text-left text-4xl font-semibold tracking-normal sm:text-5xl',
      description: 'max-w-xl text-left text-lg text-muted',
      links: 'justify-start'
    }"
  >
    <NuxtImg
      v-if="image?.src"
      :src="image.src"
      :alt="image.alt"
      format="webp"
      sizes="sm:100vw md:50vw lg:560px"
      class="aspect-[16/11] w-full rounded-lg object-cover shadow-xl ring-1 ring-default"
      placeholder
    />
  </UPageHero>
</template>
