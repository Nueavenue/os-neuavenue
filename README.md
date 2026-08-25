# os.neuavenue.com

Public English landing for Neuavenue **neuOS**: download a USB boot kit and follow the tutorial. The in-app kiosk stays multilingual; this site and GitHub copy are English-first.

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

Then use **Custom domains** → `os.neuavenue.com`. Cloudflare will write the DNS record.

Do **not** hand-create a Proxied CNAME to `os-neuavenue.pages.dev`. That hostname is on Cloudflare’s own zone, so the orange cloud returns **error 1014** (CNAME Cross-User Banned). `os-neuavenue.pages.dev` also does not exist if the project was deployed with `wrangler deploy` (that is a **Worker**, URL `*.workers.dev`).

### Fix error 1014 (current DNS)

1. DNS → Records: delete the manual `os` CNAME to `os-neuavenue.pages.dev` (or leave it; the next step overwrites it).
2. **Workers & Pages** → open **os-neuavenue** (Worker, not a Pages custom-domain attach).
3. **Domains & Routes** → **Add** → **Custom domain** → `os.neuavenue.com`.
4. Add `neuos.neuavenue.com` the same way (do not CNAME `neuos` → `os` while `os` is still 1014).
5. Wait for SSL. Open https://os.neuavenue.com

`wrangler.toml` already lists both hostnames as `custom_domain` routes. A deploy with zone DNS permission can attach them too.

Secrets for GitHub Action (optional): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## USB kit

`downloads/neuos-boot-kit.tar.gz` — see `/tutorial.html`.
