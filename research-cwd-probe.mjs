// Replicates @nuxt/content's own cwd resolution (dist/module.mjs:1973) to show
// what each `cwd` spelling resolves to. `rootDir` is nuxt.options.rootDir.
import { existsSync } from 'node:fs'
import { normalize } from 'pathe'

const rootDir = process.cwd() // == nuxt.options.rootDir for this project

const resolve = cwd => String(normalize(cwd)).replace(/^~~\//, rootDir)

for (const cwd of ['~~/content/en', '~/content/en', 'content/en', `${rootDir}/content/en`]) {
  const resolved = resolve(cwd)
  console.log(`${JSON.stringify(cwd).padEnd(30)} -> ${resolved}\n  exists: ${existsSync(resolved)}`)
}
