<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// The owner's story, beside her photo set as a print: a white border, a
// little crooked, as if it had been laid on the table.
const photo = {
  zoom: false,
  format: 'webp',
  sizes: 'sm:100vw md:440px',
  loading: 'lazy',
  class: 'my-0 aspect-[4/5] w-full rounded-none object-cover object-[50%_25%] shadow-none ring-0'
}
</script>

<template>
  <SlotParts
    v-slot="{ title, body, media }"
    :nodes="$slots.default?.()"
  >
    <section class="bg-elevated/60 py-20 sm:py-28">
      <UContainer class="grid items-center gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div
          v-if="media.length"
          class="mx-auto w-full max-w-md -rotate-2 bg-white p-3 pb-14 shadow-[0_40px_70px_-30px_rgba(20,58,45,0.55)] sm:p-4 sm:pb-16"
        >
          <Nodes
            :nodes="media.slice(0, 1)"
            :extra="photo"
          />
        </div>
        <div class="max-w-2xl">
          <div class="home-title">
            <Nodes :nodes="title" />
          </div>
          <div class="home-story mt-8 text-[1.0625rem] leading-8 text-muted">
            <Nodes :nodes="body" />
          </div>
        </div>
      </UContainer>
    </section>
  </SlotParts>
</template>
