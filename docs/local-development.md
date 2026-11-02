# Local development

How to set up, run, test and troubleshoot the InterviewSetu frontend on your machine. The backend has the same guide in [interview-planner-backend/docs/local-development.md](https://github.com/Interview-planner/Interview-planner-backend/blob/main/docs/local-development.md).

## 1. First-time setup

You need:

| Tool | Version | Check |
|---|---|---|
| Node.js | 20.9+ (backend needs 20.19+) | `node -v` |
| pnpm | 10 (pinned in `package.json` → `packageManager`) | `pnpm -v` |
| Git Bash (Windows only) | any | the start/stop scripts are bash |

Install pnpm once:

```bash
corepack enable            # uses the exact version from package.json
# If that fails with EPERM (it needs admin rights on Windows):
npm install -g pnpm@10
```

Clone both repos **next to each other**. The scripts and Playwright look for the backend at `../interview-planner-backend`:

```
Interview-planner/
  interview-planner-backend/
  interview-planner-ui/
```

Then, in this repo:

```bash
cp .env.example .env.local   # start_frontend.sh offers to do this for you
pnpm install
```

`.env.local`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:40051` | Backend to connect to, without `/api/v1`. Change the port if your backend runs elsewhere (e.g. `http://localhost:40051`), then restart the UI |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:40050` | This site's URL, for metadata |
| `PORT` | `40050` | Optional; port for `next dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | none | Supabase project URL, for sign-in. **Required**: pages fail without it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | none | Supabase anon (public) key. **Required** |

## 2. Daily use

Run these from **Git Bash** in the `interview-planner-ui` folder.

| I want to… | Command |
|---|---|
| Start frontend + backend | `scripts/start_frontend.sh -b --with-backend` |
| Start the frontend only (live output, Ctrl+C stops) | `scripts/start_frontend.sh` |
| Start on another port | `scripts/start_frontend.sh 8081 -b` |
| See what's running | `scripts/status_frontend.sh --with-backend` |
| Follow the logs | `tail -f .run/dev.log` (backend: `tail -f ../interview-planner-backend/.run/dev.log`) |
| Stop both | `scripts/stop_frontend.sh --with-backend` |
| Stop every frontend dev server from this repo | `scripts/stop_frontend.sh --all` |

The frontend and backend start independently: the UI connects to whatever backend `NEXT_PUBLIC_API_URL` points at, and the backend (in development) accepts the UI from any localhost port. `--with-backend` is only a shortcut.

Then open <http://localhost:40050>. After a `git pull`, just start again; the script reinstalls dependencies if `pnpm-lock.yaml` changed.

Without the scripts: start the backend (`pnpm run dev` in its repo), then `pnpm run dev` here (`PORT=8081 pnpm run dev` for another port).

## 3. The scripts

All three live in `scripts/` and print their options with `--help`.

**`start_frontend.sh [port] [options]`**

| Option | Effect |
|---|---|
| `port` | Port to use. Default: `$PORT`, then `PORT` in `.env.local`, then 40050 |
| `-b`, `--background` | Run in the background; output goes to `.run/dev.log` |
| `-y`, `--yes` | Answer yes to every question |
| `-s`, `--status` | Show status and exit |
| `--with-backend` | Start the backend first (in the background), from `../interview-planner-backend` or `$BACKEND_DIR` |

Before starting it:

1. Checks Node and pnpm versions
2. Runs `pnpm install` if `node_modules` is missing or older than `pnpm-lock.yaml`
3. Offers to create `.env.local` from `.env.example` if it's missing
4. If this frontend is already running, asks **"Stop it and start again?"** (no = leave it running and don't start another)
5. If the port is taken by another frontend from this repo, asks the same; if it's taken by some other program, stops with an error and leaves that program alone
6. If another `next dev` from this folder is running on a different port, offers to stop it (Next allows one per folder)
7. If `.next/dev/lock` was left behind by a crashed server, offers to remove it

Then it prints a startup configuration block (port, mode, Node/pnpm versions, env file, whether the backend is reachable, log and PID files), starts `pnpm run dev`, waits until the page answers, and prints the main URLs. It also warns if the backend is down, or if the backend's `CORS_ORIGINS` doesn't allow this port. With `--with-backend` it adds this port to the backend's allowed origins for that run.

**`stop_frontend.sh [port] [options]`**

| Option | Effect |
|---|---|
| `port` | Port to stop. Default: the port `start_frontend.sh` used, then 40050 |
| `-f`, `--force` | Kill immediately instead of a graceful stop (TERM first, then kill after 5 s; Windows always kills immediately) |
| `-a`, `--all` | Stop every frontend dev server from this repo, on any port |
| `--with-backend` | Stop the backend too |

It stops the whole process tree (`next dev`, its server and Turbopack workers), then checks the port is free. It only stops processes started from this repo.

**`status_frontend.sh [port] [--with-backend]`**: running or stopped, PID, URL and whether it responds.

Files in `.run/` (ignored by git): `dev.log` (output of the last run, starting with the configuration block), `dev.pid`, `dev.port`.

## 4. Tests

```bash
pnpm exec playwright install chromium   # once
pnpm test                               # all Playwright tests, against the mock API
pnpm run test:e2e                       # navigation, filters, 404s
pnpm run test:golden                    # page structure vs __tests__/golden/__golden__/
pnpm run test:mocked                    # API errors, loading states, bookings
E2E_API=real pnpm test                  # against the real backend instead of the mock
pnpm run typecheck && pnpm run build    # what CI runs besides the tests
```

After an intentional UI change: `pnpm run test:golden --update-snapshots`, then review the YAML diff. After the backend's response shapes change: `pnpm run mocks:sync`. See the README's Tests section for details.

## 5. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `⨯ Another next dev server is already running` | A `next dev` from this folder is running on another port. `scripts/stop_frontend.sh --all`, then start again. |
| `Port 40050 is already in use` | `scripts/status_frontend.sh` shows what. If it's ours, start offers to restart it. Otherwise pick another port: `scripts/start_frontend.sh 3001`. |
| `Your project's URL and Key are required to create a Supabase client!` | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing from `.env.local`. Copy them from `.env.example` and fill in the project's values, then restart. |
| Every page returns **500** | The server was started while dependencies were being (re)installed. `scripts/start_frontend.sh -y` restarts it. |
| Pages show "Couldn't reach the API" | Backend not running, or `NEXT_PUBLIC_API_URL` in `.env.local` points at the wrong port. Fix the URL and restart the UI (`scripts/start_frontend.sh -y`); `NEXT_PUBLIC_*` values are read at start. |
| Data loads server-side but not in the browser (CORS error in the console) | The backend isn't in development mode (`NODE_ENV=development` in its `.env` allows any localhost port), or the UI isn't on localhost. Add the origin to the backend's `CORS_ORIGINS`. |
| Stale `.next/dev/lock` | A previous server was killed. Start offers to remove it. |
| `$'\r': command not found` when running a script | The script has Windows line endings. `.gitattributes` prevents this on new checkouts; fix an existing checkout with `rm scripts/*.sh && git checkout -- scripts`. |
| `pnpm: command not found` | See [First-time setup](#1-first-time-setup). Open a new terminal after installing. |
| `corepack enable` fails with `EPERM` | It needs admin rights on Windows. Use `npm install -g pnpm@10`. |
| Scripts do nothing or fail in PowerShell / cmd | They're bash scripts. Use Git Bash (or WSL). |
| A server keeps coming back after you stop it | Something else restarts it (a VS Code task, another terminal). Stop that, then `scripts/stop_frontend.sh --all`. |
