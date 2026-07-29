# Adding a menu item

The **Menu** page builds itself from two lists in Studio:

- **Menu Categories** — the sections (Coffee Specials, Hot Drinks, Food & Brunch)
- **Menu Items** — the individual dishes and drinks

You don't edit the menu page layout. You just add items to the **Menu Items** list, and the page
groups them under the right category automatically.

## Add a dish or drink

1. In Studio, open the **Menu Items** collection (the list of existing dishes).
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
4. Save.

## Two languages

Every item exists in **two files**: English (`name.yml`) and German (`name.de.yml`), with the
**same file name** before the `.de`. When you add a dish, add it in **both** languages so it
appears on the English and German menus. The quickest path is to duplicate an existing item in
each language and translate the text (keep `category`, `order`, and the image the same).

## Removing or reordering

- **Remove** a dish by deleting its item (both language files).
- **Reorder** within a category by changing the **order** numbers.

## Publishing

On the live site, save and **Publish** — the menu updates within a couple of minutes. Remember
to publish both language versions. (Locally in dev, edits are written straight to the files;
there's no Publish button — see `docs/studio-access.md`.)

## Adding a whole new category (rare, needs a developer)

Categories are fixed on purpose (so the item dropdown stays clean). To add one:

1. A developer adds the new slug to `createMenuCategorySchema` in `content.config.ts`.
2. Create the category in the **Menu Categories** list (`content/menu-categories/<slug>.yml`
   and `<slug>.de.yml`) with a title, optional description/options, an icon, and an `order`.
3. New items can then select that category from the dropdown.
