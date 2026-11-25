# English Coach — Live Call on Windows (os.neu Setup 1.0.21)

> **Ship:** Windows Setup **1.0.21** · Door B [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe)  
> **Release:** [os-neu-setup-1.0.21-2026-11-25](https://github.com/Nueavenue/os-neuavenue/releases/tag/os-neu-setup-1.0.21-2026-11-25)  
> **Date:** 2026-11-25

## Demo film (~20s)

Host NeuSpeak Free Talk → **Start Live Call** (soccer / Manchester United 2026 practice lead). Compact **mp4** (~97 KB).

![English Coach Live Call — soccer practice (~20s)](/manual/video/ec-live-call-soccer-20s.mp4 "EC Live Call soccer demo")

![Before Live Call](/manual/img/ec-live-call-before.webp)

![Live — coach listening](/manual/img/ec-live-call-soccer-poster.webp)

![After ~20s on Live Call](/manual/img/ec-live-call-20s.webp)

Readable page (this guide): [view.html?doc=ec-live-call-windows-guide.md](https://docs.neuavenue.com/view.html?doc=ec-live-call-windows-guide.md)

## What you get

| Piece | Behaviour |
|-------|-----------|
| **Start Live Call** | One click continuous conversation (OpenAI Realtime WebRTC) |
| Free Talk clip mode | Record → Send still available as fallback |
| Instant feedback | Updates each turn; Brain / battle history persists |
| Electron | Mic allowed for NeuSpeak iframe (`:5180`); SDP relay on NeuSpeak |

## Install (customer)

1. Open https://os.neuavenue.com/welcome → **Download os.neu for Windows**  
   (or https://os.neuavenue.com/downloads/os.neu-Setup.exe).
2. SmartScreen: **More info → Run anyway**.
3. Install under your user folder → Start Menu → **os.neu**.
4. Title / about should show **v1.0.21**.

## English Coach + NeuSpeak

EC embeds NeuSpeak (default `http://127.0.0.1:5180`).

| Seat | What to run |
|------|-------------|
| Dev / lab (Linux host) | `npm run neuspeak` (or Data-01 Vite on `:5180`) |
| VirtualBox guest → host NeuSpeak | Set `NEUOS_NEUSPEAK_URL=http://10.0.2.2:5180` before starting os.neu (host must bind NeuSpeak to `0.0.0.0:5180`) |

Without NeuSpeak reachable, EC shows the offline Reload hint — Live Call cannot start.

## Practice topic (demo script, ~20s)

Lead the coach on **football / Manchester United 2026 match records**:

1. “Hi coach — today I want to talk about Manchester United’s 2026 match record.”  
2. “How many league wins and goals did they pick up across 2026 fixtures?”  
3. “Who was their top scorer in those 2026 matches?”

Then stop Live Call or End session.

## Evidence (lab 2026-11-25)

| Artifact | Where |
|----------|--------|
| Demo **mp4** | [/manual/video/ec-live-call-soccer-20s.mp4](/manual/video/ec-live-call-soccer-20s.mp4) (~97 KB) |
| Stills | `/manual/img/ec-live-call-*.webp` |
| Setup SHA | Control-tower evidence folder (Door B 110 MB exe) |
| Guest Win film | **Blocked** — `fconline-win` password for **billylee** UNKNOWN |

## Related

- [manual.en.md](./manual.en.md) — Windows Setup chapter  
- Control-tower: `REPORT-DEPLOY-WIN-SETUP-EC-LIVE-1.0.21-2026-11-25.md`
