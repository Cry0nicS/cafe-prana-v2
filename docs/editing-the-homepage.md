# Editing the homepage in Nuxt Studio

This guide is for the café owner. It explains how to change the homepage yourself — no developer needed. Everything you edit is saved to the website automatically.

## How the homepage is built

The homepage is a stack of sections. Each section is a box in the editor, and **everything
inside a box is ordinary text**: headings, paragraphs and pictures, edited the same way as an
event page. There are no forms to fill in.

| Section | What you write inside it |
|---------|--------------------------|
| **Home Hero** (the top) | An optional short line of news, the big title (a *Heading 1*), a paragraph, a photo |
| **Feature Grid** | A *Heading 2*, a sentence, then one **Feature** box per point |
| **Feature** | A *Heading 3* and a sentence or two |
| **Menu Highlights** | A *Heading 2*, a sentence, then one **Menu Highlight** box per dish |
| **Menu Highlight** | A photo, the dish's name as a *Heading 3*, one line about it |
| **Story Section** | A photo, a *Heading 2*, your story |
| **Events Intro** | A *Heading 2*, a sentence, then each kind of gathering as a *Heading 3* with a line under it |
| **Gallery** | A *Heading 2*, a sentence, then as many photos as you like |
| **Faq** | A *Heading 2*, then each question as a *Heading 3* with its answer under it |
| **Directions** | A *Heading 2* and a sentence. The hours and the map appear on their own |

The site decides how each piece looks from what it is. A Heading 2 inside a section is always
that section's title; a photo in the gallery always joins the grid. You never choose a size,
a colour or a position.

You do **not** need to worry about buttons or layout. The buttons ("Reserve a table", "See the
menu", ...) are part of the site and always point at the right pages.

## Your next event

While at least one event is still to come, the homepage shows the **soonest upcoming event**
in two places: at the top, beside your title and text, with its picture and date, and as an
invitation in the gatherings section with the event's picture, date, time, price and
description. Both link to the event's page, and both disappear on their own the day after the
event. Nothing to switch on or off: publishing an event is all it takes.

While an event is shown at the top it takes the place of the photo you put in the Home Hero.
Your photo comes back, under the text, as soon as no event is coming up.

## Opening the editor

1. Go to your Nuxt Studio project and open the site.
2. Open the language folder you want (**content/en** for English, **content/de** for German) and open **index** inside it. You edit each language separately.
3. The text is on the left and the page on the right. Click into any text on the left and type; the page follows.

## Editing text

Click into a heading or a paragraph and type. To add a paragraph, press Enter. To turn a line
into a heading, type `/` and pick **Heading 2** or **Heading 3**.

The big title at the top is the only *Heading 1* on the page. Edit its words freely, but do not
delete the line itself: the editor has no button to bring a Heading 1 back.

## Adding a question, a kind of event, or a gallery photo

These need no new box. Put the cursor at the end of the section and:

- **A question:** add a *Heading 3* with the question, then a paragraph with the answer.
- **A kind of gathering:** the same, a *Heading 3* and a line under it.
- **A gallery photo:** type `/`, pick **Image**, and choose or upload the photo. Give it a short description when asked.

## Adding a feature or a dish

1. Put the cursor after the last **Feature** (or **Menu Highlight**) box.
2. Type `/` and pick **Feature** (or **Menu Highlight**).
3. Inside the new box, write the *Heading 3* and the text. For a dish, add its photo first with `/` and **Image**.

To **reorder**, drag a box by its handle. To **delete**, select it and remove it.

A Feature has one setting, its **icon**. Click the box's settings to pick another one, or leave
it as it is.

## Changing the opening hours

The hours are **not** part of the homepage text. They live in one file, **Opening Hours**
(`content/opening-hours.yml`), and the site shows them in English and German automatically, so
you change them once and both languages update. Search engines get the same hours.

1. In Studio, open **Opening Hours**.
2. Each day has an `opens` and `closes` time chosen from a dropdown of 15-minute steps, or
   `closed` switched on for a day off.
3. Save and **Publish**.

The reservation form follows the same file: guests can book on the days you are open, from
your opening time until shortly before you close, and a closed day cannot be booked. The same
form has a list of **reservation exceptions** for single dates — to open a Monday evening for an
event, or to close a date for a holiday — and a field for how long before closing the last
booking is taken. All of it is yours to edit; see `docs/reservation-availability.md`.

## Changing a photo

Click the photo in the editor and pick another one from the **media library**, or upload a new
one. Keep the short description up to date: it is read aloud to visitors who cannot see the
picture, and search engines read it too.

## The two languages

English and German are edited separately — the **index** page inside **content/en**, and the one inside **content/de**. The folder is the language; there is nothing to set on the page itself. When you add or change something in one language, remember to do the same in the other so both stay in sync.

## Publishing

When you save in Studio, your change is committed to the project on GitHub and the website redeploys automatically. It usually appears live within a couple of minutes. Every save is versioned, so a mistake can always be undone.

## What you can’t break

Section styling, buttons, the map, and the links between pages are all controlled in code. Editing text or swapping a photo will never break the design.
