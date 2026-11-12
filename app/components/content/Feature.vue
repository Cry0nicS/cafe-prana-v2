<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// One point of a `::feature-grid`: a `###` title and a sentence or two,
// written as markdown. The icon is the only prop.
defineProps<{
  icon?: string
}>()
</script>

<template>
  <SlotParts
    v-slot="{ title, body }"
    :nodes="$slots.default?.()"
  >
    <div>
      <UIcon
        v-if="icon"
        :name="icon"
        class="mb-4 size-6 text-primary"
      />
      <div class="font-serif text-2xl leading-tight tracking-[-0.015em] text-highlighted">
        <Nodes :nodes="title" />
      </div>
      <div class="mt-3 leading-7 text-muted">
        <Nodes :nodes="body" />
      </div>
    </div>
  </SlotParts>
</template>
