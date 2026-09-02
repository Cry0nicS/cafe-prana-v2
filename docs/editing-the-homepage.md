# Editing the homepage in Nuxt Studio

This guide is for the café owner. It explains how to change the homepage yourself — no developer needed. Everything you edit is saved to the website automatically.

## What you can change

On the homepage you can edit, add, remove, and reorder:

- The **welcome (hero)** text and photo
- The **“My Philosophy”** cards
- The **Menu Highlights** cards
- The **Community gatherings (events)** text, photo, and points
- The **Gallery** photos
- **My Story** text and photo
- The **FAQ** questions and answers
- The “Come taste the difference” text (the **opening hours** live in their own file, see below)

You do **not** need to worry about colours, buttons, icons, or layout — those are handled for you and always look right.

## Opening the editor

1. Go to your Nuxt Studio project and open the site.
2. In the pages list, open **Home** (there are two versions — **English** and **German** / `index.de`). You edit each language separately.
3. You’ll see the page the way visitors see it. Click any text to edit it.

## Editing text

Click into any heading or paragraph and type. Changes preview live.

## Adding a new element

This is the part that was missing before. Each repeatable block is a reusable component you can add as many times as you like:

1. Put your cursor where you want the new block.
2. Press **`/`** (slash) or click the **＋** button.
3. Choose the block you want:
   - **Feature** — a card with an icon, title, and description (used in *My Philosophy* and *Community gatherings*)
   - **Menu highlight** — a dish card with a photo, title, and description
   - **FAQ item** — one question and answer
4. Fill in the text. For the icon or photo fields, see below.

To **reorder**, drag the block by its handle. To **delete**, select it and remove it.

> Tip: because these are reusable, you can grow any section just by adding more of the same block — e.g. a fifth menu highlight or a sixth FAQ.

> The **Gallery** works differently: it's a single block with a **list of photos**. Click the
> gallery and add, remove, or reorder photos in its image list (each needs a short alt text) —
> you don't add gallery photos as separate blocks. Visitors swipe through them in a carousel.

## Changing the opening hours

The hours are **not** part of the homepage text. They live in one file, **Opening Hours**
(`content/opening-hours.yml`), and the site shows them in English and German automatically, so
you change them once and both languages update. Search engines get the same hours.

1. In Studio, open **Opening Hours**.
2. Each day has an `opens` and `closes` time in 24-hour format (e.g. `07:30`), or `closed`
   switched on for a day off.
3. Save and **Publish**.

## Adding a photo

When a block has an image field, click it and use the **media library** to upload a new photo or pick an existing one. Always add a short **alt text** (a description of the photo) — it helps accessibility and SEO.

## Choosing an icon (optional)

Feature cards have an optional **icon** field. You can pick one from the icon picker, or leave it — the card still looks good without it.

## The two languages

English and German are edited separately (**Home** and **index.de**). When you add or change something in one language, remember to do the same in the other so both stay in sync.

## Publishing

When you save in Studio, your change is committed to the project on GitHub and the website redeploys automatically. It usually appears live within a couple of minutes. Every save is versioned, so a mistake can always be undone.

## What you can’t break

Section styling, buttons, the map, and the links between pages are all controlled in code. Editing text or swapping a photo will never break the design.
