<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// Plain markdown: a `##` title, then each question as a `###` heading with
// its answer underneath. No block to insert; each `###` becomes a row that
// opens.
</script>

<template>
  <SlotParts
    v-slot="{ title, body, items }"
    :nodes="$slots.default?.()"
  >
    <section class="mx-auto max-w-2xl px-4 py-20 sm:py-28">
      <div class="home-title text-center">
        <Nodes :nodes="title" />
      </div>
      <div
        v-if="body.length"
        class="mt-5 text-center text-lg text-muted"
      >
        <Nodes :nodes="body" />
      </div>
      <div class="mt-10 divide-y divide-default border-y border-default">
        <details
          v-for="(item, index) in items"
          :key="index"
          class="group"
        >
          <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 font-serif text-lg text-highlighted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <Nodes :nodes="item.title" />
            <UIcon
              name="i-lucide-plus"
              class="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <div class="pb-6 leading-7 text-muted">
            <Nodes :nodes="item.body" />
          </div>
        </details>
      </div>
    </section>
  </SlotParts>
</template>
