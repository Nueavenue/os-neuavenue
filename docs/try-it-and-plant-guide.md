# Try it vs plant — install & use (safe tutorial)

Easy checklist from the security review of **Plant on this device** on the public website.  
Audience: Ubuntu or Windows user opening [os.neuavenue.com](https://os.neuavenue.com) in a browser.

In-app Manual pages: **Try it in the browser (no disk plant)** · **Plant for real (no disk wipe)** · **Tour of the home screen**

---

## A. Try it in the browser (no disk plant)

### Step 1 — Open the public seat

1. Open Chrome or Edge.
2. Go to `https://os.neuavenue.com`.
3. You see the same home face as a planted seat (prompt, Docs / Sheets / Slides, icon row).
4. If the **address bar still shows the website**, you are in **Try it**.

### Step 2 — What you can do in Try it

1. Type or speak a prompt.
2. Open Docs / Sheets / Slides as a trial.
3. Open daf.neu for web pages.
4. Use Download or Manual.
5. Trial limits stay as designed (no full local device bridge).

Top icons work for the trial. They do **not** format the disk.

### Step 3 — If you press Plant on this device

1. You may see a short “Planting…” progress screen.
2. Then: **Could not read the profile. Continuing to the body check.**
3. Meaning: the cloud preview has **no device bridge** on your PC — **not** that files were copied.

Checked on the live site:

- `/api/health` → ok, but `driver: dry-run` (“device bridge is not on this host”)
- `/api/install/*` → **404** (no plant API)

### Step 4 — Press Next safely

1. Next only continues to the **body check** (what the browser can see).
2. It does **not** wipe disks.
3. It does **not** write `~/os.neu` or autostart.
4. It does **not** burn USB.

**Verdict:** Next on that screen = safe. No silent plant.

### Step 5 — When you want it on the PC for real

1. Use **Download** (or the welcome page).
2. Linux → `neuos-linux.tar.gz`
3. Windows → `os.neu-Setup.exe`
4. Continue with section B below.

---

## B. Plant for real (no disk wipe)

### Step 1 — Choose the pack

| Your PC | Download |
|---------|----------|
| Ubuntu / Linux | [neuos-linux.tar.gz](https://os.neuavenue.com/downloads/neuos-linux.tar.gz) |
| Windows 11 x64 | [os.neu-Setup.exe](https://os.neuavenue.com/downloads/os.neu-Setup.exe) |

Do **not** use the Linux USB ISO if you only want Applications / Start Menu plant.

### Step 2 — Linux

```bash
tar -xzf neuos-linux.tar.gz
bash os.neu-linux/install.sh
```

- Copies into `~/os.neu` and writes a launcher.
- Script policy: **does not wipe disks**.
- Answer `n` to optional GDM/cage questions unless you want those.
- Open **os.neu** from Applications or Desktop.

More detail: Manual → **Plant on Linux**.

### Step 3 — Windows

1. Run `os.neu-Setup.exe`.
2. If SmartScreen: **More info → Run anyway**.
3. Install under your user folder → Finish with **Run os.neu** checked.
4. Windows stays; no required os.neu boot entry for this path.

More detail: Manual → **Windows 11 download and install**.

### Step 4 — Confirm planted

1. Open the **local** os.neu app (not only the website tab).
2. Title shows OS.neu + version.
3. On Windows Setup you may see `win32 live`.
4. Plant on this device is then unnecessary (disabled on Windows Setup).

---

## C. One-line memory

| Action | Result |
|--------|--------|
| Browser **Next** after Plant on the website | Try it / body check only — **no disk copy** |
| Download + `install.sh` / Setup.exe | Real plant into home / Program Files area — **no internal disk wipe** |
| USB burn (Linux tools) | Separate path — never burn the disk that holds `/` |

---

## Related

- [Home screen guide](./home-screen-guide.md)
- [os.neu manual (full)](./manual.en.md)
- [Windows install guide](./windows-install-guide.md)
- Security note (Control): `docs/handoff/control-tower/SECURITY-DIAGNOSIS-WEB-PLANT-ON-DEVICE-UBUNTU-HOST-2026-11-25.md`
