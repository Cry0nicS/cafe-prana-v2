<script setup lang="ts">
import { parseVideoUrl } from '~/utils/video'

// `url` and `title` are required: that is the authoring contract Studio reads
// off the component and puts on its form. The template still guards against both
// being absent, because a markdown body can always omit a prop and a published
// page must degrade rather than break.
const props = defineProps<{
  /** A YouTube or Vimeo link, exactly as the share sheet hands it over. */
  url: string
  /** What the video shows. Read aloud, and printed under the frame. */
  title: string
  /** Optional still from the media library. Without one, the frame is drawn. */
  poster?: { src?: string, alt?: string }
}>()

const { t } = useI18n()

const video = computed(() => parseVideoUrl(props.url))
const playing = ref(false)
const caption = computed(() => props.title?.trim() || '')

// Nothing is requested from a video host until this runs. Before it, the frame
// is a still and a button; the cafe's pages stay a two-request affair for the
// guests who never press play.
const play = () => {
  if (video.value) {
    playing.value = true
  }
}
</script>

<template>
  <figure class="my-10">
    <div
      class="group relative aspect-video w-full overflow-hidden rounded-2xl bg-elevated shadow-xl ring-1 ring-default"
    >
      <template v-if="playing && video">
        <iframe
          :src="video.embedUrl"
          :title="caption || t('content.video.play')"
          class="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </template>

      <template v-else>
        <NuxtImg
          v-if="poster?.src"
          :src="poster.src"
          :alt="poster.alt || ''"
          class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="sm:100vw lg:768px"
          format="webp"
          placeholder
        />

        <!-- No still: the hero's breathing aura stands in, so an empty frame is
             still the cafe rather than a grey box. -->
        <template v-else>
          <div class="absolute inset-0 bg-gradient-to-br from-elevated via-muted to-accented/60" />
          <div class="cafe-aura" />
        </template>

        <!-- A scrim only where there is a photo to sit on. -->
        <div
          v-if="poster?.src"
          class="absolute inset-0 bg-gradient-to-t from-paper-950/45 via-paper-950/10 to-transparent"
        />

        <button
          v-if="video"
          type="button"
          class="absolute inset-0 grid cursor-pointer place-items-center rounded-2xl outline-primary/40 focus-visible:outline-3 focus-visible:outline-offset-2"
          :aria-label="caption ? `${t('content.video.play')}: ${caption}` : t('content.video.play')"
          @click="play"
        >
          <span
            class="grid size-16 place-items-center rounded-full bg-default/85 shadow-xl ring-1 ring-default backdrop-blur-sm transition duration-300 group-hover:scale-105 group-hover:ring-primary sm:size-20"
          >
            <UIcon
              name="i-lucide-play"
              class="size-6 translate-x-[2px] text-primary sm:size-7"
            />
          </span>
        </button>

        <!-- The link did not parse. Never a broken frame on a published page:
             the guest still gets the title and a way to reach the video. -->
        <div
          v-else
          class="absolute inset-0 grid place-items-center p-6 text-center"
        >
          <div class="space-y-3">
            <UIcon
              name="i-lucide-video-off"
              class="size-7 text-dimmed"
            />
            <p class="text-sm text-muted">
              {{ t('content.video.unavailable') }}
            </p>
            <ULink
              v-if="url"
              :to="url"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-sm text-primary underline decoration-primary/40 underline-offset-[0.19em] hover:decoration-primary"
            >
              {{ t('content.video.open') }}
              <UIcon
                name="i-lucide-external-link"
                class="size-3.5"
              />
            </ULink>
          </div>
        </div>
      </template>
    </div>

    <figcaption
      v-if="caption"
      class="mt-3 text-sm text-muted"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
