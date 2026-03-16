# CopyDesk — AI Copy Generator
### 100% Free · No Backend · GitHub Pages + Google Sheets + Claude API

A single-page React app that generates real estate marketing copy using Claude AI.
All data lives in your Google Sheet. Hosted free on GitHub Pages. Zero server costs ever.

---

## Architecture (all free)

| What | How | Cost |
|------|-----|------|
| **Frontend hosting** | GitHub Pages | Free |
| **Database** | Google Sheets via Apps Script | Free |
| **AI generation** | Anthropic Claude API (haiku model) | ~$0.001/generation |
| **Admin auth** | Browser localStorage | Free |

---

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → opens at http://localhost:5173/copydesk/
```

---

## Deploy to Vercel (Free, works with private repos)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_PRIVATE_REPO.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up free with GitHub
2. Click **Add New Project** → Import your private repo
3. Settings (Vercel auto-detects these):
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy** — done in ~30 seconds

Your app is live at `https://your-project.vercel.app`

Every `git push` to `main` auto-redeploys. No config needed.


---

## First-Time Setup (in the app)

### 1. Set Admin Password
- Visit your deployed URL → click **Admin** (top right)
- First visit: you'll be prompted to create a password
- Password is stored in your browser only

### 2. Set up Google Sheet (Database)
- Go to Admin → **Settings**
- Follow the 6-step instructions shown there (takes ~5 minutes)
- Paste your Apps Script Web App URL and save

The full Apps Script code is in `google-apps-script.js` in this repo.

### 3. Add Anthropic API Key
- Go to Admin → **Settings**
- Get a free key at [console.anthropic.com](https://console.anthropic.com)
- New accounts get free credits. The app uses `claude-haiku-4-5` (cheapest model)
- Paste and save

### 4. Create Projects + Add CTB Briefs
- Admin → **Projects** → New Project
- Add project name, description, and paste CTB/brief content
- On the generator page, link a project to include the brief as AI context

---

## Task Types Supported

| Task | Output |
|------|--------|
| Communication Doc | Project overview, highlights, CTA |
| Concepts | Campaign themes, brand voice, messaging |
| Coffee Table Book | Luxury narrative copy |
| Ad Communication | Headlines, body copy, CTAs |
| Site Branding | Taglines, amenity names, signage |
| Nurturing Emailers | Full email with subject + body |
| WA Creatives | 3 WhatsApp message variants |
| Videos | Scene-by-scene script |
| Headlines/Image Lines | Headlines, image overlays, hashtags |

---

## Security

- API key and Sheet URL are stored in **your browser's localStorage only**
- They are sent directly to Anthropic and Google — never to any third-party server
- Anyone with the URL can use the generator (no login needed by design)
- Only the admin (on the configured browser) can see/change settings

---

## File Structure

```
copydesk/
├── src/
│   ├── pages/
│   │   ├── GeneratePage.jsx       # Public generator
│   │   ├── AdminLoginPage.jsx     # Admin login / first-time setup
│   │   └── AdminDashboard.jsx     # Projects + Settings tabs
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── TaskSelector.jsx
│   │   ├── CopyForm.jsx
│   │   └── CopyOutput.jsx
│   └── utils/
│       ├── store.js               # localStorage + Google Sheets API
│       ├── api.js                 # Anthropic API caller
│       └── tasks.js               # Task list + system prompts
├── public/
│   └── 404.html                  # SPA routing fix for GitHub Pages
├── google-apps-script.js         # Paste this into Google Apps Script
├── vite.config.js
└── package.json
```
