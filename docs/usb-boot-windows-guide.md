# Windows USB boot — with photos

This page is **only for Windows**.  
If you use Ubuntu / Linux, open the Linux guide instead: [usb-boot-linux-guide.md](./usb-boot-linux-guide.md)

You will: turn on Windows → open welcome → download the USB file → burn with **Rufus** → restart → pick USB.

Your Windows disk (`C:`) is **not** wiped when you burn a USB stick — as long as you pick **only the stick** in Rufus.

Full manual: [manual.en.md](./manual.en.md) · Plant as a Windows app (not USB): [windows-install-guide.md](./windows-install-guide.md)

---

## Remember this one rule

| For USB boot on Windows | Not USB |
|-------------------------|---------|
| **USB image ISO (Linux JeOS)** | **Download os.neu for Windows** (= Setup app on Start Menu) |
| Burn with **Rufus** (or Etcher) | That Setup path does not make a boot stick |

The ISO is a **Linux JeOS** image. Windows only helps you **burn** it. After reboot from USB you see a Linux-style console first.

---

## Step 1 — Start on Windows

![Windows 11 desktop](/manual/img/91-usb-s1-windows.webp)

*Normal Windows desktop is fine. Open a browser from here.*

---

## Step 2 — Open welcome

Go to: **https://os.neuavenue.com/welcome/**

![Welcome page](/manual/img/92-usb-s2-welcome.webp)

*Press **USB image ISO (Linux JeOS)**. Do not press “Download os.neu for Windows” if you want USB boot.*

---

## Step 3 — Get the tools

1. ISO: https://os.neuavenue.com/downloads/neuos-live.iso (~360 MB)  
2. Rufus: https://rufus.ie/  
3. Empty USB stick (or one you may erase). Never choose `C:`.

---

## Step 4 — Burn with Rufus

1. Plug in the USB stick.  
2. Open Rufus → Device = **your stick only**.  
3. Boot selection = the `neuos-live.iso` file.  
4. Start → wait → safely eject.

*(If you already planted Setup, the in-app USB icon only opens this guide — it does not write the disk for you.)*

---

## Step 5 — Restart and pick USB

1. Leave the stick plugged in. Save work.  
2. Restart. At the PC logo press **F8 / F12 / Esc** (brand differs).  
3. Choose **UEFI: … USB …**. Do not pick the Windows hard disk.

![Boot menu phase](/manual/img/94-usb-s8-menu.webp)

*A short countdown on the neuOS menu is normal.*

---

## Step 6 — Success or BusyBox

**Success:** dark text ending with:

```text
[os.neu] >
```

**If you see BusyBox / “payload not found”:**

![payload not found](/manual/img/95-usb-s9-busybox.webp)

1. Hold power to turn off.  
2. Unplug USB → turn on → Windows returns.  
3. Ask for the **Boot kit** path on a Linux PC, or an updated ISO.  
4. Do **not** type `exit` on that screen.

---

## Done

- Windows Setup (Start Menu) ≠ USB boot. Two different doors.  
- Confused? Use this Windows page only — skip the Linux page.

**Filed · Windows USB boot · docs.neuavenue.com · 2026-11-25**
