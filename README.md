# vish.wtf

Your portfolio: Next.js 15 (App Router) + TypeScript, Three.js 3D, GSAP intro, SQLite database, and a private admin dashboard.

The design is an engineering drawing sheet: cool drafting paper, ink, and one red "redline" that echoes the slash from the intro. The 3D structure behind the page reacts to scroll and mouse. Project plates tilt in 3D.

## What you get
| Part | Where |
|---|---|
| Domain Expansion intro (plays once per browser session, Skip button, reduced-motion and no-WebGL fallbacks) | `src/components/DomainExpansion.tsx`, `IntroController.tsx` |
| 3D scroll-driven scene behind the site | `src/components/World3D.tsx` |
| Homepage, case-study pages (`/projects/slug`) | `src/app/page.tsx`, `src/app/projects/[slug]/page.tsx` |
| Admin dashboard at `/admin` | `src/app/admin/AdminApp.tsx` |
| Database (SQLite file `data/vish.db`) | `src/lib/db.ts` |
| Starting content from your resume | `src/data/defaults.ts` |
| **Margin notes** (the special feature, see below) | `src/components/MarkUp.tsx`, `src/app/api/notes` |

## Margin notes (the unique feature)
Every section has a "Mark up this section" button. Visitors, such as recruiters, can leave a short note pinned to that section, like a reviewer marking up a drawing. Notes are **hidden until you approve them**. Approved notes appear as red-edged annotations beside the section. Spam protection: a hidden honeypot field, 3 notes per 10 minutes per visitor, 280-character limit. Manage notes in `/admin` under "Margin notes" (a red number shows how many are waiting).

## 1. Run it on your computer
You need Node.js 20 or newer (https://nodejs.org).
1. Unzip `vish-wtf.zip`, then open a terminal inside the `vish-wtf` folder.
2. Run `npm install`.
3. Copy the settings file: `cp .env.example .env.local` (Windows: `copy .env.example .env.local`).
4. Open `.env.local` and set:
   - `ADMIN_PASSWORD`: a long passphrase only you know.
   - `SESSION_SECRET`: any long random string (at least 16 characters).
5. Run `npm run dev` and open http://localhost:3000.
6. The intro plays once. Press "Skip intro" any time. To see it again, open the site in a new private window.
The admin is switched off until both settings exist. `npm run lint` type-checks the project.

## 2. Put your real content in
1. Go to http://localhost:3000/admin and sign in.
2. **Profile**: name, headline, intro, about, email, links. The phone number is empty on purpose and only shows publicly if you fill it in.
3. **Projects**: open a project, edit it, use "Show on the site" to publish or hide it. Add GitHub and live-demo URLs when you have them. In case-study fields (problem, solution, architecture, decisions, challenges, results) write only what is true. **Empty fields are hidden**, so nothing is invented. Add new projects with "Add project" and reorder them with Move up/down.
4. **Skills** and **Education**: edit, add, remove.
5. Press **Save changes**. The public site updates immediately.
Your resume content is already loaded as the starting point. Your MemoryVault AI and StayEase entries have no GitHub or live links yet, so add them.

## 3. Back up and reset
- All your edits and notes live in one file: `data/vish.db`. Copy it to back up.
- To reset to the resume defaults, stop the server and delete `data/vish.db*`.

## 4. Deploy (get it live on vish.wtf)
The database is a file on disk, so you need a host with **persistent storage**. Vercel and similar serverless hosts will lose your edits, so do not use them for this version.
Easy options: a small VPS (Hetzner, DigitalOcean), or Railway/Fly.io with a volume mounted at `data/`.
On a VPS:
1. Install Node 20+, upload the project (without `node_modules`), run `npm install` and `npm run build`.
2. Create `.env.local` with a **strong** `ADMIN_PASSWORD` and a **random** `SESSION_SECRET`.
3. Run `npm start` (default port 3000). Keep it alive with `pm2 start npm --name vish -- start`.
4. Put Caddy or Nginx in front for HTTPS and point the vish.wtf DNS record at the server. Always use HTTPS: the admin login cookie is marked Secure in production.
5. Back up `data/vish.db` regularly.

## 5. Security notes
- Login attempts are limited (10 per 15 minutes) but the counter resets when the server restarts.
- The admin cookie is HTTP-only and expires after 8 hours.
- Visitor notes are plain text, escaped on output, and moderated.
- Never commit `.env.local` or `data/vish.db`. The included `.gitignore` already excludes them.

## 6. Customise
- Colours and layout: `src/app/globals.css` (variables at the top: `--paper`, `--ink`, `--red`).
- The 3D structure: `src/components/World3D.tsx`.
- Intro timing and look: the GSAP timeline in `DomainExpansion.tsx`.
- Page text defaults: `src/data/defaults.ts`. These only seed an empty database; after that, use `/admin`.
- The font (Bricolage Grotesque) is bundled locally. No external requests are needed.

## 7. What to do next
1. Run it, sign in, and replace placeholder wording with your own words.
2. Add GitHub links and, when ready, live demos.
3. Deploy with the steps above.
4. Test the intro and site on your phone and on a slower laptop.
5. Next build step: the other four intros (System Override, Singularity, Machine Awakens, The Final Cut). `src/lib/intros.ts` is where new ones plug in. Ask for them once you have tested this version.

## Tested
Production build and type-check pass. In an automated headless browser: intro plays and ends, Skip works, no replay on refresh, reduced-motion fallback works, notes flow (submit, approve, publish), admin login and save work, and there were no console errors on desktop and phone-sized screens. Not tested on real devices or GPUs.
