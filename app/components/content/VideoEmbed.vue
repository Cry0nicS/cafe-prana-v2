<script setup lang="ts">
import { parseVideoSource } from '~/utils/video'

// `url` and `title` are required: that is the authoring contract Studio reads
// off the component and puts on its form. The template still guards against both
// being absent, because a markdown body can always omit a prop and a published
// page must degrade rather than break.
const props = defineProps<{
  /** A video from the media library (`/videos/frauenretreat.mp4`), or a YouTube or Vimeo link exactly as the share sheet hands it over. */
  url: string
  /** What the video shows. Read aloud, and printed under the frame. */
  title: string
  /** Optional still from the media library. Without one, the frame is drawn. */
  poster?: { src?: string, alt?: string }
}>()

const { t } = useI18n()
const { public: { videoThumbnails } } = useRuntimeConfig()

const source = computed(() => parseVideoSource(props.url))
const playing = ref(false)
// A file that parsed but would not load: deleted, renamed, or a format this
// browser cannot play. Treated like a link that did not parse.
const failed = ref(false)
const video = computed(() => (failed.value ? null : source.value))

// A YouTube video's own still, saved by the build and served from this site so
// the page load never contacts YouTube (see `modules/video-thumbnails.ts`).
// The owner's poster comes first; with neither, the frame is drawn.
const thumbnail = computed(() => {
  const embed = source.value

  return !props.poster?.src && embed?.kind === 'embed' && embed.provider === 'youtube' && videoThumbnails.includes(embed.id)
    ? `/video-thumbnails/${embed.id}.jpg`
    : null
})

// A file's shape is only known once the browser has read it, and the browser
// only reads it after the visitor presses play. So the frame is 16:9 until
// then and takes the file's own shape when it arrives: a portrait phone video
// is shown whole at a sensible height instead of cropped or as a thin strip.
const ratio = ref<number | null>(null)

// Studio's live preview edits `url` on a mounted component; the next value
// starts from the still, not from the previous video's shape.
watch(() => props.url, () => {
  playing.value = false
  failed.value = false
  ratio.value = null
})

const onError = () => {
  failed.value = true
  playing.value = false
}

const onMetadata = (event: Event) => {
  const { videoWidth, videoHeight } = event.target as HTMLVideoElement

  if (videoWidth && videoHeight) {
    ratio.value = videoWidth / videoHeight
  }
}

// Narrower than the column means portrait: cap the height at three quarters of
// the screen and let the width follow, centred.
const figureStyle = computed(() =>
  ratio.value && ratio.value < 1 ? { maxWidth: `min(100%, calc(75vh * ${ratio.value}))` } : undefined
)
const frameStyle = computed(() => (ratio.value ? { aspectRatio: String(ratio.value) } : undefined))
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
  <figure
    class="mx-auto my-10"
    :style="figureStyle"
  >
    <div
      class="group relative aspect-video w-full overflow-hidden rounded-2xl bg-elevated shadow-xl ring-1 ring-default"
      :style="frameStyle"
    >
      <template v-if="playing && video?.kind === 'file'">
        <video
          class="absolute inset-0 size-full bg-black object-contain"
          controls
          autoplay
          playsinline
          preload="metadata"
          :poster="poster?.src"
          :aria-label="caption || t('content.video.play')"
          @loadedmetadata="onMetadata"
          @error="onError"
        >
          <source
            :src="video.src"
            :type="video.type"
            @error="onError"
          >
        </video>
      </template>

      <template v-else-if="playing && video?.kind === 'embed'">
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

        <img
          v-else-if="thumbnail"
          :src="thumbnail"
          alt=""
          loading="lazy"
          decoding="async"
          class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
        >

        <!-- No still: the hero's breathing aura stands in, so an empty frame is
             still the cafe rather than a grey box. -->
        <template v-else>
          <div class="absolute inset-0 bg-gradient-to-br from-elevated via-muted to-accented/60" />
          <div class="cafe-aura" />
        </template>

        <!-- A scrim only where there is a photo to sit on. -->
        <div
          v-if="poster?.src || thumbnail"
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
