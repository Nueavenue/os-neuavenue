# Windows — plant os.neu

This is the **Windows** chapter of the os.neu manual. Linux USB and Linux plant are in the [os.neu manual](https://docs.neuavenue.com/manual.en.md).

To see the **same screen as a Linux plant** (app.neu · Docs · Sheets · Slides), install the **source pack**. Do not use `os.neu.exe` for that screen.

The welcome chip **Download os.neu on Windows** (`os.neu.exe`) is **Seat Face** (layers 01–10). That is not the Linux plant screen.

Get files: [os.neuavenue.com/welcome](https://os.neuavenue.com/welcome)  
Docs home: [docs.neuavenue.com](https://docs.neuavenue.com)

## Before you start

- Windows 11 **x64** (not ARM)
- [Node.js 20 LTS](https://nodejs.org) and npm
- About 3 GB free disk
- Nothing else using ports `4178` or `5173`

In PowerShell:

```powershell
node -v
npm -v
```

## 1. Get the source pack

This file. It is not the exe zip.

https://os.neuavenue.com/downloads/neuos-windows.zip

In Explorer choose **Extract All**. You should see `os.neu-windows\install-windows.ps1` and `os.neu-windows\os.neu\electron\main.cjs`.

## 2. Plant

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

## 3. Open the screen

**Do not click `os.neu.exe`.**

Start Menu **os.neu**, or:

```powershell
& "$env:USERPROFILE\os.neu\scripts\open-neuos.cmd"
```

Vite (`5173`) and the bridge (`4178`) start first. The first run can take 1–2 minutes.

If SmartScreen blocks: **More info → Run anyway**.

## 4. Success

- Top chrome **os.neu v1.0**
- Left **app.neu** · Docs / Sheets / Slides
- If you only see “Trusted Seat / Layers 01–10”, you opened the exe. Go back to step 3.

## Other files (not this screen)

| File | Result |
|------|--------|
| `neuos-windows.zip` + `install-windows.ps1` | Same screen as a Linux plant (**this page**) |
| `os.neu-win-0.1.0-x64.zip` → `os.neu.exe` | Seat Face |
| USB ISO / boot kit | Linux JeOS. Not a Windows Start Menu plant |

Remove (does not wipe the disk):

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1 -Uninstall
```
