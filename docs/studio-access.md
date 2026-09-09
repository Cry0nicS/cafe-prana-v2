# Logging in to edit the site (Nuxt Studio)

This project uses the self-hosted **Nuxt Studio** module. The content editor is a normal
page on the deployed website, protected by sign-in. There is no secret link and no separate
CMS website — you log in on your own site at **`/pranas`**.

## For the café owner — how to edit

1. Go to **`https://cafeprana.de/pranas`** (bookmark it).
2. Click **Sign in with Google** and use your Gmail.
3. Edit the page visually — change text, add/remove blocks, add dishes, swap photos.
4. Click **Publish**. Your change is saved and the live site updates automatically within a
   couple of minutes.

That's it — one address and your Google account.

> Editing locally (developers): run `npm run dev` and use the floating edit button at the
> bottom-left. Local edits change files directly and are **not** published — commit them
> the usual way.

## Who can log in (access control)

With Google sign-in, access is an **explicit email allowlist**:

- `STUDIO_GOOGLE_MODERATORS` is a comma-separated list of the Gmail addresses allowed to log
  in. Put **only the owner's email** there (add more later if needed).
- Anyone else who tries to sign in is rejected, even with a valid Google account.
- Publishing commits to the repository using a **service token** (`STUDIO_GITHUB_TOKEN`),
  because Google sign-in does not grant GitHub access on its own.

## One-time setup (developer) to make production login work

Login is wired in `nuxt.config.ts` (`studio.route: '/pranas'`, `studio.repository`), but it
needs OAuth credentials, which are **not** committed. Do this once:

1. **Create a Google OAuth Client**
   Google Cloud Console → APIs & Services → Credentials → *Create credentials* → OAuth client
   ID → **Web application**.
   - **Authorized redirect URI:** `https://cafeprana.de/__nuxt_studio/auth/google`
   - Copy the **Client ID** and **Client Secret**.

2. **Create a GitHub token for publishing**
   A fine-grained personal access token (or a machine account's token) with **Contents: write**
   on the `Cry0nicS/cafe-prana-v2` repo. This is what commits the owner's published changes.

3. **Set environment variables in Vercel** (Project → Settings → Environment Variables, Production):
   - `STUDIO_GOOGLE_CLIENT_ID`
   - `STUDIO_GOOGLE_CLIENT_SECRET`
   - `STUDIO_GOOGLE_MODERATORS` — the owner's Gmail (comma-separated for more people)
   - `STUDIO_GITHUB_TOKEN` — the token from step 2

4. **Redeploy.** Then visit `https://cafeprana.de/pranas` and sign in with Google.

### Notes
- Publishing commits to the branch set in `studio.repository.branch` (currently `main`).
- The site must be deployed with SSR (`nuxt build` on Vercel) — Studio needs its server auth
  routes (`/__nuxt_studio/auth/*`). This project already deploys that way.
- **Alternative — GitHub OAuth:** if you'd rather editors sign in with GitHub, set
  `STUDIO_GITHUB_CLIENT_ID` / `STUDIO_GITHUB_CLIENT_SECRET` (callback
  `/__nuxt_studio/auth/github`) instead. Then access is controlled by **repository
  collaborators** (no email allowlist or service token needed), but each editor needs a
  GitHub account with write access to the repo.

## "Conflict Detected" on a page

Studio shows this when the file in GitHub and the copy the deployed site is serving do not
look identical to it:

> The content on GitHub differs from your website version. Ensure your latest changes are
> deployed and refresh the page.

The message points at a stale deployment, and sometimes that is all it is — a deploy still
running, or one that failed. Check the Vercel deployment for the newest commit on `main`
first, and note that Vercel's **Redeploy** button rebuilds the *same* commit, so it will not
pick up newer ones.

If the newest commit really is live and one particular page still conflicts, it is not
staleness: something in the build is storing that document differently from the way Studio
reads the file, and no amount of redeploying will clear it. That is a developer fix, not an
editing mistake. `npm run check:studio` (after a build) reports exactly which documents and
fields disagree, and CI runs it on every push so it should not reach production again.

## Adding a photo, and why the picker only shows eight

Clicking an image field — an event's photo, a dish, the homepage hero — opens a small box with a
search field and eight thumbnails, and a line underneath reading something like `8 of 40 images`.
There is no upload button there, and there is no way to page through to the ninth image.

**Nothing is missing and nothing is broken.** That is how Nuxt Studio's image fields behave; it
is not a setting anyone here turned on, and not something you did. It has been reported to the
people who build Studio, and this page will be simplified if they change it.

**To use a photo that is already in the site:** type part of its file name into the search box.
The search looks at *all* your images, not just the eight on show, so anything in the library can
be found this way. The eight thumbnails are only a preview — the rest of your photos are still
there.

**To add a new photo:**

1. Open the **Media** section in Studio (the left-hand sidebar).
2. Open the **`images`** folder and then the sub-folder the photo belongs in — `events`, `menu`,
   or `home`. Uploading into one of these matters: photos outside the `images` folder are not
   shrunk for the web, so the page they are on loads slowly.
3. Upload the photo there.
4. Go back to the page or event you were editing, click the image field, and type part of the
   file name you just uploaded to select it.
5. Add a short **alt text** (a sentence describing the photo) and **Publish**.

A photo uploaded into the `images` folder is shrunk and converted for the web automatically when
the site rebuilds, so you can upload a large photo straight off your phone or camera without
worrying about its size.

Photos you add *inside* an event's or a page's text — as opposed to one of the fields at the top
— work differently: those open Studio's full picker, with folders and an upload button of their
own. That upload button takes you to the same **Media** section as above.

> Developers: the diagnosis, the versions involved and what to re-check after a Studio upgrade
> are in `docs/studio-media-picker.md`. Reported upstream as
> [nuxt-content/nuxt-studio#557](https://github.com/nuxt-content/nuxt-studio/issues/557).
