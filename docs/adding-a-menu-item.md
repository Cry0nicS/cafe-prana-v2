# Adding a menu item

The **Menu** page builds itself from two lists in Studio:

- **Menu Categories** — the sections (Coffee Specials, Hot Drinks, Food & Brunch)
- **Menu Items** — the individual dishes and drinks

You don't edit the menu page layout. You just add items to the **Menu Items** list, and the page
groups them under the right category automatically.

## Add a dish or drink

1. In Studio, open the language folder you want: **content/en/menu** for English,
   **content/de/menu** for German. The folder decides the language — there is no language to
   choose on the form.
2. Click **New** — or, easiest, **duplicate** an existing item that's similar and change the
   values. Duplicating is the quickest way to start from the right shape.
3. Fill in the form:
   - **title** — the dish/drink name
   - **category** — pick from the **dropdown**. The options are the category *slugs*:
     - `drinksCoffee` → shows under **Coffee Specials**
     - `drinksHot` → shows under **Hot Drinks**
     - `food` → shows under **Food & Brunch**
   - **description** — a short line about the item
   - **ingredients** — shown in the "Ingredients" expander on the card
   - **price** — just the number, e.g. `4,60`, or a range like `2,5 / 3,3`. The `€` sign is
     added automatically, so don't type it.
   - **image** — choose or upload a photo via the media picker; add a short **alt** text
   - **labels** — optional tags, chosen from the fixed list
     (gluten-free, vegan, vegetarian, spicy, seasonal, organic)
   - **order** — a number controlling the position *within its category* (lower shows first)
   - **available** — a switch, **on** by default. Leave it on. Turning it off is how you take a
     dish off temporarily — see below.
4. Save.

## Two languages

Every item is **two files with the same name**, one in each language folder:

```
content/en/menu/flat-white.yml
content/de/menu/flat-white.yml
```

Keeping the names identical is what pairs them up. There is no `.de` in the name and no language
field on the form — the folder is the language.

When you add a dish, add it in **both** languages so it appears on the English and German menus.
The quickest path is to **duplicate** an item from inside each language folder and translate the
text, keeping `category`, `order` and the image the same.

> Duplicating copies **within** the folder you're in, so duplicate from inside `content/de/menu`
> to get a German file. You can't duplicate an English item and move the copy across.

## Taking a dish off temporarily

When something is sold out, out of season or you just can't get the ingredients, **don't delete
it**. Open the item and switch **available** off.

The dish stays on the menu, greyed out, with a badge reading *Currently unavailable* (in German,
*Gerade nicht verfügbar*). Regulars can see it's off rather than wonder where it went, and when
it comes back you switch it on again — nothing to retype.

> Do it in **both** language folders. The switch belongs to the file, so turning it off in
> `content/de/menu` only takes it off the German menu; the English page will happily keep
> selling it. This is the same "two files, same name" rule as everywhere else on this page, and
> it's the easiest one to forget because you're usually in a hurry when you reach for it.

Note the **Menu Highlights** on the homepage are written separately by hand and know nothing
about this switch. If you take off a dish that's featured there, edit the homepage too.

## Removing or reordering

- **Remove** a dish for good by deleting its item (both language files). If it's coming back,
  use the **available** switch above instead.
- **Reorder** within a category by changing the **order** numbers.

## Publishing

On the live site, save and **Publish** — the menu updates within a couple of minutes. Remember
to publish both language versions. (Locally in dev, edits are written straight to the files;
there's no Publish button — see `docs/studio-access.md`.)

## Adding a whole new category (rare, needs a developer)

Categories are fixed on purpose (so the item dropdown stays clean). To add one:

1. A developer adds the new slug to `createMenuCategorySchema` in `content.config.ts`.
2. Create the category in **both** language folders
   (`content/en/menu-categories/<slug>.yml` and `content/de/menu-categories/<slug>.yml`) with a
   title, optional description/options, an icon, and an `order`.
3. New items can then select that category from the dropdown.
