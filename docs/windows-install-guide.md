# Windows — install os.neu v1.0

This is the **Windows** chapter of the os.neu manual. Linux USB and Linux plant are in the [os.neu manual](https://docs.neuavenue.com/manual.en.md).

**Customer path:** `os.neu-Setup.exe` (no Node). That is the same **os.neu v1.0** screen as a Linux plant (app.neu · Docs · Sheets · Slides).

Get files: [os.neuavenue.com/welcome](https://os.neuavenue.com/welcome)  
Docs home: [docs.neuavenue.com](https://docs.neuavenue.com)

## Before you start

- Windows 11 **x64** (not ARM)
- About 400 MB free disk
- The installer is **unsigned**. SmartScreen: **More info → Run anyway**

## 1. Download Setup

https://os.neuavenue.com/downloads/os.neu-Setup.exe

## 2. Install

Double-click `os.neu-Setup.exe`. Next through the dialog. Default location is per-user (`%LOCALAPPDATA%\Programs\os.neu`). Desktop + Start Menu shortcuts named **os.neu**.

That is not WSL2, not the Linux tar, and not USB/JeOS.

## 3. Open the screen

Start Menu **os.neu**, or the Desktop icon.

## 4. Success

- Top chrome **os.neu v1.0**
- Left **app.neu** · Docs / Sheets / Slides
- Google sign-in works without editing a `.env`
- If you only see “Trusted Seat / Layers 01–10”, you opened Seat Face `os.neu.exe`. Use Setup.exe instead.

Ask AI needs **your** OpenAI key in **Connect AI**, or a local model on this PC. Google login is not an OpenAI key. There is no shared NeuAvenue key.

## Other files (not the customer path)

| File | Result |
|------|--------|
| `os.neu-Setup.exe` | **v1.0 screen** (this page) |
| `neuos-windows.zip` + `install-windows.ps1` | Developer source pack (needs Node 20) |
| `os.neu-win-0.1.0-x64.zip` → `os.neu.exe` | Seat Face (layers 01–10) |
| USB ISO / boot kit | Linux JeOS. Not a Windows Start Menu plant |

Developer source pack (Node 20 + npm):

https://os.neuavenue.com/downloads/neuos-windows.zip

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
cd D:\neuos-windows-src\os.neu-windows
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```
