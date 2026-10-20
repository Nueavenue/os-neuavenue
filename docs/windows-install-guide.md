# Windows에 os.neu 설치하기

Linux PC에 심긴 os.neu(app.neu · 문서 · 시트 · PPT)와 **같은 화면**을 보려면 아래 **소스 팩**을 받습니다.

welcome 히어로의 **Download os.neu on Windows** (`os.neu.exe`)는 **Seat Face**입니다. 레이어 01–10 화면이며, Linux 심기 화면과 같지 않습니다.

받기: [os.neuavenue.com/welcome](https://os.neuavenue.com/welcome)  
문서 홈: [docs.neuavenue.com](https://docs.neuavenue.com)

## 준비

- Windows 11 **x64** (ARM 아님)
- [Node.js 20 LTS](https://nodejs.org) 와 npm
- 디스크 여유 약 3 GB
- 포트 `4178` · `5173` 을 쓰는 다른 앱 없음

PowerShell에서:

```powershell
node -v
npm -v
```

## 1. 소스 팩 받기

이 파일입니다. exe zip이 아닙니다.

https://os.neuavenue.com/downloads/neuos-windows.zip

Explorer에서 **압축 풀기**. 안에 `os.neu-windows\install-windows.ps1` 과 `os.neu-windows\os.neu\electron\main.cjs` 가 있어야 합니다.

## 2. 심기

PowerShell (관리자 아님):

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
cd D:\neuos-windows-src\os.neu-windows
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

`D:\neuos-windows-src` 는 푼 폴더로 바꿉니다.

스크립트가 `%USERPROFILE%\os.neu` 에 복사하고 **이 Windows에서** `npm install` 을 합니다. Desktop · 시작 메뉴에 **os.neu** 바로가기가 생깁니다. 로그온 자동 실행은 기본 꺼짐입니다.

확인:

```powershell
Test-Path "$env:USERPROFILE\os.neu\electron\main.cjs"
```

`True` 여야 합니다. `False` 이면 소스 팩이 아니라 exe zip을 받은 것입니다.

## 3. 화면 열기

**`os.neu.exe` 를 누르지 않습니다.**

시작 메뉴 **os.neu**, 또는:

```powershell
& "$env:USERPROFILE\os.neu\scripts\open-neuos.cmd"
```

창이 뜨기까지 Vite(`5173`)와 브리지(`4178`)가 올라갑니다. 첫 실행은 1–2분이 걸릴 수 있습니다.

SmartScreen이 막으면 **추가 정보 → 실행**.

## 4. 성공

- 상단 **os.neu v1.0** 크롬
- 왼쪽 **app.neu** · Docs / Sheets / Slides
- “Trusted Seat / Layers 01–10” 만 보이면 exe를 연 것입니다. 3절로 다시

## 다른 파일 (같은 화면 아님)

| 파일 | 결과 |
|------|------|
| `neuos-windows.zip` + `install-windows.ps1` | Linux 심기와 같은 화면 (**이 문서**) |
| `os.neu-win-0.1.0-x64.zip` → `os.neu.exe` | Seat Face |
| USB ISO / boot kit | Linux JeOS. Windows 시작 메뉴가 아님 |

제거 (디스크를 지우지 않음):

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1 -Uninstall
```
