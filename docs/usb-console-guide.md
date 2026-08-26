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

그래픽 말하기 화면은 USB 첫 화면이 아닙니다. 콘솔에서 `install os.neu` 를 치거나, Ubuntu로 돌아와 `npm run boot:install` 한 다음 로그인입니다.

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
| `install os.neu` | 설치 패널(있으면) 또는 글자 마법사. 하드 포맷 없음 |
| 영어 한 줄 | 코치 답 (열쇠가 있을 때) |
| `exit` | 루프 종료 |

끝나면 전원 끄고 USB를 뽑으면 안의 Ubuntu가 다시 옵니다.

## 7. 그래픽 화면이 필요할 때

USB 콘솔은 첫 페이로드입니다. Electron 말하기 화면은:

1. USB를 뽑고 Ubuntu로 켠다
2. `cd ~/neuOS && npm run boot:install`
3. 다음 그래픽 로그인

또는 콘솔에서 `install os.neu` 가 데스크탑 세션을 열 수 있으면 그때 화면이 뜹니다. 없으면 “needs a desktop session” 이 정상입니다.
