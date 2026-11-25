# USB boot on Windows — easy photo walk (kids OK)

This page is **only for Windows**.  
Every photo below is from a **Windows PC path** (or a Windows tool page) — not an Ubuntu desktop.  
Linux friends: use [usb-boot-linux-guide.md](./usb-boot-linux-guide.md).

> **Big idea:** A USB stick is a **key**. On Windows you download the ISO, burn it with **Rufus**, restart, and pick USB. Keep **`C:`** safe — burn **only the stick**.

**Honest status:** Multi-boot menu (**S8**) works. Prefer a **fresh ISO** (Door B → `neuos-live-iso-2026-11-25`).  
[STATUS](./STATUS-USB-BOOT-CURRENT-ADDRESS-S8-PASS-S9-2026-11-25.md)

Local capture pack: `docs/operations/evidence/USB-BOOT-WINDOWS-RECAPTURE-2026-11-25/`

---

## Picture map (Windows only)

![Windows step map](/manual/img/99-usb-win-step-map.webp)

| Stop | What you do | Photo |
|------|-------------|-------|
| 1 | Windows desktop | Win11 VM desktop |
| 2 | welcome website | live welcome (USB ISO pill) |
| 3 | Download ISO (Door B) | 302 → GitHub release |
| 4 | Rufus on Windows | Rufus download + burn checklist |
| 5 | Stick ready / Windows still up | Win desktop after USB work |
| 6 | Restart → neuOS menu (S8) | neuOS GRUB |

**Not USB boot:** **Download os.neu for Windows** (Setup.exe → Start Menu).

---

## Stop 1 — Start on Windows

![Windows 11 desktop](/manual/img/91-usb-win-s1-desktop.webp)

*Windows 11 desktop (capture: `win-usb-s1-desktop.png`). Open Edge or Chrome.*

---

## Stop 2 — Open welcome (Windows browser)

Go to: **https://os.neuavenue.com/welcome/**

![welcome hero with USB ISO pill](/manual/img/92-usb-win-s2-welcome.webp)

*Press the pill **USB image ISO (Linux JeOS)**.  
That name means the USB image is a JeOS boot image — you still burn it **on Windows with Rufus**.  
Do **not** press **Download os.neu for Windows** if you want a boot stick.*

![Windows path card on welcome](/manual/img/92b-usb-win-s2-windows-card.webp)

*Welcome also explains Setup vs USB. For this tutorial stay on the **USB ISO** path.*

---

## Stop 3 — Download the ISO (deployed file)

1. Open: https://os.neuavenue.com/downloads/neuos-live.iso  
2. The site answers **302** to GitHub release **`neuos-live-iso-2026-11-25`**.  
3. Save `neuos-live.iso` (~360 MB).

![ISO Door B deploy](/manual/img/93-usb-win-s3-iso-deploy.webp)

*Verified headers saved as `win-usb-s3-iso-302-headers.txt`.*

Also get Rufus: https://rufus.ie/ → **rufus-4.16.exe** (Windows x64).

![Rufus download page](/manual/img/94-usb-win-s4-rufus-download.webp)

---

## Stop 4 — Burn with Rufus (Windows only)

1. Plug in the USB stick.  
2. Open Rufus.  
3. **Device** = your USB stick only — never **`C:`**.  
4. **Boot selection** = **`neuos-live.iso`** (not any `ubuntu-*.iso`).  
5. **Start** → wait → safely eject.

![Rufus burn checklist for neuos-live.iso](/manual/img/94b-usb-win-s4-rufus-burn.webp)

*Checklist card for the Windows burn. Guest Rufus GUI was not available in the lab VM (USB controller off) — use this + the Rufus site shot.*

![Windows desktop after USB work](/manual/img/95-usb-win-s5-desktop.webp)

*Windows stays on its own desktop while the stick is prepared (`win-usb-s5-desktop.png`).*

---

## Stop 5 — Restart and pick USB

1. Leave the stick plugged in. Save work.  
2. Restart. At the logo press **F8 / F12 / Esc**.  
3. Choose **UEFI: … USB …**.  
4. Do **not** pick the Windows hard disk.

---

## Stop 6 — neuOS menu (S8)

![neuOS multi-boot menu](/manual/img/96-usb-win-s8-grub.webp)

*Same neuOS menu after USB boot (not an Ubuntu desktop). Countdown is normal.*

---

## Goal screen

![os.neu prompt success](/manual/img/98-usb-win-s9-osneu.webp)

Success ends with:

```text
[os.neu] >
```

Type `help`.

---

## If you see BusyBox instead

![BusyBox stop guidance](/manual/img/95b-usb-win-s9-busybox.webp)

1. Hold **power** off.  
2. Unplug USB → Windows returns.  
3. Re-download the **new** ISO, or use Boot kit on a Linux PC.  
4. Do **not** type `exit`.

---

## Done

- This page uses **Windows captures + Windows tools only** for stops 1–5.  
- Stops 6+ are the neuOS boot screens (after you leave Windows).  
- Setup.exe ≠ USB boot.

**Filed · Windows USB recapture · 2026-11-25**
