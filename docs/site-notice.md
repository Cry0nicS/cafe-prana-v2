# Showing a notice to visitors

This guide is for the café owner. It explains how to put a short notice at the top of every
page of the website — for example when you have to close for a day at short notice, open
later than usual, or host a private event.

The notice appears as a coloured bar above the header, in English on the English site and in
German on the German site. Visitors can close it with the **×** button; it then stays hidden
for them until you change the text.

## Where to edit

In the editor, open the file **`content/notice.yml`**. It is a small form with these fields:

| Field | What it is |
|-------|------------|
| `enabled` | The switch. **On** shows the notice, **off** hides it. Nothing is shown while it is off, whatever else is filled in. |
| `tone` | The colour: `info` (green, for good news), `warning` (brown, for changes such as a closure) or `urgent` (red, for something important). |
| `schedule` → `from` | Optional. The moment the notice starts showing. Leave empty to start straight away. |
| `schedule` → `until` | Optional. The moment the notice stops showing. Leave empty to keep it up until you switch it off. |
| `en` → `title` | The English headline, one short sentence. |
| `en` → `message` | Optional English detail, one or two sentences. |
| `de` → `title` | The German headline. |
| `de` → `message` | Optional German detail. |

Then click **Publish**. The live site updates within a couple of minutes, like any other change.

## Two ways to use it

**Switch it on and off yourself.** Turn `enabled` on, write the text, publish. When the
notice is no longer needed, turn `enabled` off and publish again. Leave `from` and `until`
empty.

**Let it switch itself off.** Turn `enabled` on, write the text, and set `until` to when the
notice should disappear — for example the evening of the day you are closed. You can also set
`from` to make a notice appear later, say the day before a closure. The notice shows itself
and hides itself at those times; you do not need to come back to the editor. (Leaving
`enabled` on afterwards does no harm: the notice stays hidden once `until` has passed. Do
remember to clear or update the schedule before reusing the notice.)

Times are Berlin time. Picking a date without a time counts as the whole day.

## Tips

- Keep the title short and concrete: *“Closed on Friday, 5 September”* works better than
  *“Important information”*. Put the why and the what-next in the message.
- Fill in **both** languages. Each site only shows its own language, so an empty German title
  means German visitors see nothing.
- When you change the wording, visitors who had closed the old notice see the new one again.
- The notice is separate from the opening hours. If a closure is permanent, change the hours
  in `content/opening-hours.yml` as well.
