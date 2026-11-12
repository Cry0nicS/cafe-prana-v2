<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// A `##` title and a few words on the left, the `::feature` blocks in two
// columns on the right, on the tinted band.
</script>

<template>
  <SlotParts
    v-slot="{ title, body, blocks }"
    :nodes="$slots.default?.()"
    block="feature"
  >
    <section class="bg-elevated/60 py-20 sm:py-28">
      <UContainer class="grid gap-x-16 gap-y-12 lg:grid-cols-[4fr_8fr]">
        <div>
          <div class="home-title">
            <Nodes :nodes="title" />
          </div>
          <div class="mt-5 leading-7 text-muted">
            <Nodes :nodes="body" />
          </div>
        </div>
        <div class="grid gap-12 sm:grid-cols-2">
          <Nodes
            :nodes="blocks"
            :extra="{}"
          />
        </div>
      </UContainer>
    </section>
  </SlotParts>
</template>
