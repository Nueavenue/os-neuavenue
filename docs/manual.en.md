# OS.neu manual

Power-on is not folders or a Start menu. It is a talk face on the PC you already have. The disk is not wiped.

**With the files we ship now, planting and USB burn work on Linux only.** There is no Windows or macOS installer yet. This page and the landing still open in any browser. To keep os.neu on this PC you need Linux.

Public home: [https://os.neuavenue.com](https://os.neuavenue.com)  
Docs home: [https://docs.neuavenue.com](https://docs.neuavenue.com)  
USB recovery: [https://os.neuavenue.com/tutorial](https://os.neuavenue.com/tutorial)  
Kit: [https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz)

## 1. Get it

1. Open **os.neuavenue.com** in a browser.
2. This screen (logo → install) is the landing. Local practice is the same app at `http://127.0.0.1:5173/`.
3. For USB, on a **Linux PC** pick **USB without an OS** or **Download boot kit** for `neuos-boot-kit.tar.gz`. The burn command (`make-usb.sh`) is Linux.
4. Do not use a stick that holds homework or photos.

## 2. Install — three paths

The three paths meet on the same screen. Use the top icons to switch at any time.

- **PC that already has an OS** — on **Linux**, next login shows OS.neu. No format. Wait until progress is 100%.
- **USB without an OS** — on **Linux**, see **USB console** below. Success is `[os.neu] >`.
- **Try without installing** — guest. Any browser can open this session. To keep it after login you need Linux.

## 3. USB console — pick the disk

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

## 4. Put os.neu on the stick (no wipe)

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

## 5. Boot this PC from USB (ASUS)

1. Leave the stick plugged in. Save work.
2. Reboot. At the ASUS logo press **F8** several times (then Esc, then F12).
3. Choose **UEFI: … USB …**. Do not choose the internal Ubuntu SSD.
4. Success is dark text, not a folder window.

```
[os.neu] >
```

If the Boot Menu is missing: **Del** (desktop) or **F2** (laptop) → Boot Override → USB. Do not set Boot Option #1 to USB forever. Do not flash BIOS.

If Ubuntu opens as usual, USB was not selected. Hold power, reseat the rear port, F8 again.

## 6. What to type

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

## 7. If you see something else

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

## 8. After power-on (graphic)

1. Hardware POST is plain language, not a BIOS dump.
2. Choose **talk** or **console**.
3. Tap the mic, speak, tap again — or type one line and send with the speaker.
4. Example: `Find a renewable-energy report, summarize it, put it on slides`
5. The address bar opens real sites. Doc / Sheet / Slides stay inside the screen.
6. After `install os.neu` or the top **Download**, Linux gets an **os.neu** icon in Applications and on the Desktop. You do not `cd` into a folder. Drag the window edges, or use the window-size icon.

## 9. Open this manual again

Top **Manual** icon → **os.neu manual**. Bottom **docs.neuavenue.com** opens this card. × on the card goes back; × on the manual closes. The **Download** icon is the Linux screen pack (`neuos-linux.tar.gz`).

Company keys are not baked into the image. You can take a public AI on this PC. Nothing is deleted or installed without confirm.

## 10. Leave

On the landing, install cards, and talk home, top-right **× quits** to the Ubuntu desktop. On inner screens, × goes back.
