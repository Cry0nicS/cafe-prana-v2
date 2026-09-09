# Cafe Prana

A bilingual (English / German) café website whose content is edited by the café owner in Nuxt Studio and
stored as files in this repository. Publishing is a git commit; every visitor-facing page is prerendered.

## Language

### Content and locale

**Locale**:
One of the two languages the site is published in, named by its code: `en` or `de`. A locale is never a
field on a content file — it is the folder the file lives in, and therefore the collection it belongs to.
_Avoid_: language code, lang, i18n key

**Locale folder**:
A top-level folder under `content/` holding everything that exists **once per language** — `content/en/`
and `content/de/`. The folder is the only source of truth for a file's locale.
_Avoid_: language directory, translation folder

**Language-independent content**:
Content that exists **once, period**, and so lives at the `content/` root rather than in a locale folder:
the opening hours (one set for both languages) and the site notice (one schedule, with its text in `en:`
and `de:` blocks). Not an exception to the locale-folder rule — the other half of it.
_Avoid_: shared content, global content, common content

**Locale pair**:
The same piece of content in both locales, identified by carrying the **same filename** in each locale
folder. A pair shares one slug, which is what lets the language switcher move between the two.
_Avoid_: translation pair, sibling file, twin

**Unpaired content**:
Content that exists in one locale and not the other. Legitimate, not an error: it is simply absent from the
other language's listing, and the language switcher on its page 404s.
_Avoid_: missing translation, orphan, incomplete pair

**Slug**:
The last segment of a page's public address, taken from the content file's name with its locale folder
stripped. Never typed by the owner and never stored in a field.
_Avoid_: permalink, URL key, path segment

### Editing

**Owner**:
The café proprietor, who edits content in Nuxt Studio and is not a developer. The only editor the content
model is designed for.
_Avoid_: user, admin, client, editor

**Publish**:
The owner's act of committing edited content from Studio to `main`, which redeploys the site. Distinct from
saving, which only records a draft.
_Avoid_: deploy, push, release
