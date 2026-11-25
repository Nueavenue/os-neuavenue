# USB boot on Linux — easy photo walk (kids OK)

This page is **only for Ubuntu / Linux**.  
Windows friends: use [usb-boot-windows-guide.md](./usb-boot-windows-guide.md) instead.

> **Big idea:** A USB stick is like a **magic key**. You put os.neu on the key, restart, and choose that key. Your Linux disk (`/`) stays safe if you burn **only the stick**.

**Where we are (honest):**  
You **can** reach the neuOS **multi-boot menu (S8)**.  
An **old** ISO could stop at **BusyBox**.  
**Best path:** **Boot kit** + `make-usb`. Fresh ISO (2026-11-25+) also aims for the goal screen.  
Status: [STATUS-USB-BOOT-CURRENT-ADDRESS-S8-PASS-S9-2026-11-25.md](./STATUS-USB-BOOT-CURRENT-ADDRESS-S8-PASS-S9-2026-11-25.md)

---

## Picture map

![Step map](/manual/img/99-usb-step-map.webp)

| Stop | What you do | Notes |
|------|-------------|-------|
| 1 | Unlock Linux | browser ready |
| 2 | Open welcome | website |
| 3 | Download ISO **or Boot kit** | Boot kit = recommended |
| 4 | Plug stick · burn **only** stick | Etcher or `make-usb` |
| 5 | Restart → pick USB | F8 / F12 / Esc |
| 6 | See neuOS menu (**S8**) | success so far |

**Not this door:** **Linux screen pack** = plant (Applications). That is **not** USB boot.

---

## Stop 1 — Start on Linux

![Linux lock / desktop](/manual/img/90-usb-s1-linux.webp)

*Unlock so you can open a browser.*

---

## Stop 2 — Open welcome

Go to: **https://os.neuavenue.com/welcome/**

![Welcome page](/manual/img/92-usb-s2-welcome.webp)

*Press **USB image ISO (Linux JeOS)** or **Download boot kit**.*  
*Skip “Linux screen pack” if you want USB boot.*

---

## Stop 3 — Get the files

- ISO: https://os.neuavenue.com/downloads/neuos-live.iso (~360 MB)  
- **Boot kit (recommended):** https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz  
- Easy burner: https://etcher.balena.io/  
- Empty USB stick

**Golden rule:** Never burn the disk that holds **`/`** (your Ubuntu).

---

## Stop 4 — Plug in and burn

![USB on Ubuntu](/manual/img/93-usb-s5-stick.webp)

*Stick connected. Desktop can stay open.*

### Easy way — Etcher

1. Open balenaEtcher.  
2. Flash → choose the ISO.  
3. Select **only** the USB stick.  
4. Flash → wait.

### Best way — Boot kit (grown-up may help)

```bash
# unpack the boot kit first, then:
bash scripts/make-usb.sh --list
# look at the list — pick the USB letter, not the big disk with /
sudo bash scripts/make-usb.sh /dev/sdX --yes   # only after --plan / empty stick
# refresh an old os.neu stick:
sudo bash scripts/make-usb.sh /dev/sdX --update
```

More detail: [usb-console-guide.md](./usb-console-guide.md)

---

## Stop 5 — Restart and pick USB

1. Leave the stick plugged in. Save work.  
2. Restart. At the logo press **F8 / F12 / Esc**.  
3. Choose **UEFI: … USB …**.  
4. Do **not** pick the internal Ubuntu disk.

---

## Stop 6 — neuOS menu (S8)

![neuOS multi-boot menu](/manual/img/96-usb-s8-grub.webp)

*You reached the multi-boot screen. Countdown is normal.*  
*Lines may say **neuOS (this ISO)** and **os.neu (NEUOS-ROOT / make-usb stick)**.*

---

## Goal screen

![Goal [os.neu] >](/manual/img/98-usb-s9-osneu.webp)

```text
[os.neu] >
```

Type `help` when you see this.

---

## If you see BusyBox instead

![BusyBox stop](/manual/img/95-usb-s9-busybox.webp)

1. Hold **power** to turn off.  
2. Unplug USB → boot Ubuntu again.  
3. Prefer **Boot kit** + `make-usb.sh --update`, or a **new ISO**.  
4. Do **not** type `exit`.

---

## Done

- Plant (Applications) ≠ USB boot.  
- Windows users should open the Windows guide — not this page.

**Kids tip:** Ask a grown-up to run `--list` and circle the USB line together before any `sudo` burn.

**Filed · Linux USB photo tutorial · docs.neuavenue.com · 2026-11-25**
