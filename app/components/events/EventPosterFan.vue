<script setup lang="ts">
// Up to three event posters fanned like cards on a table, beside the events
// page heading. The first one sits on top in the middle; the next two tuck in
// behind, left and right, and spread apart on hover.
type FanPoster = {
  // Where the card links. A poster without one (the page's own image) is not
  // a link.
  to?: string
  label: string
  src: string
  alt?: string
}

defineProps<{
  posters: FanPoster[]
}>()

const NuxtLink = resolveComponent('NuxtLink')

const layer = ['z-20', 'z-10', 'z-0']
const pose = [
  'group-hover/fan:-translate-y-3',
  '-rotate-[9deg] -translate-x-[58%] translate-y-6 group-hover/fan:-rotate-[13deg] group-hover/fan:-translate-x-[78%]',
  'rotate-[9deg] translate-x-[58%] translate-y-6 group-hover/fan:rotate-[13deg] group-hover/fan:translate-x-[78%]'
]
</script>

<template>
  <div class="group/fan relative mx-auto grid h-[26rem] w-full max-w-md place-items-center sm:h-[30rem]">
    <div
      aria-hidden="true"
      class="cafe-aura"
    />
    <Motion
      v-for="(poster, i) in posters.slice(0, 3)"
      :key="poster.src + i"
      class="absolute w-[46%] sm:w-[50%]"
      :class="layer[i]"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }"
    >
      <component
        :is="poster.to ? NuxtLink : 'div'"
        :to="poster.to"
        :aria-label="poster.to ? poster.label : undefined"
        class="block overflow-hidden rounded-2xl bg-default shadow-2xl shadow-black/20 ring-1 ring-black/5 transition duration-500 ease-[cubic-bezier(.3,.7,.2,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none dark:ring-white/10"
        :class="pose[i]"
      >
        <EventsEventPoster
          :src="poster.src"
          :alt="poster.alt"
          class="aspect-[9/14]"
          inset="p-0"
          sizes="sm:50vw lg:240px"
        />
      </component>
    </Motion>
  </div>
</template>
