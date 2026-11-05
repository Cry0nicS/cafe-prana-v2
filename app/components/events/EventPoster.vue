<script setup lang="ts">
// An event's image, shown whole in a frame of any shape.
//
// Most event images are portrait posters with their title and date printed on
// them, and the rest are ordinary photos. Cropping a poster into a landscape
// frame cuts its text off, so instead a blurred, enlarged copy fills the frame
// as a soft backdrop and the image itself sits on top, uncropped. Every frame
// in a list then has the same shape whatever was uploaded.
//
// The frame's shape and corners come from the caller's class.
withDefaults(defineProps<{
  src?: string | null
  alt?: string | null
  sizes?: string
  // Breathing room around the image inside the frame.
  inset?: string
}>(), {
  src: null,
  alt: null,
  sizes: 'sm:100vw md:50vw lg:400px',
  inset: 'p-2'
})
</script>

<template>
  <div class="relative isolate overflow-hidden bg-elevated">
    <template v-if="src">
      <NuxtImg
        :src="src"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-70 blur-2xl saturate-150 dark:opacity-45"
        width="64"
        format="webp"
        loading="lazy"
      />
      <NuxtImg
        :src="src"
        :alt="alt || ''"
        class="size-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.22)] transition duration-500 ease-out group-hover:scale-[1.03]"
        :class="inset"
        :sizes="sizes"
        format="webp"
        loading="lazy"
      />
    </template>
    <!-- An event whose photo has not been chosen yet. The frame stays, so one
         missing photo does not leave a ragged hole in the list. -->
    <div
      v-else
      data-photo="pending"
      class="grid size-full place-items-center bg-gradient-to-br from-chlorophyll-100 via-elevated to-cacao-100 dark:from-chlorophyll-950 dark:via-elevated dark:to-cacao-950"
    >
      <UIcon
        name="i-lucide-sprout"
        class="size-7 text-primary/60"
      />
    </div>
  </div>
</template>
