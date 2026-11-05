import { MotionGlobalConfig } from 'motion-utils'

// Component tests check what renders, not how it moves. Under happy-dom an
// entrance animation cut short by an unmount rejects with an AbortError that
// nothing awaits, which Vitest reports as an unhandled error against whichever
// file happened to be running. Skipping animations renders every `<Motion>` in
// its end state at once - what a visitor with reduced motion sees anyway.
MotionGlobalConfig.skipAnimations = true
