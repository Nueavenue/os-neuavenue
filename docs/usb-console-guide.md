# os.neu USB 콘솔 튜토리얼

USB로 켜면 **먼저** 어두운 글자 화면이 나옵니다.  
성공하면 이렇게 보입니다: `[os.neu] >`

사진으로 처음부터 따라가기: [usb-first-customer-guide.md](./usb-first-customer-guide.md)

**지금 받은 파일로 스틱을 굽는 일은 Linux에서만 됩니다.**  
Windows·macOS에서는 `make-usb.sh` 를 실행하지 않습니다.

공개 키트: [neuos-boot-kit.tar.gz](https://os.neuavenue.com/downloads/neuos-boot-kit.tar.gz)  
부팅 복구 HTML: [https://os.neuavenue.com/tutorial](https://os.neuavenue.com/tutorial)  
화면 안 매뉴얼: 상단 **Manual** → `docs.neuavenue.com`

디스크 이름은 PC마다 다릅니다 (`sda` / `sdb` / `sdd`).  
**`/` 가 붙은 디스크는 절대 굽지 마세요.** (학교 PC·숙제가 들어 있는 디스크)

```
sda    /dev/sda    931.5G     데이터 HDD. 후보 아님
sdb    /dev/sdb    238.5G     sdb2 가 /  → 이 Ubuntu. 후보 아님
sdc    /dev/sdc      7.3T     데이터. 후보 아님
sdd    /dev/sdd    117.2G     USB 후보
├─sdd1     511M NEUOS-ESP
└─sdd2    15.5G NEUOS-ROOT
```

`NEUOS-ESP` / `NEUOS-ROOT` 가 보이면 **이미 잘 구운 스틱**입니다.  
`--yes` 로 지우지 마세요. 내용만 새로 올릴 때는 `--update` 를 씁니다.

## 0. 무엇이 나오나

| 화면 | 의미 |
| --- | --- |
| `[os.neu] >` | 성공. `hardware` 또는 `install os.neu` |
| `grub>` | 부트로더만 켜짐. 아래 복구 4 |
| BusyBox `#` / `payload not found` | 시작은 됐지만 본문이 없음. `--update` 또는 Boot kit |
| Ubuntu / Windows 그대로 | F8에서 USB를 고르지 않음 |

그래픽 말하기 화면은 USB에서 `install os.neu` 를 치면  
이 PC의 `~/os.neu` 에 심은 뒤, **같은 USB 세션**에서 os.neu 창을 엽니다.

## 1. 키트 다시 만들기 (이 저장소)

숙제·사진이 있는 메모리는 빼 두세요.  
키트는 **굽는 스크립트 묶음**이지, 이미 완성된 디스크 이미지가 아닙니다.

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

**이미 OS.neu가 구워진 스틱**이면 파티션을 지우지 않습니다.

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

부팅 메뉴가 없으면 **Del**(데스크탑) 또는 **F2**(노트북) → Boot Override → USB.  
Boot Option #1 을 USB로 고정하지 마세요. BIOS 플래시는 하지 마세요.

Ubuntu가 그대로 켜지면 USB를 고르지 않은 것입니다.  
전원 길게 → 뒤 포트에 다시 꽂고 F8.

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
`exit` 는 치지 마세요 (커널이 놀랄 수 있습니다).

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

창이 안 뜨면 콘솔이 안내를 찍습니다. **폴더로 들어가서 찾을 필요 없습니다.**

이 USB 콘솔(`[os.neu] >`)에서:

```
open os.neu
```

Ubuntu로 켠 뒤 터미널을 열고:

```bash
bash ~/os.neu/scripts/open-neuos.sh
```

같은 화면을 여는 스크립트입니다. `cd ~/os.neu` 는 필요 없습니다.  
아이콘 **os.neu** 를 눌러도 됩니다. 오른쪽 위 × 는 종료입니다.
