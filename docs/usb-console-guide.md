# os.neu USB 콘솔 튜토리얼

USB로 켜면 **그래픽 랜딩(`5173`)이 아닙니다.** 어두운 글자 콘솔입니다. 성공 프롬프트는 `[os.neu] >`.

**지금 받은 파일로 스틱을 굽는 일은 Linux에서만 됩니다.** Windows·macOS에서는 `make-usb.sh` 를 실행하지 않습니다. 설치 파일도 아직 없습니다.

공개 키트: [https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz)  
부팅 복구 HTML: [https://os.neuavenue.com/tutorial](https://os.neuavenue.com/tutorial)  
화면 안 매뉴얼: 상단 **Manual** → `docs.neuavenue.com`

목록은 이렇게 읽습니다. 글자(`sda` / `sdb` / `sdd`)는 PC마다 다릅니다. **`/` 가 붙은 디스크는 절대 굽지 않습니다.**

```
sda    /dev/sda    931.5G WDC WD10EZEX     데이터 HDD. 후보 아님
sdb    /dev/sdb    238.5G TS256GSSD230S    sdb2 가 /  → 이 Ubuntu. 후보 아님
sdc    /dev/sdc      7.3T ST8000DM004      데이터. 후보 아님
sdd    /dev/sdd    117.2G ProductCode RM=1 USB 후보
├─sdd1     511M NEUOS-ESP
└─sdd2    15.5G NEUOS-ROOT
```

`NEUOS-ESP` / `NEUOS-ROOT` 가 보이면 **이미 구운 스틱**입니다. `--yes` 로 지우지 않습니다. 성공 예:

```
plan: update initrd on /dev/sdd (no wipe)
updated initrd and payload on /dev/sdd (no partition wipe).
```

## 0. 무엇이 나오나

| 화면 | 의미 |
| --- | --- |
| `[os.neu] >` | USB 콘솔 성공. `hardware` 또는 `install os.neu` |
| `grub>` | 부트로더만 켜짐. 아래 복구 4 |
| BusyBox `#` / `payload not found` | 리눅스는 떴고 페이로드가 없음. `--update` |
| Ubuntu / Windows 그대로 | F8에서 USB를 고르지 않음 |

그래픽 말하기 화면은 USB에서 `install os.neu` 를 치면 이 PC의 `~/os.neu` 에 심은 뒤, **같은 USB 세션**에서 os.neu 스크린(안쪽 브라우저)을 엽니다.

## 1. 키트 다시 만들기 (이 저장소)

숙제·사진이 있는 메모리는 빼 둡니다. 키트는 **굽는 스크립트**이지, 이미 구워진 디스크 이미지가 아닙니다.

```bash
cd ~/neuOS
npm run pack:kit
ls -lh dist/neuos-boot-kit.tar.gz
```

받은 사람:

```bash
mkdir -p ~/os.neu-kit && tar -xzf neuos-boot-kit.tar.gz -C ~/os.neu-kit
cd ~/os.neu-kit
bash scripts/make-usb.sh --list
```

## 2. 이 PC에서 USB에 올리기

스틱을 **메인보드 뒤 USB**에 꽂습니다.

```bash
cd ~/neuOS
npm run usb:list
```

**이미 OS.neu가 구워진 스틱** (`NEUOS-ESP` / `NEUOS-ROOT` 가 보이면) 파티션을 지우지 않습니다.

```bash
sudo bash scripts/make-usb.sh /dev/sdd --update
```

빈 스틱이거나 통째로 다시 쓸 때만:

```bash
bash scripts/make-usb.sh --plan /dev/sdX
sudo bash scripts/make-usb.sh /dev/sdX --yes
```

`--yes` 는 그 장치를 지웁니다. `sda` / `sdb` / `sdc` 데이터 디스크는 후보가 아닙니다.

테스트만 (디스크에 안 씀):

```bash
npm run usb:test
```

## 3. USB로 이 PC 켜기 (ASUS)

1. 스틱을 꽂은 채 작업을 저장합니다.
2. 전원. ASUS 로고에서 **F8** 을 여러 번 (안 되면 Esc, F12).
3. **UEFI: … USB …** 를 고릅니다. 안의 Ubuntu SSD는 고르지 않습니다.
4. 성공: 어두운 콘솔, 안내 뒤 `[os.neu] >`.

부팅 메뉴가 없으면 **Del**(데스크탑) 또는 **F2**(노트북) → Boot Override → USB. Boot Option #1 을 USB로 고정하지 않습니다. BIOS 플래시는 하지 않습니다.

Ubuntu가 그대로 켜지면 USB를 고르지 않은 것입니다. 전원 길게 → 뒤 포트에 다시 꽂고 F8.

## 4. `grub>` 가 보이면

이건 os.neu 콘솔이 아닙니다. 한 줄씩 칩니다.

```
search --label NEUOS-ROOT --set=root
configfile /boot/grub/grub.cfg
```

메뉴가 나오면 **neuOS**. 안 되면:

```
search --label NEUOS-ROOT --set=root
linux /boot/vmlinuz root=LABEL=NEUOS-ROOT rw
initrd /boot/initrd.img
boot
```

포기: 전원 길게 → USB 뽑기 → 켜기. 안의 디스크는 지우지 않습니다.

## 5. BusyBox `#` / payload not found

키보드가 `#` 에서 안 치면 그 세션은 포기합니다. 전원 끄고 Ubuntu로 켠 뒤:

```bash
cd ~/neuOS
sudo bash scripts/make-usb.sh /dev/sdd --update
```

키가 되면 [tutorial step 5](https://os.neuavenue.com/tutorial) 대로 파티션 2를 마운트합니다.

## 6. 콘솔에서 할 일

```
[os.neu] >
```

| 입력 | 동작 |
| --- | --- |
| `hardware` | CPU |
| `memory` | RAM |
| `network` | 네트워크 |
| `install firefox` | 설치 **명령만** 보여 줌. 몰래 설치하지 않음 |
| `install os.neu` | 이 PC의 `~/os.neu` 에 복사(USB 폴더 아님). 같은 세션에서 os.neu 스크린 |
| `open os.neu` | 이미 심은 스크린을 다시 연다. 복사는 다시 하지 않음 |
| `help` | 창이 안 열렸을 때 실행할 한 줄을 보여 줌 |
| 영어 한 줄 | 코치 답 (열쇠가 있을 때) |
| `exit` | 루프 종료 |

끝나면 전원 끄고 USB를 뽑으면 안의 Ubuntu가 다시 옵니다.

## 7. 그래픽 화면이 필요할 때

콘솔에서 `install os.neu` 를 입력하고 Enter. 폴더를 묻지 않습니다.

스틱이 이 수정본이면 아래가 나와야 합니다.

```
host probe v3
block sda,sdb,...
try /dev/sdb2 ext4
```

한 줄짜리 `No Linux home. root=/dev/sda2 disks=sda,sdb skip=sda=current-root parts=... tried=` 만 보이면 **예전 스틱**입니다. Ubuntu로 돌아와 `sudo bash scripts/make-usb.sh /dev/sdd --update` 한 뒤 USB로 다시 켭니다. `tried=` 가 비어 있으면 Ubuntu 파티션을 마운트도 안 한 상태입니다.

1. 내부 디스크의 Linux `/home` 을 찾습니다. USB(`NEUOS-ROOT`, `/os.neu`)는 대상이 아닙니다.
2. `~/os.neu` 에 복사하고, 그 사용자 autostart 를 씁니다.
3. 같은 USB 세션에서 os.neu 스크린(문서·시트·슬라이드·안쪽 브라우저)을 엽니다.

창이 안 뜨면 콘솔이 아래 가이드를 그대로 찍습니다. **폴더로 들어가서 찾을 필요 없습니다.**

실패 라벨: 심기(호스트 찾기)는 **OS-NEU-IC-000** 부터. 지금 이 PC에서 스크린을 여는 서비스는 **OS-NEU-SX-000** 부터 (`docs/fail-codes.md`). cage/weston `stream fd` 는 SX-000 이지, 복사 실패가 아닙니다.

전원 켜고 Ubuntu 로그인 없이 os.neu 세션만 쓰려면 Ubuntu에서 [osneu-session.md](./osneu-session.md). USB 콘솔은 그 좌석을 아직 못 잡습니다.

심기가 끝나면 콘솔에 **os.neu interfaces** 상자가 뜹니다. 앱 아이콘·바탕화면 아이콘·USB kiosk 복사 여부. Ubuntu 로그인 후 Show Apps / Desktop 의 **os.neu** 를 누릅니다. `bash` 는 필요 없습니다.

이 USB 콘솔(`[os.neu] >`)에서:

```
open os.neu
```

Ubuntu로 켠 뒤 터미널을 열고:

```bash
bash ~/os.neu/scripts/open-neuos.sh
```

같은 화면을 여는 스크립트입니다. `cd ~/os.neu` 는 필요 없습니다. 아이콘 **os.neu** 를 눌러도 됩니다. 오른쪽 위 × 는 종료입니다.
