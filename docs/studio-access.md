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
