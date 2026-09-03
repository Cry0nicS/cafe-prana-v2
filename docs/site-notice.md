# Showing a notice to visitors

This guide is for the café owner. It explains how to show visitors a short notice when they open
the website — for example when you have to close for a day at short notice, open
later than usual, or host a private event.

The notice appears as a small card in the middle of the screen when a visitor opens the site, in
English on the English site and in German on the German site. Visitors close it with **Got it**,
the **×** button, or by clicking outside it; it then stays hidden for them until you change the
notice (its text, its dates or its tone).

## Where to edit

In the editor, open the file **`content/notice.yml`**. It is a small form with these fields:

| Field | What it is |
|-------|------------|
| `tone` | The colour of the icon and label: `info` (green, for good news), `warning` (brown, for changes such as a closure) or `urgent` (red, for something important). |
| `schedule` → `until` | **The switch.** The moment the notice stops showing. While this is empty, or once it has passed, nothing is shown. |
| `schedule` → `from` | Optional. The moment the notice starts showing. Leave empty to start straight away. |
| `en` → `title` | The English headline, one short sentence. |
| `en` → `message` | Optional English detail, one or two sentences. |
| `de` → `title` | The German headline. |
| `de` → `message` | Optional German detail. |

Then click **Publish**. The live site updates within a couple of minutes, like any other change.

## How it works

There is no on/off switch to remember. The notice is shown **until** the moment you set, and
hides itself when that passes:

1. Write the title and message in both languages.
2. Set `until` — for example the evening of the day you are closed.
3. Optionally set `from` to make the notice appear later, say the day before a closure.
4. Publish.

To take a notice down early, clear `until` (or move it to the past) and publish. To reuse the
notice later, just set a new `until`.

Times are Berlin time. The picker starts the time at **00:00**: for `until` that counts as the
**whole of that day**, so picking the closure day itself keeps the notice up until midnight at its
end. Pick a later time only if the notice should end during the day. `from` must be before
`until`; otherwise nothing is shown.

## Tips

- Keep the title short and concrete: *“Closed on Friday, 5 September”* works better than
  *“Important information”*. Put the why and the what-next in the message.
- Fill in **both** languages. Each site only shows its own language, so an empty German title
  means German visitors see nothing.
- When you change the notice — wording, dates or tone — visitors who had closed the old one see it
  again.
- The notice is separate from the opening hours. If a closure is permanent, change the hours
  in `content/opening-hours.yml` as well.
