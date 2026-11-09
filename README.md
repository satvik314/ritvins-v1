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
| Hero map link, reply-by date, countdown time, reel captions, Supabase project | `src/js/config.js` |
| Event text, dress codes, venues and directions links | `index.html` |
| The thank-you line after replying | `src/js/notes.js` |
| Photos and art | `public/assets/` |

## Where replies go

Replies are saved in the Supabase project **ritvik-vineesha-wedding** (organization "experiments", region us-west-1). The address and publishable key are set in `src/js/config.js`, so every build is connected with no extra setup.

The couple can see every reply at **`/admin`** on the site, for example `https://ritvik-weds-vineesha.vercel.app/admin`. It asks for a username and password, then shows the totals for each event, a searchable list, and a CSV download. The login is checked inside Supabase by the `admin_replies` function in `supabase/admin.sql`. Only a hash of the password is stored, and the password is not in this repository. To change it, run the snippet at the bottom of `supabase/admin.sql` in the Supabase SQL editor.

You can also read replies in the Supabase dashboard under **Table Editor**. Use `rsvps` for every reply. Use `latest_replies` to keep only the newest reply per name, since a guest who changes a reply adds a new row.

Guests can add a reply but can't read anyone's, including their own. `supabase/rsvps.sql` sets this up. It has already been applied to the project, so only run it again for a new project.

To point a build at a different project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or in the host's environment variables.
