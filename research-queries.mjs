// Runs the queries the sibling tickets care about against the built content DB.
import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'

const sql = readFileSync('node_modules/.cache/nuxt/.nuxt/content/sql_dump.txt', 'utf8')
const db = new Database(':memory:')
for (const stmt of sql.split('\n')) {
  const s = stmt.replace(/ -- [a-z0-9]+$/i, '').trim()
  if (s) { try { db.exec(s) } catch { /* structure lines only */ } }
}

const show = (label, q) => {
  console.log(`\n${label}\n  ${q}`)
  for (const r of db.prepare(q).all()) console.log('  ->', JSON.stringify(r))
}

// Q2: locale filtering by stem prefix (the sibling ticket's fallback plan)
show('de events by stem prefix', `SELECT stem, path FROM _content_events WHERE stem LIKE 'de/events/%' ORDER BY stem`)
show('en events by stem prefix', `SELECT stem, path FROM _content_events WHERE stem NOT LIKE 'de/%' ORDER BY stem`)

// Q3: path() — queryCollection('events').path(x) is where('path','=',x)
show('path() for a de event', `SELECT stem, path, title FROM _content_events WHERE path = '/de/events/deep-talk-aperitivo'`)
show('path() for the de homepage', `SELECT stem, path FROM _content_index WHERE path = '/de'`)
show('path() for the en homepage', `SELECT stem, path FROM _content_index WHERE path = '/'`)

// Q4: what the sitemap route selects (path IS NOT NULL AND sitemap IS NOT NULL)
show('sitemap candidate rows (events)', `SELECT path, sitemap FROM _content_events WHERE path IS NOT NULL AND sitemap IS NOT NULL ORDER BY path`)
show('sitemap candidate rows (singletons)', `SELECT path, sitemap FROM _content_index WHERE path IS NOT NULL AND sitemap IS NOT NULL
  UNION ALL SELECT path, sitemap FROM _content_menuPage WHERE path IS NOT NULL AND sitemap IS NOT NULL
  UNION ALL SELECT path, sitemap FROM _content_eventsPage WHERE path IS NOT NULL AND sitemap IS NOT NULL`)
