// Appends Markdown to the GitHub Actions run summary, and does nothing outside
// Actions. A CI log is not where a script's failure is read: the owner sees the
// run summary at best, so a failing check has to explain itself there.
import { appendFileSync } from 'node:fs'
import process from 'node:process'

export const summarise = (markdown: string) => {
  const path = process.env.GITHUB_STEP_SUMMARY

  if (path) {
    appendFileSync(path, `${markdown}\n`)
  }
}
