import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

// Two projects, because the two halves of this app need very different setups:
//
// - `node` runs the shared Zod schemas, the Nitro routes and the email service
//   in plain Node. Nitro auto-imports are provided by `test/setup/nitro-globals`,
//   so no Nuxt build is involved and the suite stays fast.
// - `nuxt` runs the form components inside the Nuxt environment, which gives
//   them the real Nuxt UI components, i18n messages and app composables.
export default defineConfig(async () => ({
  test: {
    projects: [
      {
        resolve: {
          alias: [
            { find: /^#shared\//, replacement: `${root}shared/` },
            { find: /^~~\//, replacement: root },
            { find: /^~\//, replacement: `${root}app/` }
          ]
        },
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/{unit,server}/**/*.spec.ts'],
          setupFiles: ['./test/setup/nitro-globals.ts']
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['test/nuxt/**/*.spec.ts']
        }
      })
    ]
  }
}))
