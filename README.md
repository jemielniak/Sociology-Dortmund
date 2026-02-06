# Sociology B.A. Planner – TU Dortmund

> ⚠ **Unofficial student tool.** Not affiliated with TU Dortmund University.

An offline-capable PWA that helps Sociology B.A. students at TU Dortmund track module completion, plan their degree path with rule validation, and find the right administrative contact.

---

## Quick Start (local development)

```bash
npm install
npm run dev        # → http://localhost:5173
```

## Build for production

```bash
npm run build      # outputs to ./dist
npm run preview    # test the production build locally
```

The `dist/` folder is a fully static site (HTML + JS + CSS + service worker).
No server-side runtime needed.

---

## Deployment Options

### Option A: Vercel (recommended — zero config)

1. Push this repo to GitHub/GitLab
2. Go to [vercel.com](https://vercel.com), sign in, click **"Add New → Project"**
3. Import your repository
4. Vercel auto-detects Vite — just click **Deploy**
5. Done. You get a URL like `your-project.vercel.app`

**Custom domain:** In Vercel dashboard → Settings → Domains → add your domain.

### Option B: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://app.netlify.com), click **"Add new site → Import from Git"**
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

Or use the CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages

1. Install the gh-pages package:
   ```bash
   npm install -D gh-pages
   ```

2. Add to `vite.config.js`:
   ```js
   base: '/your-repo-name/',
   ```

3. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && npx gh-pages -d dist"
   ```

4. Run:
   ```bash
   npm run deploy
   ```

5. In GitHub → repo Settings → Pages → Source: `gh-pages` branch

### Option D: Any static host (Cloudflare Pages, AWS S3, university server)

Just upload the `dist/` folder. The entire app is static files.

For a university-hosted Apache/Nginx server:
```bash
npm run build
scp -r dist/* youruser@server:/var/www/html/soz-planner/
```

---

## PWA / "Install as App"

After the first visit, the service worker caches everything. Users can:

- **Mobile:** Browser shows "Add to Home Screen" banner automatically
- **Desktop Chrome/Edge:** Click the install icon in the address bar
- **Desktop Firefox:** Not natively supported, but the app works offline in-tab

The `vite-plugin-pwa` generates the service worker and web manifest automatically
during `npm run build`. No manual service worker management needed.

---

## Project Structure

```
├── index.html                 # HTML shell
├── package.json
├── vite.config.js             # Vite + PWA plugin config
├── public/
│   ├── favicon.svg            # Browser tab icon
│   ├── icon-192.png           # PWA icon (home screen)
│   └── icon-512.png           # PWA icon (splash screen)
├── scripts/
│   └── check-links.mjs        # URL health checker for CI
└── src/
    ├── main.jsx               # React entry point
    └── App.jsx                # Entire app (single-file)
```

The app is intentionally a single `App.jsx` to keep maintenance simple —
one file to update when TU Dortmund changes their module structure.

---

## Maintenance

### Check source URLs
```bash
npm run check-links
```
Verifies all 14 TU Dortmund URLs still resolve. Run this at the start of each semester.

### Update degree rules
Edit `src/App.jsx`:
- `MODULES` array → module CP, semesters, prerequisites
- `ASK_TREE` object → routing contacts and answers
- `SOURCES` object → official page URLs

See `deliverables.txt` Section 3 (Maintenance Notes) for detailed procedures.

### Semester check schedule
- **Winter semester:** First week of October
- **Summer semester:** First week of April

---

## Environment Variables

None required. The app is entirely client-side with no API keys or backend.

---

## License

This is an unofficial community tool. All degree program information
is sourced from publicly available TU Dortmund documents.
