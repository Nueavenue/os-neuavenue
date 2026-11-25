# STATUS — USB boot · 현 주소 (users deserve this) · 2026-11-25

> **한 줄:** 멀티부팅(GRUB)까지는 **도착함 (S8 PASS)**. Door B의 **옛 ISO(2026-08-31)** 만으로 굽으면 os.neu 화면(S9)에서 **BusyBox로 멈췄음 (S9 FAIL · 사실)**. 첫 고객 **공식 길**은 **Boot kit / `make-usb`(NEUOS-ROOT)**. ISO-only 수리는 랩에서 `[os.neu] >`까지 확인했고, **새 ISO**를 Door B에 올리는 중/올림.

## 사용자에게 알리는 현 주소

| 단계 | 의미 | 상태 (2026-11-25) |
|------|------|-------------------|
| S1–S7 | welcome · 다운로드 · 굽기 · USB 장착 · 재시작 | 안내대로 가능 |
| **S8** | UEFI → **neuOS 멀티부팅(GRUB) 메뉴** | **PASS** (Windows·Linux 동일 미디어) |
| **S9** | `[os.neu] >` / os.neu 스크린 | **옛 Door B ISO: FAIL (BusyBox)** · **공식 SoT(Boot kit/`make-usb`): 목표 경로** · **패치 ISO(랩): PASS** |

숨기지 않는 이유: **배포만 되고 어디까지 왔는지 모르는 것**보다, **여기까지 왔다는 사실**을 알 권리가 있다.

## 공식 SoT (고정)

- **Primary:** [Boot kit](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz) + Linux `make-usb` → `LABEL=NEUOS-ROOT`
- **Lock:** `docs/contracts/LOCK-USB-FIRST-CUSTOMER-SOT-BOOTKIT-MAKEUSB-2026-11-25.md`
- **ISO `dd`/Rufus:** 편의 경로. 옛 릴리스는 S8만 확실·S9 BusyBox. 새 릴리스(`neuos-live-iso-2026-11-25`)는 ISO-only도 S9 목표.

## BusyBox가 보이면

1. 전원 끄기 · USB 뽑기 · Ubuntu/Windows로 돌아가기  
2. **Boot kit**으로 다시 만들기 (`make-usb` / 안내서)  
3. 또는 welcome에서 **새 ISO**를 다시 받아 굽기  

## 증거

- 시나리오 결과: `REPORT-SCENARIO-RESULTS-USB-BOOT-FIRST-CUSTOMER-2026-11-25.md` (당시 S9 FAIL)  
- 재분석: `REPORT-REANALYSIS-VERIFY-WHY-LINUX-WINDOWS-MISS-S9-2026-11-25.md`  
- 패치 랩 serial: `evidence/USB-BOOT-SCENARIO-2026-11-25/S9-FIXED-ISO-SERIAL-2026-11-25.txt`  

**Filed:** operations · honest current address · 2026-11-25
