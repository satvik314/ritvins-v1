# Ritvik & Vineesha wedding site

Built with Vite. Pushing to `main` publishes it to GitHub Pages.

## Put it online

1. Create a new repository on GitHub and push everything in this folder to a branch called `main`. Include the hidden `.github` folder, because it holds the deploy workflow. Uploading through the GitHub website can skip hidden files, so `git push` is safer.
2. In the repository, open **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab. If the first run failed because Pages wasn't switched on yet, choose **Re-run jobs**.
4. The site appears at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

This also works on Netlify or Vercel: the build command is `npm run build` and the output folder is `dist`. On those hosts, set `VITE_SITE_URL` to the full site address so WhatsApp can show the preview image.

## Run it on your computer

```bash
npm install
```

```bash
npm run dev
```

## Send a personal invitation

Add `?to=` to the link and the name appears on the invitation and in the reply card:

`https://YOUR-USERNAME.github.io/YOUR-REPO/?to=The%20Sharma%20Family`

## Change the details

| What | Where |
|---|---|
| Map link, reply-by date, countdown time, reel captions | `src/js/config.js` |
| Event text and FAQs | `index.html` |
| The thank-you line after replying | `src/js/notes.js` |
| Photos and art | `public/assets/` |
| Calendar files | `public/assets/ics/` |

## Connect Supabase later

Until this is done, replies stay in the guest's own browser and never reach the couple. The thank-you card tells guests their reply wasn't sent, and that message goes away once Supabase is connected.

1. Create a Supabase project and run `supabase/rsvps.sql` in its SQL editor.
2. In the GitHub repository, open **Settings > Secrets and variables > Actions > Variables**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then re-run the deploy.

For local development, copy `.env.example` to `.env` and fill in the same two values.
