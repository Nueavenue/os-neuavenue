# os.neu manual

Power-on is not folders or a Start menu. It is a talk face on the PC you already have. The disk is not wiped.

This manual is **English**. Use **Linux** or **Windows** below. The Back button is **Back**.

Public home: [https://os.neuavenue.com](https://os.neuavenue.com)  
Docs home: [https://docs.neuavenue.com](https://docs.neuavenue.com)  
USB recovery: [https://os.neuavenue.com/tutorial](https://os.neuavenue.com/tutorial)  
Windows (this chapter as its own page): [https://docs.neuavenue.com/windows-install-guide.md](https://docs.neuavenue.com/windows-install-guide.md)

- Linux plant pack: [neuos-linux.tar.gz](https://os.neuavenue.com/downloads/neuos-linux.tar.gz)
- Windows Setup: [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe)
- Windows source pack (developers): [neuos-windows.zip](https://os.neuavenue.com/downloads/neuos-windows.zip)
- USB kit: [neuos-boot-kit.tar.gz](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz)

There is no macOS installer yet. This page still opens in any browser.

## Linux

### 1. Get it

1. Open **os.neuavenue.com** in a browser.
2. This screen (logo → install) is the landing. Local practice is the same app at `http://127.0.0.1:5173/`.
3. For USB, on a **Linux PC** pick **USB without an OS** or **Download boot kit** for `neuos-boot-kit.tar.gz`. The burn command (`make-usb.sh`) is Linux.
4. Do not use a stick that holds homework or photos.

### 2. Plant on this Linux PC

The three paths meet on the same screen. Use the top icons to switch at any time.

- **PC that already has an OS** — on **Linux**, next login shows os.neu. No format. Wait until progress is 100%.
- **USB without an OS** — on **Linux**, see **USB console** below. Success is `[os.neu] >`.
- **Try without installing** — guest. Any browser can open this session. To keep it after login, plant Linux or Windows.

### 3. USB console — pick the disk

The USB first screen is not folders and not the `:5173` graphic. It is a dark text console. **Burning the stick is Linux only.**

Plug the stick into a **rear motherboard USB** port, then list disks.

```
cd ~/neuOS
npm run usb:list
```

Letters (`sda` / `sdb` / `sdd`) change per PC. **Never burn the disk that holds `/`.**

- `sda` — large HDD. Data. Not a candidate.
- `sdb` — if `sdb2` is `/`, that is **this Ubuntu**. Not a candidate.
- `sdc` — multi-terabyte data disk. Not a candidate.
- `sdd` — `RM=1` and listed under USB candidates is **the stick**. Only that.

Example:

```
sdb    /dev/sdb    238.5G     / lives here
sdd    /dev/sdd    117.2G     USB candidate
├─sdd1  511M   NEUOS-ESP
└─sdd2  15.5G  NEUOS-ROOT
```

If you see `NEUOS-ESP` / `NEUOS-ROOT`, the stick is **already burned**. Do not `--yes` wipe it.

### 4. Put os.neu on the stick (no wipe)

Refresh payload only. Success looks like this:

```
sudo bash scripts/make-usb.sh /dev/sdd --update
plan: update initrd on /dev/sdd (no wipe)
staged .../dist/neuos-usb
updated initrd and payload on /dev/sdd (no partition wipe).
```

Replace `/dev/sdd` with the USB path from `usb:list` on that PC.

Full wipe only for an empty stick, after `--plan`. `--yes` erases that device.

```
bash scripts/make-usb.sh --plan /dev/sdX
sudo bash scripts/make-usb.sh /dev/sdX --yes
```

Rebuild the downloadable kit:

```
npm run pack:kit
```

### 5. Boot this PC from USB (ASUS)

1. Leave the stick plugged in. Save work.
2. Reboot. At the ASUS logo press **F8** several times (then Esc, then F12).
3. Choose **UEFI: … USB …**. Do not choose the internal Ubuntu SSD.
4. Success is dark text, not a folder window.

```
[os.neu] >
```

If the Boot Menu is missing: **Del** (desktop) or **F2** (laptop) → Boot Override → USB. Do not set Boot Option #1 to USB forever. Do not flash BIOS.

If Ubuntu opens as usual, USB was not selected. Hold power, reseat the rear port, F8 again.

### 6. What to type

- `hardware` — CPU
- `memory` — RAM
- `network` — network
- `install firefox` — shows the command only. Does not install in secret
- `install os.neu` — installs onto this PC’s `~/os.neu`, not the USB (`/os.neu`). Then opens the os.neu screen (in-app browser) in **the same USB session**. It does not ask `folder >`. If no window appears, the console prints `open os.neu` and `bash ~/os.neu/scripts/open-neuos.sh`. Type `help` to see that guide again.
- `open os.neu` — opens the planted screen again. Does not copy files.
- `help` — prints the one-line launch command
- An English line — coach reply when a key exists
- `exit` — leave the loop

To return to Ubuntu: power off, **unplug USB**, power on. `--update` does not wipe the internal disk.

The graphical talk screen opens from USB after `install os.neu` in that same session. If no window appears, type `open os.neu` on this console, or after Ubuntu login run `bash ~/os.neu/scripts/open-neuos.sh`. You do not `cd` into a folder.

### 7. If you see something else

- **Usual Ubuntu / Windows** — pick USB in F8 again
- **`grub>`** — not os.neu yet. Type `search --label NEUOS-ROOT --set=root` then `configfile /boot/grub/grub.cfg`
- **BusyBox `#` / payload not found** — power off, boot Ubuntu, run `--update` again
- **Graphic `:5173` screen** — not the USB first screen. The console is correct

If `grub>` still fails:

```
search --label NEUOS-ROOT --set=root
linux /boot/vmlinuz root=LABEL=NEUOS-ROOT rw
initrd /boot/initrd.img
boot
```

Give up: hold power, unplug USB, power on. The internal disk is not wiped.

## Windows

Customer path: [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe) — **os.neu v1.0**, no Node. SmartScreen: More info → Run anyway.

Seat Face `os.neu.exe` (layers 01–10) is a different product. The source pack below is for developers (Node 20).

### 1. Before you start

- Windows 11 **x64** (not ARM)
- [Node.js 20 LTS](https://nodejs.org) and npm
- About 3 GB free disk
- Nothing else using ports `4178` or `5173`

In PowerShell:

```powershell
node -v
npm -v
```

### 2. Get the source pack

This file. It is not the exe zip.

https://os.neuavenue.com/downloads/neuos-windows.zip

In Explorer choose **Extract All**. You should see `os.neu-windows\install-windows.ps1` and `os.neu-windows\os.neu\electron\main.cjs`.

### 3. Plant

PowerShell (not as Administrator):

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
cd D:\neuos-windows-src\os.neu-windows
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

Replace `D:\neuos-windows-src` with the folder you extracted.

The script copies into `%USERPROFILE%\os.neu` and runs `npm install` **on this Windows PC**. It adds an **os.neu** shortcut on the Desktop and in the Start Menu. Auto-start at logon is off by default.

Check:

```powershell
Test-Path "$env:USERPROFILE\os.neu\electron\main.cjs"
```

That must be `True`. `False` means you took the exe zip, not the source pack.

### 4. Open the screen

**Do not click `os.neu.exe`.**

Start Menu **os.neu**, or:

```powershell
& "$env:USERPROFILE\os.neu\scripts\open-neuos.cmd"
```

Vite (`5173`) and the bridge (`4178`) start first. The first run can take 1–2 minutes.

If SmartScreen blocks: **More info → Run anyway**.

### 5. Success

- Top chrome **os.neu v1.0**
- Left **app.neu** · Docs / Sheets / Slides
- If you only see “Trusted Seat / Layers 01–10”, you opened the exe. Go back to step 4.

### Other files (not this screen)

| File | Result |
|------|--------|
| `neuos-windows.zip` + `install-windows.ps1` | Same screen as a Linux plant (**this chapter**) |
| `os.neu-win-0.1.0-x64.zip` → `os.neu.exe` | Seat Face |
| USB ISO / boot kit | Linux JeOS. Not a Windows Start Menu plant |

Remove (does not wipe the disk):

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1 -Uninstall
```

## After the screen opens

1. Hardware POST is plain language, not a BIOS dump.
2. Choose **talk** or **console**.
3. Tap the mic, speak, tap again — or type one line and send with the speaker.
4. Example: `Find a renewable-energy report, summarize it, put it on slides`
5. The address bar opens real sites. Doc / Sheet / Slides stay inside the screen.
6. After a Linux plant or the top **Download**, Linux gets an **os.neu** icon in Applications and on the Desktop. After a Windows plant, use Start Menu **os.neu** (not `os.neu.exe`). You do not `cd` into a folder. Drag the window edges, or use the window-size icon.

## Open this manual again

Top **Manual** icon → **os.neu manual**. Bottom **docs.neuavenue.com** opens this card. **Back** on the card goes back; × on the intro closes. The **Download** icon is the Linux screen pack (`neuos-linux.tar.gz`). Windows uses the source pack above.

Company keys are not baked into the image. You can take a public AI on this PC. Nothing is deleted or installed without confirm.

## Browser pop-ups — Default / Allow / Block

- On **Default**, os.neu already opens identity/sign-up pop-ups (e.g. registration) without you touching Allow first.
- Click the address bar to open a panel for the site you're on: **Default / Allow this site / Block this site**. There is no global "allow all pop-ups" switch.
- Google, Microsoft, Apple, and GitHub logins always open outside this screen, in the system browser.
- **Blocking** a site shows os.neu's own panel instead of that site's "pop-up blocked" message. Switch back to **Default** from the same panel.

## Leave

On the landing, install cards, and talk home, top-right **×** quits to the host desktop. On inner screens, **Back** goes back.
