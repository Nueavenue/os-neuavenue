# os.neuavenue.com

Neuavenue **neuOS** public landing: download a USB boot kit and follow the tutorial.

- Site files: `index.html`, `tutorial.html`, `brand/`, `downloads/neuos-boot-kit.tar.gz`
- Production hostname: **os.neuavenue.com** (keep [neuavenue.com](https://neuavenue.com/) as the company home)

## Local preview

```bash
python3 -m http.server 8080
# http://127.0.0.1:8080
```

## Cloudflare (fix for `wrangler deploy` error)

The dashboard was running **`npx wrangler deploy`**. That is a **Workers** command. This repo is a static site, so `wrangler.toml` now has `[assets]` so that command works.

### If Git is already connected (your current setup)

Keep **Deploy command:** `npx wrangler deploy`  
Push to `main`. It should no longer ask for `src/index.ts`.

### If you start a new Pages project instead

Do **not** set a deploy command.

- Framework preset: **None**
- Build command: empty
- Build output directory: `/`

Then use **Custom domains** → `os.neuavenue.com`.

```
CNAME  os  →  os-neuavenue.pages.dev   (or *.workers.dev after Worker+assets)
```

Secrets for GitHub Action (optional): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## USB kit

`downloads/neuos-boot-kit.tar.gz` — see `/tutorial.html`.
