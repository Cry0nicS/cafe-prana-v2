// The site's one entrance: content rises a little and fades in, on a soft
// ease-out. Spread onto a `<Motion>` with `v-bind`, so every page moves the
// same way and a change of feel has one home.
//
// Visitors who ask for reduced motion get the end state at once - that is
// `MotionConfig reduced-motion="user"` in `app.vue`, not something each call
// has to remember.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

// For what is on screen when the page opens: plays on load.
export const riseIn = (delay = 0, distance = 14) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE_OUT }
})

// For what is further down: plays once, as it scrolls into view.
export const riseInView = (delay = 0, distance = 14) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  inViewOptions: { once: true },
  transition: { duration: 0.5, delay, ease: EASE_OUT }
})
