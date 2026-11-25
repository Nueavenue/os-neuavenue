# USB boot on Windows — easy photo walk (kids OK)

This page is **only for Windows**.  
Linux friends: use [usb-boot-linux-guide.md](./usb-boot-linux-guide.md) instead.

> **Big idea:** A USB stick is like a **magic key**. You put os.neu on the key, restart the PC, and choose that key. Your Windows `C:` drive stays safe if you burn **only the stick**.

**Where we are (honest):**  
You **can** reach the neuOS **multi-boot menu (S8)**.  
An **old** ISO could stop at **BusyBox** (not the goal).  
**Download a fresh ISO** from welcome (2026-11-25+), or ask for **Boot kit** on Linux.  
Full status: [STATUS-USB-BOOT-CURRENT-ADDRESS-S8-PASS-S9-2026-11-25.md](./STATUS-USB-BOOT-CURRENT-ADDRESS-S8-PASS-S9-2026-11-25.md)

---

## Picture map

![Step map](/manual/img/99-usb-step-map.webp)

*Six stops. Read one stop at a time.*

| Stop | What you do | Picture |
|------|-------------|---------|
| 1 | Turn on Windows | desktop |
| 2 | Open welcome website | welcome |
| 3 | Download the USB file | ISO |
| 4 | Burn **only** the stick with Rufus | stick |
| 5 | Restart → pick USB | boot menu |
| 6 | See neuOS menu (**S8 success**) | GRUB |

**Not this door:** **Download os.neu for Windows** (Setup) puts an app in Start Menu. That is **not** USB boot.

---

## Stop 1 — Start on Windows

![Windows desktop](/manual/img/91-usb-s1-windows.webp)

*Normal Windows is fine. Open a browser (Edge or Chrome).*

---

## Stop 2 — Open welcome

Go to: **https://os.neuavenue.com/welcome/**

![Welcome page](/manual/img/92-usb-s2-welcome.webp)

*Press **USB image ISO (Linux JeOS)**.*  
*Do **not** press “Download os.neu for Windows” if you want a boot stick.*

---

## Stop 3 — Get the tools

1. ISO file: https://os.neuavenue.com/downloads/neuos-live.iso (~360 MB) — **get a new copy**  
2. Rufus: https://rufus.ie/  
3. An empty USB stick (or one you may erase)

**Golden rule:** In Rufus, never choose **`C:`**. Only the USB stick.

---

## Stop 4 — Burn with Rufus

1. Plug in the USB stick.  
2. Open Rufus.  
3. **Device** = your USB stick only.  
4. **Boot selection** = the `neuos-live.iso` file.  
5. Press **Start** → wait → safely eject.

![USB stick connected](/manual/img/93-usb-s5-stick.webp)

*The stick is the key. The computer’s hard disk is not the key.*

---

## Stop 5 — Restart and pick USB

1. Leave the stick plugged in. Save homework.  
2. Restart the PC.  
3. At the logo, press **F8**, **F12**, or **Esc** (brands differ).  
4. Choose **UEFI: … USB …**.  
5. Do **not** pick the Windows hard disk.

---

## Stop 6 — neuOS menu (S8) — you made it this far!

![neuOS multi-boot menu](/manual/img/96-usb-s8-grub.webp)

*This menu means the USB key worked. A short countdown is normal.*  
*Top line often says **neuOS (this ISO)**.*

---

## Goal screen

![Goal [os.neu] >](/manual/img/98-usb-s9-osneu.webp)

*Success looks like a dark screen ending with:*

```text
[os.neu] >
```

You can type `help`.

---

## If you see BusyBox instead

![BusyBox stop](/manual/img/95-usb-s9-busybox.webp)

1. Hold the **power** button to turn off.  
2. **Unplug** the USB stick.  
3. Turn on → Windows comes back.  
4. Download the **new** ISO again, or use **Boot kit** on a Linux PC.  
5. Do **not** type `exit` on BusyBox.

---

## Done

- Windows Setup ≠ USB boot. Two different doors.  
- Confused? Stay on **this Windows page** only.

**Kids tip:** If a grown-up helps with Rufus, ask them to point at the **stick name**, not `C:`.

**Filed · Windows USB photo tutorial · docs.neuavenue.com · 2026-11-25**
