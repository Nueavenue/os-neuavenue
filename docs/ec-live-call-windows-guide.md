# English Coach — Live Call on Windows (os.neu Setup)

> **Ship:** Windows Setup **1.0.32+** · Door B [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe)  
> **EC host (product):** **https://speak.neuavenue.com**  
> **Updated:** 2026-11-26 (GRANT — speak.neuavenue.com fixed)

## What you get

| Piece | Behaviour |
|-------|-----------|
| **EC / English Conversation** | iframe → **https://speak.neuavenue.com** (same for Try it + Setup plant) |
| **Start Live Call** | Continuous conversation (OpenAI Realtime WebRTC) when speak host is up |
| Free Talk clip mode | Record → Send still available as fallback |
| Lab override | `NEUOS_NEUSPEAK_URL=http://127.0.0.1:5180` (or VM → `http://10.0.2.2:5180`) |

## Install (customer)

1. Open https://os.neuavenue.com/welcome → **Download os.neu for Windows**  
   (or https://os.neuavenue.com/downloads/os.neu-Setup.exe).
2. SmartScreen: **More info → Run anyway**.
3. Install → Start Menu → **os.neu**.
4. Title should show **v1.0.32** (or newer).
5. Open **EC** — no local NeuSpeak install required when **speak.neuavenue.com** is live.

## English Coach + speak.neuavenue.com

| Seat | EC URL |
|------|--------|
| Try it (browser) | `https://speak.neuavenue.com` |
| Windows / Linux Setup plant | `https://speak.neuavenue.com` (default) |
| Lab / USB offline | Set `NEUOS_NEUSPEAK_URL=http://127.0.0.1:5180` and run local NeuSpeak |

If EC shows offline: speak host DNS/app may not be ready yet, or set a lab override.

## DNS / host (ops — Leader)

`speak.neuavenue.com` must resolve and serve NeuSpeak (e.g. Vercel project custom domain + Cloudflare CNAME).  
Until DNS exists, EC probe fails by design.

## Related

- [manual.en.md](./manual.en.md) — Windows Setup chapter  
- Control-tower: `REPORT-GRANT-SPEAK-NEUAVENUE-COM-2026-11-26.md`
