<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// A centred `##` title, then every picture in the block as an even grid. The
// pictures are ordinary markdown images, so the owner adds one the way she
// adds a photo anywhere else. A tile crops to the grid; a click opens the
// whole picture, which is Nuxt UI's prose image doing its job.
const photo = {
  format: 'webp',
  sizes: 'sm:50vw md:33vw lg:400px',
  loading: 'lazy',
  class: 'my-0 aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-none ring-0'
}
</script>

<template>
  <SlotParts
    v-slot="{ title, body, media }"
    :nodes="$slots.default?.()"
  >
    <section class="bg-elevated/60 py-20 sm:py-28">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <div class="home-title">
            <Nodes :nodes="title" />
          </div>
          <div class="mt-4 text-lg text-muted">
            <Nodes :nodes="body" />
          </div>
        </div>
        <div class="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          <Nodes
            :nodes="media"
            :extra="photo"
          />
        </div>
      </UContainer>
    </section>
  </SlotParts>
</template>
