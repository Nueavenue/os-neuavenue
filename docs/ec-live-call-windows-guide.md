# English Coach — Live Call on Windows (os.neu Setup 1.0.21)

> **Ship:** Windows Setup **1.0.21** · Door B [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe)  
> **Release:** [os-neu-setup-1.0.21-2026-11-25](https://github.com/Nueavenue/os-neuavenue/releases/tag/os-neu-setup-1.0.21-2026-11-25)  
> **Date:** 2026-11-25

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

Folder: `docs/operations/evidence/EC-LIVE-CALL-WIN-2026-11-25/`

| Artifact | Notes |
|----------|--------|
| `os.neu-Setup-1.0.21.exe.sha256` | Door B download verified (110 MB) |
| `vm-desktop-01.png` / `vm-after-enter.png` | `fconline-win` lock → password for **billylee** |
| `host-talk-*.png` + `ec-live-call-soccer-20s.webm` | Host NeuSpeak `/talk` → Start Live Call (~20s) |
| `soccer-dialogue-script.txt` | Scripted lead lines |

**Honest gap:** In-guest Windows UI for EC Live Call needs the **billylee** password (guestcontrol session not available). Unlock VM, install Setup 1.0.21, point `NEUOS_NEUSPEAK_URL` at the host, then re-run the soccer script on Windows for a full guest film.

## Related

- [manual.en.md](./manual.en.md) — Windows Setup chapter  
- Control-tower: `REPORT-DEPLOY-WIN-SETUP-EC-LIVE-1.0.21-2026-11-25.md`
