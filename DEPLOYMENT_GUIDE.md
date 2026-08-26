# Deploying Skyline to the internet — a beginner's step-by-step guide

Goal: get your weather app onto a public web address (like
`https://skyline-weather.onrender.com`) that anyone in the world can open.

The plan has two parts:

- **Part A:** put your code on **GitHub** (a place that stores code online).
- **Part B:** connect that GitHub code to **Render**, which runs it and gives
  you the public link.

Prerequisite: make sure `npm run build` runs with no red `error` lines first.

---

## Part A — Put your code on GitHub (using GitHub Desktop)

GitHub Desktop is a free app with buttons instead of typed commands — much
friendlier than the command line.

### A1. Install GitHub Desktop
1. Open your browser and go to **https://desktop.github.com**
2. Click **Download for Windows**, then run the downloaded installer.
3. When it opens, click **Sign in to GitHub.com** and log in with your GitHub
   account (the browser will pop up to confirm — click **Authorize**).
4. If it asks for "Git config" / your name and email, just click **Continue**
   / **Finish** (the defaults are fine).

### A2. Add your weather project
1. In GitHub Desktop's top menu: **File → Add local repository…**
2. Click **Choose…** and select your folder:
   `C:\Users\Amit\OneDrive\Desktop\weather` → **Select Folder**.
3. It will say *"This directory does not appear to be a Git repository."*
   Click the blue link **"create a repository"**.
4. A "Create a repository" box appears. Leave everything as-is:
   - Name: `weather` (fine as is)
   - Do **not** tick "Initialize with a README"
   - Git ignore: **None**, License: **None**
   - Click **Create Repository**.

### A3. Save a snapshot (commit)
1. On the left you'll now see a list of your project files (this is normal —
   `node_modules` is correctly hidden, so it stays small).
2. At the bottom-left, in the **Summary** box, type: `Initial commit`
3. Click the blue **Commit to main** button.

### A4. Upload it to GitHub (publish)
1. At the top, click **Publish repository**.
2. In the box:
   - Keep the name `weather`.
   - **Untick** "Keep this code private" (public is simplest, and there are no
     secrets in this project). Private also works if you prefer.
   - Organization: **None / your username**.
   - Click **Publish repository**.
3. Done! Your code is now on GitHub. (You can click **View on GitHub** to see
   it in your browser.)

**Checkpoint:** send a screenshot after this step before starting Part B.

---

## Part B — Host it on Render

### B1. Create a Render account
1. Go to **https://render.com** and click **Get Started** (or **Sign In**).
2. Choose **GitHub** to sign up. A GitHub page appears asking to authorize
   Render — click **Authorize Render**.

### B2. Create the web service
1. In the Render dashboard, click the **New +** button (top right) →
   **Web Service**.
2. Under "Connect a repository", find **weather** in the list and click
   **Connect**.
   - If you don't see it: click **Configure account** / **Configure GitHub App**,
     choose your account, and grant access to the `weather` repo (or "All
     repositories"), then come back — it will appear.

### B3. Fill in the settings
On the configuration page, set these (labels may look slightly different):

| Field            | What to enter                                     |
| ---------------- | ------------------------------------------------- |
| **Name**         | `skyline-weather` (this becomes your web address) |
| **Region**       | Pick the closest (e.g. Singapore)                 |
| **Branch**       | `main`                                            |
| **Root Directory** | *(leave blank)*                                 |
| **Runtime**      | `Node` (usually auto-detected)                    |
| **Build Command**  | `npm install --include=dev && npm run build`    |
| **Start Command**  | `npm start`                                      |
| **Instance Type** | **Free**                                         |

### B4. Add two environment variables
Find the **Environment Variables** (or "Advanced") section and click **Add
Environment Variable** twice:

| Key            | Value        |
| -------------- | ------------ |
| `NODE_ENV`     | `production` |
| `NODE_VERSION` | `20`         |

Do **not** add anything else (in particular, no `VITE_API_BASE_URL`).

### B5. Deploy
1. Click **Create Web Service** (or **Deploy Web Service**) at the bottom.
2. A log screen opens and text scrolls for a few minutes (it's installing and
   building). This first build is the slow one — that's normal.
3. When you see **"Your service is live 🎉"** and a status of **Live**, look
   near the top for your URL: **`https://skyline-weather.onrender.com`**
   (yours will match the name you chose).
4. Click that link — your weather app opens on the public internet. Share it
   with anyone!

**Checkpoint:** send a screenshot of the Render page once it says Live (or if
any log line turns red).

---

## After it's live — good to know

- **First visit after a quiet period is slow.** On the free plan, the app
  "sleeps" after ~15 minutes of no visitors and takes ~30–60 seconds to wake up
  on the next visit. After that it's fast. This is normal for free hosting.
- **Updating the app later:** make your changes, then in GitHub Desktop do
  **Commit to main → Push origin**. Render sees the change and re-deploys
  automatically within a minute or two.
- **Your link is shareable** on WhatsApp, email, anywhere. It works on phones
  too.

## Troubleshooting

- **Repo not showing in Render:** click *Configure account* and grant Render
  access to the `weather` repository, then refresh.
- **Build failed, log mentions `tsc` or `vite` "not found":** the Build Command
  is wrong — it must be exactly `npm install --include=dev && npm run build`.
- **Build failed with a red TypeScript error:** copy the error; the same thing
  would show with `npm run build` locally, and it's fixable.
- **App loads but says it can't reach the weather service:** confirm you did
  **not** set `VITE_API_BASE_URL`, and that the deploy finished as "Live".
- **"Application failed to respond":** usually still waking up — wait a minute
  and refresh.
