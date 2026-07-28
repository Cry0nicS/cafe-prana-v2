# Logging in to edit the site (Nuxt Studio)

This project uses the self-hosted **Nuxt Studio** module. The content editor is a normal
page on the deployed website, protected by **GitHub sign-in**. There is no secret link and
no separate CMS website — you log in on your own site.

## For the café owner — how to edit

1. Go to **`https://cafeprana.de/admin`** (bookmark it).
2. Click **Sign in with GitHub** and authorize.
3. Edit the page visually — change text, add/remove blocks, swap photos.
4. Click **Publish**. Your change is saved and the live site updates automatically within a
   couple of minutes.

That's it. You only ever need that one address and your GitHub login.

> Editing locally (developers): run `npm run dev` and use the floating edit button at the
> bottom-left. Local edits change files directly and are **not** published — commit them
> the usual way.

## Who can log in (access control)

Access is controlled by **GitHub repository membership**, not by a password we share:

- The repository (`Cry0nicS/cafe-prana-v2`) must be **private** (it is — `repository.private`
  defaults to `true`).
- Only **collaborators with write access** to that repository can sign in and publish,
  because publishing commits to the repo using the signed-in user's own GitHub permissions.
- To give the owner access: invite them as a **collaborator (Write role)** on the GitHub repo.
- To revoke access: remove them as a collaborator. That's the whole security model.

## One-time setup (developer) to make production login work

Login is wired in `nuxt.config.ts` (`studio.route: '/admin'`, `studio.repository`), but it
needs GitHub OAuth credentials, which are **not** committed. Do this once:

1. **Create a GitHub OAuth App**
   GitHub → Settings → Developer settings → **OAuth Apps** → *New OAuth App*.
   - **Application name:** `Cafe Prana Studio`
   - **Homepage URL:** `https://cafeprana.de`
   - **Authorization callback URL:** `https://cafeprana.de/__nuxt_studio/auth/github`
   - Create it, copy the **Client ID**, and generate a **Client Secret**.

2. **Set the credentials in Vercel** (Project → Settings → Environment Variables, Production):
   - `STUDIO_GITHUB_CLIENT_ID`
   - `STUDIO_GITHUB_CLIENT_SECRET`

3. **Confirm repo settings**
   - Repo is **private**.
   - Café owner is invited as a **collaborator (Write)**.

4. **Redeploy.** Then visit `https://cafeprana.de/admin` and sign in with GitHub.

### Notes
- Publishing commits to the branch set in `studio.repository.branch` (currently `main`).
- The site must be deployed with SSR (`nuxt build` on Vercel) — Studio needs its server auth
  routes (`/__nuxt_studio/auth/*`). This project already deploys that way.
- Other providers (GitLab, Google, SSO) are supported by the module if ever needed; Google
  OAuth additionally requires `STUDIO_GOOGLE_MODERATORS` (an email allowlist) plus a
  `STUDIO_GITHUB_TOKEN`. GitHub OAuth is simplest here since the repo is on GitHub.
