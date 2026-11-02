# TechFest Portal - Version B
A small MERN app (React + Express + MongoDB) already prepared for Experiment 5.

```
techfest-portal/
├── client/          React (Vite) frontend  -> deploy to Netlify
├── server/          Express API + tests    -> deploy to Render
├── .github/workflows/ci.yml                -> GitHub Actions CI
└── .gitignore       (node_modules, .env)
```

## Where to work
Everything below is done **on your own computer** (VS Code + terminal) and in the **web dashboards** of GitHub, MongoDB Atlas, Render and Netlify. Install **Node.js 20 LTS** and **Git** first (`node -v`, `git --version`).

## 0. Run it locally
1. Create a free MongoDB Atlas cluster first (Step 12 below), or use a local MongoDB.
2. Backend:
   ```bash
   cd server
   cp .env.example .env      # then edit .env: MONGO_URI and JWT_SECRET
   npm install
   npm run dev
   ```
3. Frontend (new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open http://localhost:5173

## Steps 2-5: Security demos (before -> fix -> after)
**Make the test copy first (Step 2):** copy the whole `techfest-portal` folder as `techfest-portal-test`, and do the attack demos there.

### Step 3: NoSQL injection
1. **Before:** in `server/.env` set `VULNERABLE_DEMO=true`, restart the server. Register one user normally. In Postman (POST `http://localhost:5000/api/auth/login`, body = raw JSON):
   ```json
   { "email": { "$ne": null }, "password": { "$ne": null } }
   ```
   You get logged in without a password -> screenshot.
2. **After:** set `VULNERABLE_DEMO=false`, restart, send the same request -> **400 error** (Helmet + mongoSanitize + express-validator on). Screenshot.
   The fix is in `server/app.js` (`helmet()`, `mongoSanitize()`) and `server/routes/auth.js` (validators).

### Step 4: XSS
1. **Before:** in `client/.env` (copy from `.env.example`) set `VITE_VULNERABLE_XSS=true`, restart `npm run dev`. On the Feedback page submit:
   ```html
   <img src=x onerror="alert('hi')">
   ```
   An alert pops up -> screenshot. (A plain `<script>` tag inserted with `innerHTML` is usually blocked by browsers, so the `onerror` form is the reliable demo. It is the same class of attack. Mention this in your record.)
2. **After:** set `VITE_VULNERABLE_XSS=false`, restart. The same text is now shown as plain text -> screenshot. See `client/src/pages/Feedback.jsx`.

### Step 5: Cookies and CSRF
In `server/routes/auth.js` the login cookie uses `httpOnly`, `secure` (production) and `sameSite`.
- **CSRF:** a fake request sent from another website while you are logged in. The browser would attach your cookie automatically.
- **sameSite** tells the browser not to send the cookie on cross-site requests, so the fake request arrives without it. (`strict`/`lax` locally; `none` in production because Netlify and Render are different sites, so also keep CORS limited to your Netlify URL via `CLIENT_URL`.)

## Steps 6-10: Git and GitHub
```bash
cd techfest-portal
git init
git add .
git commit -m "first version"
git branch -M main

# Step 8: branching
git checkout -b feature-page
# edit something small (e.g. client/src/pages/Home.jsx), then:
git add . && git commit -m "update home page text"
git checkout main
git merge feature-page

# Step 9: deliberate merge conflict
git checkout -b conflict-a
# edit line 1 of README.md (title) one way
git add . && git commit -m "title change A"
git checkout main
git checkout -b conflict-b
# edit the SAME line 1 of README.md differently
git add . && git commit -m "title change B"
git checkout conflict-a
git merge conflict-b          # CONFLICT! open README.md
# keep the correct lines, delete <<<<<<< ======= >>>>>>> markers
git add README.md
git commit -m "resolve merge conflict"
git checkout main && git merge conflict-a

# Step 10: push (create an EMPTY repo on github.com first, copy its URL)
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```
Screenshot: conflict markers, resolved file, `git log --oneline --graph --all`, GitHub repo page.

## Step 11: CI (GitHub Actions)
`.github/workflows/ci.yml` is already included. It runs `npm install` + `npm test` for the server and `npm install` + `npm run build` for the client on every push.
1. Push once with a **broken test**: e.g. in `server/tests/health.test.js` change `toBe(200)` to `toBe(500)`, commit and push -> GitHub **Actions** tab shows red. Screenshot.
2. Fix it back, commit, push -> green. Screenshot.

## Steps 12-15: Cloud deployment
**Atlas (database):** create free M0 cluster -> Database Access: add user + password -> Network Access: allow `0.0.0.0/0` -> Connect -> Drivers -> copy the connection string. Put it in `server/.env` as `MONGO_URI` (add the database name `/techfest` before the `?`). URL-encode special characters in the password.

**Render (backend):** New -> Web Service -> connect GitHub repo.
| Field | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Env vars | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=<your Netlify URL>` |

Test `https://<your-api>.onrender.com/api/health`. (Free plan sleeps after inactivity; the first request can take about 50 seconds.)

**Netlify (frontend):** Add new site -> Import from GitHub.
| Field | Value |
|---|---|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |
| Env var | `VITE_API_URL=https://<your-api>.onrender.com` |

The redirect rule for React Router is already in `client/public/_redirects`. After you get the Netlify URL, go back to Render and set `CLIENT_URL` to it (no trailing slash), then redeploy.

**Step 15:** open the Netlify URL, register a user, check the document in Atlas (Browse Collections -> `users`), and screenshot the https lock.

## Steps 16-17: Performance
- Gallery is lazy-loaded in `client/src/App.jsx` (`React.lazy`) and images use `loading="lazy"`.
- `cd client && npm run build` prints file sizes. Note them. For a "before" number, temporarily change the Gallery import in `App.jsx` to a normal `import` and build again.
- Lighthouse: Chrome -> F12 -> Lighthouse -> Analyze on the live URL. Save the report, fix at least 4 items (examples: real image compression/WebP, `alt` text, `width`/`height` on images, meta description, remove unused JS), and re-run. Screenshot before and after.

## Step 18 and Question 8: Report checklist
- Architecture diagram: `React (Netlify) -> Express API (Render) -> MongoDB (Atlas)`
- 3 live URLs (frontend, backend, database cluster)
- Security before/after screenshots (injection, XSS, cookie flags in DevTools -> Application -> Cookies)
- Red and green CI screenshots
- Lighthouse before/after
- Live site on desktop, mobile (DevTools device mode) and at least 2 browsers

## Run the tests
```bash
cd server && npm test
```
