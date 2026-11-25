# Linux USB boot — with photos

This page is **only for Ubuntu / Linux**.  
If you use Windows, open the Windows guide instead: [usb-boot-windows-guide.md](./usb-boot-windows-guide.md)

> **Current address (2026-11-25):** You **do** reach the multi-boot (GRUB) menu (**S8 PASS**). On the **old** Door B ISO (2026-08-31), the next step could stop at **BusyBox** instead of `[os.neu] >` (**S9 FAIL** — we tell you on purpose). **Official path:** **Boot kit** + `make-usb`. New ISO release aims to fix ISO-only S9 too.

You will: turn on Linux → open welcome → download ISO or **Boot kit** → burn → restart → pick USB.

Your Linux system disk (`/`) is **not** wiped — never burn that disk. Only burn the USB stick.

Full manual: [manual.en.md](./manual.en.md) · Console detail: [usb-console-guide.md](./usb-console-guide.md)

---

## Remember this one rule

| For USB boot on Linux | Not USB boot |
|-----------------------|--------------|
| **USB image ISO (Linux JeOS)** or **Boot kit** | **Linux screen pack** (= plant on this PC) |
| Burn with Etcher / `make-usb` | Plant puts os.neu in Applications — different door |

**Best path for `[os.neu] >`:** Boot kit + `make-usb.sh` (see console guide).  
If you see BusyBox: power off, unplug USB, use Boot kit / re-download ISO.

---

## Step 1 — Start on Linux

![Linux lock screen](/manual/img/90-usb-s1-linux.webp)

*Unlock the PC so you can open a browser.*

---

## Step 2 — Open welcome

Go to: **https://os.neuavenue.com/welcome/**

![Welcome page](/manual/img/92-usb-s2-welcome.webp)

*Press **USB image ISO (Linux JeOS)** or **Download boot kit**. Do not mix with “Linux screen pack” if you want USB boot.*

---

## Step 3 — Get the files

- ISO: https://os.neuavenue.com/downloads/neuos-live.iso (~360 MB)  
- Boot kit (recommended): https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz  
- Easy burner: https://etcher.balena.io/  
- Empty USB stick. Never choose the disk that holds `/`.

---

## Step 4 — Plug in the stick

![USB plugged on Ubuntu](/manual/img/93-usb-s5-stick.webp)

*Stick connected. Desktop can stay open while you burn.*

---

## Step 5 — Burn (pick one)

**Easy:** balenaEtcher → ISO → **only** the USB → Flash.

**Full console (recommended):**

```bash
# after unpacking the boot kit — replace /dev/sdX with YOUR stick from the list
bash scripts/make-usb.sh --list
sudo bash scripts/make-usb.sh /dev/sdX --yes   # empty stick only, after --plan
# or refresh an os.neu stick without wipe:
sudo bash scripts/make-usb.sh /dev/sdX --update
```

Details: [usb-console-guide.md](./usb-console-guide.md)

---

## Step 6 — Restart and pick USB

1. Leave the stick plugged in. Save work.  
2. Restart. At the logo press **F8 / F12 / Esc**.  
3. Choose **UEFI: … USB …**. Do not pick the internal Ubuntu disk.

![Boot menu phase](/manual/img/94-usb-s8-menu.webp)

*neuOS menu countdown is normal.*

---

## Step 7 — Success or BusyBox

**Success:**

```text
[os.neu] >
```

Then you can type `help`, `install os.neu`, or `open os.neu`.

**If you see BusyBox / “payload not found”:**

![payload not found](/manual/img/95-usb-s9-busybox.webp)

1. Hold power off.  
2. Unplug USB → boot Ubuntu again.  
3. Prefer Boot kit + `make-usb.sh --update`.  
4. Do **not** type `exit` on BusyBox.

---

## Done

- Linux plant (Applications) ≠ USB boot. Two doors.  
- Windows users should use the Windows guide — not this page.

**Filed · Linux USB boot · docs.neuavenue.com · 2026-11-25**
