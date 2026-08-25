# os.neu

Public English landing for NeuAvenue **os.neu**: download a USB boot kit and follow the tutorial. Chrome matches [neuavenue-landing](https://github.com/Nueavenue/neuavenue-landing) (nav, indigo/emerald body, centered footer) so this subdomain reads as the same company site.

- Site files: `index.html`, `tutorial.html`, `welcome.css`, `site.js`, `brand/`, `downloads/neuos-boot-kit.tar.gz`
- Production hostname: **os.neuavenue.com** (keep [neuavenue.com](https://neuavenue.com/) as the company home)
- Public product name: **os.neu** (not neuOS)

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

### Fix error 100117 (hostname already has DNS records)

Wrangler uploaded the Worker, then failed while attaching **neuos.neuavenue.com**. The Worker is already live at `https://os-neuavenue.neuavenue.workers.dev`.

Cloudflare will not overwrite a hostname you created by hand (code **100117**).

1. [DNS Records](https://dash.cloudflare.com/) → zone **neuavenue.com**.
2. Delete the **neuos** CNAME (`neuos.neuavenue.com` → `os.neuavenue.com`).
3. If **os** still CNAMEs to `os-neuavenue.pages.dev`, delete that row too. Do **not** delete the apex `neuavenue.com` company-home record.
4. Redeploy (`npx wrangler deploy` in the dashboard, or push to `main`).
5. After **os.neuavenue.com** works, add a new CNAME:

```
Type   Name   Target              Proxy
CNAME  neuos  os.neuavenue.com    Proxied
```

`wrangler.toml` attaches **only** `os.neuavenue.com`. `neuos` stays a DNS alias.

### Fix error 1014 (current DNS)

1. DNS → Records: delete the manual `os` CNAME to `os-neuavenue.pages.dev` (or leave it; the next step overwrites it).
2. **Workers & Pages** → open **os-neuavenue** (Worker, not a Pages custom-domain attach).
3. **Domains & Routes** → **Add** → **Custom domain** → `os.neuavenue.com`.
4. Add `neuos.neuavenue.com` the same way (do not CNAME `neuos` → `os` while `os` is still 1014).
5. Wait for SSL. Open https://os.neuavenue.com

`wrangler.toml` already lists both hostnames as `custom_domain` routes. A deploy with zone DNS permission can attach them too.

### GitHub Action token (Edit zone DNS + Workers)

Create the token at **[My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)** (not on the DNS Records page). Official docs: [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

1. **Create Token** → use template **Edit Cloudflare Workers**.
2. **+ Add more** and add **Zone / DNS / Edit**.
3. Optional but useful: **Account / Account Settings / Read** and **Zone / Workers Routes / Edit**.
4. **Account resources:** this account only. **Zone resources:** **neuavenue.com** only.
5. **Create Token** → copy it once.
6. Account ID: dashboard URL `https://dash.cloudflare.com/<ACCOUNT_ID>/…` or Workers overview.
7. GitHub → **Settings → Secrets and variables → Actions**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
8. Re-run **Deploy Cloudflare**.

Full walkthrough: [TOKEN.md](./TOKEN.md).

Secrets for GitHub Action: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## USB kit

`downloads/neuos-boot-kit.tar.gz` — see `/tutorial.html`.
