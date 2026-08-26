# OS.neu 사용 설명서

켜면 폴더와 시작 메뉴가 없습니다. 이미 있는 PC 위에서 말로 쓰는 얼굴입니다. 디스크를 지우지 않습니다.

**지금 받은 파일로 심기·USB 굽기는 Linux에서만 됩니다.** Windows·macOS 설치 파일은 아직 없습니다. 이 페이지와 랜딩은 어떤 브라우저에서도 열 수 있습니다. 이 PC에 남기려면 Linux가 필요합니다.

공개 홈: [https://os.neuavenue.com](https://os.neuavenue.com)  
문서 홈: [https://docs.neuavenue.com](https://docs.neuavenue.com)  
USB 복구 HTML: [https://os.neuavenue.com/tutorial](https://os.neuavenue.com/tutorial)  
키트: [https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz)

## 1. 받기

1. 브라우저에서 **os.neuavenue.com** 을 엽니다.
2. 이 화면(전원 → 로고 → 설치)이 랜딩입니다. 로컬 연습은 `http://127.0.0.1:5173/` 과 같습니다.
3. USB가 필요하면 **Linux PC**에서 설치 화면의 **운영체제가 없는 USB** 를 고르거나, **Download boot kit** 으로 `neuos-boot-kit.tar.gz` 를 받습니다. 굽는 명령(`make-usb.sh`)은 Linux입니다.
4. 숙제·사진이 있는 메모리는 쓰지 않습니다.

## 2. 설치 — 세 길

세 길은 같은 화면으로 모입니다. 위쪽 아이콘으로 언제든 다시 고를 수 있습니다.

- **이미 OS가 있는 PC** — **Linux**에서 다음 로그인에 OS.neu 화면. 하드디스크를 포맷하지 않습니다. 진행이 100%가 될 때까지 기다립니다.
- **운영체제가 없는 USB** — **Linux**에서 아래 **USB 콘솔** 절. 성공 화면은 `[os.neu] >` 입니다.
- **설치 없이 체험** — 게스트. 브라우저는 어디서나 이 세션만 봅니다. 다음 로그인에 자동으로 남기려면 Linux가 필요합니다.

## 3. USB 콘솔 — 디스크 고르기

USB 첫 화면은 폴더도, `5173` 그래픽도 아닙니다. 어두운 글자 콘솔입니다. **스틱을 굽는 작업은 Linux에서만** 합니다.

스틱을 **메인보드 뒤 USB**에 꽂은 뒤 목록을 봅니다.

```
cd ~/neuOS
npm run usb:list
```

목록은 이렇게 읽습니다. 글자(`sda` / `sdb` / `sdd`)는 PC마다 다릅니다. **`/` 가 붙은 디스크는 절대 굽지 않습니다.**

- `sda` — 큰 HDD. 데이터. 후보 아님.
- `sdb` — `sdb2` 에 `/` 가 있으면 **이 Ubuntu**. 후보 아님.
- `sdc` — 수 테라 데이터 디스크. 후보 아님.
- `sdd` — `RM=1` (이동식) 이고 USB candidates 에 나오면 **스틱**. 여기만 다룹니다.

한 예입니다.

```
sdb    /dev/sdb    238.5G     / 가 여기
sdd    /dev/sdd    117.2G     USB candidates
├─sdd1  511M   NEUOS-ESP
└─sdd2  15.5G  NEUOS-ROOT
```

`NEUOS-ESP` / `NEUOS-ROOT` 가 보이면 **이미 구운 스틱**입니다. `--yes` 로 지우지 않습니다.

## 4. USB에 올리기 (지우지 않기)

이미 구운 스틱은 페이로드만 갱신합니다. 성공 메시지는 이렇습니다.

```
sudo bash scripts/make-usb.sh /dev/sdd --update
plan: update initrd on /dev/sdd (no wipe)
staged .../dist/neuos-usb
updated initrd and payload on /dev/sdd (no partition wipe).
```

`/dev/sdd` 는 위 목록에서 확인한 USB입니다. 다른 PC에서는 `usb:list` 의 후보 경로로 바꿉니다.

빈 스틱을 **통째로** 쓸 때만 계획을 본 뒤 `--yes` 입니다. `--yes` 는 그 장치를 지웁니다.

```
bash scripts/make-usb.sh --plan /dev/sdX
sudo bash scripts/make-usb.sh /dev/sdX --yes
```

키트만 다시 만들 때:

```
npm run pack:kit
```

## 5. USB로 이 PC 켜기 (ASUS)

1. 스틱을 꽂은 채 작업을 저장합니다.
2. 재시작. ASUS 로고에서 **F8** 을 여러 번 (안 되면 Esc, 그다음 F12).
3. **UEFI: … USB …** 를 고릅니다. 안의 Ubuntu SSD는 고르지 않습니다.
4. 성공은 폴더가 아니라 어두운 글자입니다.

```
[os.neu] >
```

부팅 메뉴가 없으면 **Del**(데스크탑) 또는 **F2**(노트북) → Boot Override → USB. Boot Option #1 을 USB로 고정하지 않습니다. BIOS 플래시는 하지 않습니다.

Ubuntu가 그대로 켜지면 USB를 고르지 않은 것입니다. 전원 길게 → 뒤 포트에 다시 꽂고 F8.

## 6. 콘솔에서 할 일

- `hardware` — CPU
- `memory` — RAM
- `network` — 네트워크
- `install firefox` — 설치 **명령만** 보여 줌. 몰래 설치하지 않음
- `install os.neu` — 설치 패널 또는 글자 마법사. 하드 포맷 없음
- 영어 한 줄 — 코치 답 (열쇠가 있을 때)
- `exit` — 루프 종료

안의 Ubuntu로 돌아가려면 전원 끄고 **USB를 뽑은 뒤** 켭니다. `--update` 는 하드를 지우지 않습니다.

그래픽 말하기 화면이 필요하면 USB를 뽑고 Ubuntu로 켠 뒤 `npm run boot:install` → 다음 그래픽 로그인입니다.

## 7. 다른 화면이 나오면

- **Ubuntu / Windows 그대로** — F8에서 USB를 다시 고름
- **`grub>`** — os.neu가 아직 아닙니다. 한 줄씩: `search --label NEUOS-ROOT --set=root` 다음 `configfile /boot/grub/grub.cfg`
- **BusyBox `#` / payload not found** — 전원 끄고 Ubuntu로 켠 뒤 `--update` 를 다시
- **그래픽 `5173` 화면** — USB 첫 화면이 아닙니다. 콘솔이 맞습니다

`grub>` 에서도 안 되면:

```
search --label NEUOS-ROOT --set=root
linux /boot/vmlinuz root=LABEL=NEUOS-ROOT rw
initrd /boot/initrd.img
boot
```

포기: 전원 길게 → USB 뽑기 → 켜기. 안의 디스크는 지우지 않습니다.

## 8. 켜 둔 뒤 (그래픽)

1. 하드웨어 점검(POST)이 쉬운 말로 나옵니다. 영문 덤프가 아닙니다.
2. **말하기** 또는 **콘솔**을 고릅니다.
3. 마이크를 누르고 말하고 다시 누르거나, 한 줄을 적고 스피커로 보냅니다.
4. 예: `재생에너지 보고서를 찾아 요약해 슬라이드에 넣어 줘`
5. 인터넷은 주소창으로 실사이트를 엽니다. 문서·시트·슬라이드는 화면 안 타일입니다.

## 9. 매뉴얼 다시 보기

화면 **위쪽 Manual** 아이콘 → **os.neu manual**. 맨 아래 **docs.neuavenue.com** 이 이 문서 카드입니다. 카드의 × 는 매뉴얼로, 매뉴얼의 × 는 닫기입니다.

회사 열쇠를 이미지에 심지 않습니다. 공개 AI는 이 PC에서 받을 수 있습니다. 확인 없는 삭제·설치는 하지 않습니다.

## 10. 나가기

오른쪽 위 × 는 전체 화면을 줄이거나 이전 화면입니다. Exit는 건강 점검 뒤 JeOS 또는 말하기입니다. 윈도우 바탕화면이 바로 보이지 않는 것이 정상입니다.
