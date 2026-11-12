<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// A centred `##` title and a few words, the `::menu-highlight` blocks in a
// row, and the way to the full menu.
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <SlotParts
    v-slot="{ title, body, blocks }"
    :nodes="$slots.default?.()"
    block="menu-highlight"
  >
    <UContainer
      as="section"
      class="py-20 sm:py-28"
    >
      <div class="mx-auto max-w-2xl text-center">
        <div class="home-title">
          <Nodes :nodes="title" />
        </div>
        <div class="mt-4 text-lg text-muted">
          <Nodes :nodes="body" />
        </div>
      </div>
      <div class="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
        <Nodes
          :nodes="blocks"
          :extra="{}"
        />
      </div>
      <div class="mt-14 text-center">
        <UButton
          :to="localePath('/menu')"
          :label="t('home.menu.explore')"
          size="lg"
          color="neutral"
          variant="outline"
          class="px-6"
        />
      </div>
    </UContainer>
  </SlotParts>
</template>
