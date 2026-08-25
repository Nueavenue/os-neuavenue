# os.neuavenue.com

Neuavenue **neuOS** public landing: download a USB boot kit and follow the tutorial.

- Site files: `index.html`, `tutorial.html`, `brand/`, `downloads/neuos-boot-kit.tar.gz`
- Production hostname: **os.neuavenue.com** (keep [neuavenue.com](https://neuavenue.com/) as the company home)

## Local preview

```bash
python3 -m http.server 8080
# http://127.0.0.1:8080
```

## GitHub → Cloudflare Pages

1. This repo is `Nueavenue/os-neuavenue`.
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → this repository.
3. Build: no build command. Output directory: `/` (root).
4. After the `*.pages.dev` URL works, **Custom domains** → `os.neuavenue.com`.
5. If `neuavenue.com` is already on Cloudflare, the CNAME is created for you. If the domain lives at another registrar, add:

```
Type   Name  Target                              Proxy
CNAME  os    os-neuavenue.pages.dev              Proxied (orange cloud)
```

Optional alias:

```
CNAME  neuos  os.neuavenue.com
```

GitHub Action `.github/workflows/deploy.yml` deploys on push when you add secrets:

- `CLOUDFLARE_API_TOKEN` (Pages edit)
- `CLOUDFLARE_ACCOUNT_ID`

Then: `wrangler pages project create os-neuavenue` once, or let the dashboard create the project.

## USB kit

`downloads/neuos-boot-kit.tar.gz` contains `scripts/make-usb.sh` and `boot/` templates. It does **not** auto-format a stick from the browser. See `/tutorial.html`.
