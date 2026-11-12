<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// One dish: a photo, a `###` name and a line about it, all markdown.
const photo = {
  zoom: false,
  format: 'webp',
  sizes: 'sm:50vw md:50vw lg:300px',
  loading: 'lazy',
  class: 'my-0 aspect-square w-full rounded-[2rem] object-cover shadow-none ring-0'
}
</script>

<template>
  <SlotParts
    v-slot="{ title, body, media }"
    :nodes="$slots.default?.()"
  >
    <article class="text-center">
      <Nodes
        :nodes="media.slice(0, 1)"
        :extra="photo"
      />
      <div class="mt-5 font-serif text-xl leading-tight text-highlighted">
        <Nodes :nodes="title" />
      </div>
      <div class="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-muted">
        <Nodes :nodes="body" />
      </div>
    </article>
  </SlotParts>
</template>
