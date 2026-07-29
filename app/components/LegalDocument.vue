<script setup lang="ts">
interface LegalSection {
  title: string
  paragraphs: string[]
  link?: { label: string, href: string }
}

interface LegalContact {
  heading: string
  lines: string[]
  email?: string
  phone?: string
  website?: string
}

defineProps<{
  title: string
  intro?: string
  updated?: string
  contact?: LegalContact
  sections: LegalSection[]
}>()
</script>

<template>
  <UPage>
    <UPageHero
      :title="title"
      :description="intro"
      :ui="{
        title: 'mx-0! text-left',
        description: 'mx-0! text-left'
      }"
    />

    <UPageSection :ui="{ container: 'pt-0!' }">
      <div class="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside
          v-if="contact"
          class="lg:sticky lg:top-24"
        >
          <div class="rounded-2xl border border-default bg-muted/40 p-6">
            <h2 class="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {{ contact.heading }}
            </h2>
            <address class="mt-4 space-y-0.5 text-sm not-italic leading-6 text-toned">
              <p
                v-for="line in contact.lines"
                :key="line"
              >
                {{ line }}
              </p>
            </address>
            <div class="mt-4 flex flex-col gap-2">
              <UButton
                v-if="contact.email"
                :to="`mailto:${contact.email}`"
                :label="contact.email"
                icon="i-lucide-mail"
                color="neutral"
                variant="outline"
                size="sm"
                class="justify-start"
              />
              <UButton
                v-if="contact.phone"
                :to="`tel:${contact.phone.replace(/\s+/g, '')}`"
                :label="contact.phone"
                icon="i-lucide-phone"
                color="neutral"
                variant="outline"
                size="sm"
                class="justify-start"
              />
              <UButton
                v-if="contact.website"
                :to="contact.website"
                target="_blank"
                :label="contact.website.replace(/^https?:\/\//, '')"
                icon="i-lucide-globe"
                color="neutral"
                variant="outline"
                size="sm"
                class="justify-start"
              />
            </div>
          </div>
        </aside>

        <div class="max-w-2xl">
          <p
            v-if="updated"
            class="font-mono text-xs uppercase tracking-[0.2em] text-dimmed"
          >
            {{ updated }}
          </p>
          <div class="mt-6 space-y-9">
            <section
              v-for="section in sections"
              :key="section.title"
              class="space-y-3"
            >
              <h2 class="font-serif text-xl font-medium tracking-tight text-highlighted">
                {{ section.title }}
              </h2>
              <p
                v-for="(paragraph, index) in section.paragraphs"
                :key="index"
                class="whitespace-pre-line text-sm leading-7 text-muted"
              >
                {{ paragraph }}
              </p>
              <UButton
                v-if="section.link"
                :to="section.link.href"
                target="_blank"
                :label="section.link.label"
                icon="i-lucide-external-link"
                color="neutral"
                variant="link"
                size="sm"
                class="px-0"
              />
            </section>
          </div>
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
