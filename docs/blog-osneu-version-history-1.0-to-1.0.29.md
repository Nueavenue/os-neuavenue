# os.neu 버전 업그레이드 보고서 · v1.0 → v1.0.29

> **대상:** 사용자·사내 공개 블로그 (체크용)  
> **범위:** Windows Setup / Try it(웹) / Linux plant에 보이는 **os.neu v1.0.x**  
> **오늘(작성일):** 2026-11-26 · 최신 웹(Try it) **v1.0.29**  
> **출처:** GitHub Release · `~/neuOS` 커밋 · Control-tower GRANT/REPORT · Agent 작업 기록(요약, 비밀·자격증명 제외)

---

## 이 글을 읽는 방법

1. **표의 구분** — 새 기능 / 수정 / 배포 / 문서 / 알려진 이슈  
2. **배포 면** — Try it(브라우저) · Windows Setup · Linux plant · USB/매뉴얼  
3. **오늘 확인 팁** — 화면 위쪽 **OS.neu v…** 숫자를 본다. Try it은 Ctrl+Shift+R로 새로고침.

| 지금 쓰는 문 | 오늘(2026-11-26) 기대 버전 | 비고 |
|--------------|----------------------------|------|
| https://os.neuavenue.com (Try it) | **1.0.29** | 웹 SPA |
| Start Menu **os.neu** (Setup.exe) | **1.0.29** (Door B) | 다운로드: `os-neu-setup-1.0.29-win-2026-11-26` · 예전 설치본은 재설치 |
| Linux `~/os.neu` plant | **1.0.29** (소스/plant 동기화) | 설치 시점에 따름 |

---

## 한눈에 보기 (최신 → 과거)

| 날짜 | 버전 | 구분 | 한 줄 요약 |
|------|------|------|------------|
| 2026-11-26 | 1.0.29 | 수정 | Think 아코디언 · Docs 먼저 열기 · 탭 전환 본문 보존 · Usage |
| 2026-11-26 | 1.0.28 | 새 기능 | Writer 종류 · 라이브 Think · 공용 작성창 |
| 2026-11-26 | 1.0.27 | 새 기능 | Agent Think 패널 · Docs/Sheets/Slides Result 동기 |
| 2026-11-26 | 1.0.26 | 수정 | Result가 Docs 본문 전체로 들어가게 수정 |
| 2026-11-25 | 1.0.25 | 새 기능 | CRM 크롬 · daf 붙여넣기 · 검색엔진 적용 · EC URL 정리 |
| 2026-11-25 | 1.0.23 | 수정·배포 | EC/NeuSpeak · CRM 본문 · Plant/Burn/Try 규칙 · **Setup Door B** |
| 2026-11-25 | 1.0.22 | 수정 | 좌석 게이트 · Wi‑Fi/네트워크 · CRM 가림 · USB 재굽기 경로 |
| 2026-11-25 | 1.0.21 | 새 기능 | EC Live Call (Electron) · Windows 가이드 |
| 2026-11-25 | 1.0.20 | 수정·문서 | USB W1 안내 · Windows에서 host plant 끔 |
| 2026-11-25 | 1.0.19 | 수정 | Windows에서 「Plant on this device」 다시 안 열리게 |
| 2026-11-25 | 1.0.18 | 수정 | 네트워크/세션 감시 · 좌석 복귀 |
| 2026-11-23 | 1.0.17 | 새 기능 | Slides HTML Agent 자동 작성 |
| 2026-11-23 | 1.0.16 | 새 기능 | daf 북마크·방문기록 계정 동기화 |
| 2026-11-23 | 1.0.15 | 새 기능 | slides.neu / HTML deck Studio 패리티 |
| 2026-11-22 | 1.0.14 | 수정 | daf 돌아올 때 불필요 탭 자동 생성 제거 |
| 2026-11-22 | 1.0.12 | 배포 | 화면·창 제목에 고객용 버전 표시 |
| 2026-11-22 | 1.0.10 | 수정 | Google 429 안내 문구 명확화 |
| 2026-11-21 | 1.0.8 | 수정 | Stop 중 AI 멈춤 · OpenAI 429 안내 |
| 2026-11-21 | 1.0.5 | 수정 | Ask AI 「AI loading…」 고착 · 타임아웃 |
| 2026-10-21 | 1.0.0 | 배포 | Windows Setup 첫 공개 (unsigned NSIS) |

*(1.0.1–1.0.4 · 1.0.6–1.0.7 · 1.0.9 · 1.0.11 · 1.0.13 등은 설치본 재빌드·매뉴얼·화면 다듬기 위주. 아래 상세·Release 참고.)*

---

## 상세 이력 (날짜·버전별)

표 열: **날짜 · 버전 · 구분 · 변경 내용 · 수정 사유 · 관련 오류/이슈 · 배포 면 · 출처**

### 2026-11-26 · 1.0.29

| 열 | 내용 |
|----|------|
| 구분 | 수정 |
| 변경 내용 | 홈에서 문서 Enter 시 **Docs를 먼저** 연다. Agent Think를 Cursor식 **아코디언**(한 단계만 크게)으로. Markdown/Preview/Word/Docs 전환 시 본문 깨짐 방지. Docs↔Sheets↔Slides 이동 버튼. Usage 팝업(오늘 횟수·호출 목록). |
| 수정 사유 | 1.0.28 스크린샷 피드백: 홈 아래 깜빡임 · Think 글자/정적 루틴 · 탭 전환 시 본문 변형 · Usage 불명확 · 「오늘 회의록」 Think 비어 보임 |
| 관련 오류/이슈 | Think 비어 보임 · 탭 전환 본문 손실 · Usage 불명확 → **완화** |
| 배포 면 | Try it **1.0.29** · Linux plant · Setup Door B **1.0.29** (당일 재배포) |
| 출처 | neuOS `af29202` · REPORT-GRANT-THINK-ACCORDION-… · Agent 프롬프트(1.0.28 피드백) · Setup `os-neu-setup-1.0.29-win-2026-11-26` |

### 2026-11-26 · 1.0.28

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | 문서 **종류(Writer kinds)** 10종. 라이브 Agent Think. This work ×. 파일당 Agent 하나. Docs/Sheets/Slides **공용 작성창**(OfficeComposer). |
| 수정 사유 | 「문서 종류에 맞는 양식 · Cursor식 로그 · 같은 작성창」 GRANT |
| 관련 오류/이슈 | (이전) 메모 양식만 쓰이던 혼동 → 종류별 분리 |
| 배포 면 | Try it / plant |
| 출처 | `b11de8e` · REPORT-GRANT-OFFICE-COMPOSER-WRITER-KINDS |

### 2026-11-26 · 1.0.27

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | Agent Think 패널 · 전체 입력 · Docs/Sheets/Slides Result 동기 |
| 수정 사유 | P0 「Think를 세 화면에서」 GRANT |
| 관련 오류/이슈 | Result가 콘솔에만 보이던 전조 → 1.0.26과 연계 |
| 배포 면 | Try it / plant |
| 출처 | `8806a96` · REPORT-GRANT-P0-AGENT-THINK-TRIPLE-SURFACE |

### 2026-11-26 · 1.0.26

| 열 | 내용 |
|----|------|
| 구분 | 수정 |
| 변경 내용 | Seat Result가 **Docs 본문 전체**에 들어가게 (콘솔만 보이던 문제) |
| 수정 사유 | Writer 결과가 문서에 안 남는 사용자 보고 |
| 관련 오류/이슈 | Result console-only → **수정** |
| 배포 면 | Try it / plant |
| 출처 | `decb31e` · REPORT-FIX-SEAT-RESULT-FULL-DOC-BODY |

### 2026-11-25 · 1.0.25

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | CRM 크롬 · daf Paste / Copy-to-app.neu · 검색엔진 적용 · EC URL 정리 |
| 수정 사유 | 랜딩 CRM·검색·붙여넣기 GRANT |
| 관련 오류/이슈 | — |
| 배포 면 | Try it / plant |
| 출처 | `e277a51` · REPORT-GRANT-LANDING-CRM-SEARCH-PASTE-EC |

### 2026-11-25 · 1.0.23 (및 동일 날 게이트 묶음)

| 열 | 내용 |
|----|------|
| 구분 | 수정 · 배포 |
| 변경 내용 | EC는 NeuSpeak iframe. CRM을 본문 레이어로. Electron에서 Plant/Burn/Try 비활성 · 웹 Try it만 활성. **Windows Setup Door B = 1.0.23** |
| 수정 사유 | EC 흰 화면 · CRM 가림 · 설치본에서 plant 다시 누르는 혼동 |
| 관련 오류/이슈 | EC 흰 화면 = NeuSpeak `:5180` 없음 → 안내/연결 경로 정리. Setup Door B는 당시 **1.0.23** 고정 후, **2026-11-26**에 **1.0.29**로 재배포 |
| 배포 면 | Setup · Try it · plant |
| 출처 | REPORT-EC-UP-WIN11-UNIFY-1.0.23 · REPORT-EC-WHITE-CRM-… · GitHub `os-neu-setup-1.0.23-…` → 이후 `os-neu-setup-1.0.29-win-…` |

### 2026-11-25 · 1.0.22

| 열 | 내용 |
|----|------|
| 구분 | 수정 |
| 변경 내용 | Resize/Plant/Burn/Try 게이트 · Wi‑Fi/네트워크 설정·테스트 · CRM z-index · USB/터치패드 모듈 · daf 새 창 JeOS 숨김 |
| 수정 사유 | 좌석에서 잘못 plant/USB · CRM 가림 · 오프라인 EC 흰 화면 진단 |
| 관련 오류/이슈 | CRM sibling stack · EC=NeuSpeak 의존 → **문서화·완화** |
| 배포 면 | SPA · USB 재굽기 경로 |
| 출처 | REPORT-GRANT-SEAT-GATES-WIFI-CRM-USB-1.0.22 |

### 2026-11-25 · 1.0.21

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 · 배포 |
| 변경 내용 | EC Live Call(Electron mic/권한) · Windows EC 가이드 · Setup 1.0.21 |
| 수정 사유 | Windows에서 영어회화 Live Call GRANT |
| 관련 오류/이슈 | VM guestcontrol 세션 없음 → 게스트 녹화 **BLOCKED**(호스트 녹화로 대체) |
| 배포 면 | Setup Door B |
| 출처 | REPORT-DEPLOY-WIN-SETUP-EC-LIVE-1.0.21 · release notes |

### 2026-11-25 · 1.0.20

| 열 | 내용 |
|----|------|
| 구분 | 수정 · 문서 |
| 변경 내용 | Windows USB 아이콘 → Rufus/ISO **안내**(bash 굽기 아님). Setup 좌석 host plant 유지 disable. Boot doors 설계 |
| 수정 사유 | USB W1 · Windows에서 plant/USB 혼동 |
| 관련 오류/이슈 | — |
| 배포 면 | Setup |
| 출처 | GitHub `os-neu-setup-1.0.20-…` · REPORT-GRANT-WIN-USB-W1 |

### 2026-11-25 · 1.0.19

| 열 | 내용 |
|----|------|
| 구분 | 수정 |
| 변경 내용 | Windows Setup에서 Plant on this device **비활성** |
| 수정 사유 | 이미 심었는데 plant가 다시 살아 있던 버그 |
| 관련 오류/이슈 | Planted인데 plant 버튼 활성 → **수정** |
| 배포 면 | Setup |
| 출처 | REPORT-DEPLOY-WIN-SETUP-1.0.19-PLANT-DISABLE |

### 2026-11-25 · 1.0.18

| 열 | 내용 |
|----|------|
| 구분 | 수정 |
| 변경 내용 | 10초 네트워크/세션 watch · app.neu↔daf 좌석 복귀 · Slides 자동작성 유지 |
| 수정 사유 | 좌석 이탈·네트워크 상태 |
| 관련 오류/이슈 | — |
| 배포 면 | Setup |
| 출처 | REPORT-DEPLOY-WIN-SETUP-1.0.18-NET-SEAT |

### 2026-11-23 · 1.0.17

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | 홈 → Slides → Studio 템플릿 → HTML 덱 **Agent 자동 작성** |
| 수정 사유 | Windows에서 슬라이드 자동화 배포 |
| 관련 오류/이슈 | 모델(로컬/연결) 필요 |
| 배포 면 | Setup |
| 출처 | REPORT-DEPLOY-WIN-SETUP-SLIDES-HTML-AUTOWRITE-1.0.17 |

### 2026-11-23 · 1.0.16

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | daf **북마크·방문기록** 로그인 계정 동기화 |
| 수정 사유 | 기기 바꿔도 북마크/히스토리 유지 GRANT |
| 관련 오류/이슈 | 교차기기 스모크 Leader 실기 전 UNKNOWN(당시) |
| 배포 면 | Setup · SPA |
| 출처 | REPORT-IMPL-DAF-BOOKMARK-HISTORY-SYNC · Setup 1.0.16 |

### 2026-11-23 · 1.0.15

| 열 | 내용 |
|----|------|
| 구분 | 새 기능 |
| 변경 내용 | slides.neu / HTML deck Studio를 Linux plant와 맞춤 |
| 수정 사유 | Windows·Linux 패리티 |
| 관련 오류/이슈 | — |
| 배포 면 | Setup |
| 출처 | GitHub Setup 1.0.15 release |

### 2026-11-22 · 1.0.14 ~ 1.0.9 (요약)

| 버전 | 구분 | 변경 내용 | 관련 오류/이슈 | 출처 |
|------|------|-----------|----------------|------|
| 1.0.14 | 수정 | daf 복귀 시 neuavenue.com 탭 자동 생성 제거 | 불필요 탭 | Setup release |
| 1.0.13–1.0.11 | 배포·다듬기 | 설치본·화면 연속 배포 | — | Setup releases |
| 1.0.12 | 배포 | 브랜드/창 제목/About에 **v1.0.12** 표시 | 버전 안 보이던 혼동 | Setup release |
| 1.0.10 | 수정 | Google 429 = 할당량/속도 안내 명확화 | 키 오류로 오해 | Setup release |
| 1.0.9 | 배포 | 설치본 재빌드 | — | Setup release |

### 2026-11-21 · 1.0.8 ~ 1.0.1 (요약)

| 버전 | 구분 | 변경 내용 | 관련 오류/이슈 | 출처 |
|------|------|-----------|----------------|------|
| 1.0.8 | 수정 | Docs/Sheets Stop · OpenAI 429 한국어 안내 · 로컬 모델 힌트 | Stop 중 멈춤 · 429 | Setup release |
| 1.0.7–1.0.6 | 배포·다듬기 | 설치·매뉴얼 연속 | — | Setup releases |
| 1.0.5 | 수정 | Ask AI 「AI loading…」 고착 · 90초 타임아웃 · Connect AI 힌트 | AI loading 무한 | Setup release |
| 1.0.4–1.0.2 | 배포 | 매뉴얼 스크린샷·영상·웹 화면 포함 재빌드 | — | Setup releases |
| 1.0.1 | 배포 | 현재 화면·매뉴얼 튜토리얼 포함 재빌드 | — | Setup release |

### 2026-10-21 · 1.0.0

| 열 | 내용 |
|----|------|
| 구분 | 배포 |
| 변경 내용 | Windows 11 x64용 **os.neu Setup.exe** 첫 공개 (unsigned). Seat Face `os.neu.exe`와 다름. |
| 수정 사유 | 고객용 설치 경로 공개 |
| 관련 오류/이슈 | SmartScreen: More info → Run anyway (서명 없음) |
| 배포 면 | Door B Setup |
| 출처 | GitHub `os-neu-setup-1.0.0` |

---

## 같은 기간의 문서·USB (버전 숫자와 별도)

| 날짜 | 구분 | 변경 내용 | 관련 오류/이슈 | 출처 |
|------|------|-----------|----------------|------|
| 2026-11-25 | 문서·배포 | USB Windows/Linux 매뉴얼 **분리** · 사진 가이드 | 한 페이지에 섞여 혼동 | REPORT-DEPLOY-MANUAL-USB-SPLIT… |
| 2026-11-25 | 문서 | Windows 가이드에 Linux 화면이 섞임 → **재캡처·재배포** | 잘못된 스크린샷 | REPORT-FINAL-USB-WINDOWS-RECAPTURE… |
| 2026-11-25 | USB | Linux `make-usb` → **NEUOS-ROOT** 경로로 재굽기 | ISO-only → payload not found | REPORT-GRANT-LINUX-MAKE-USB… |
| 2026-11-25 | 진단 | USB 좌석 회귀 진단 | S8 PASS / S9 FAIL(당시 ISO) | REPORT-DIAGNOSIS-USB-SEAT… |

---

## 오늘 기준 알려진 이슈 (체크리스트)

| ID | 이슈 | 영향 | 상태 |
|----|------|------|------|
| K1 | 예전 Setup(≤1.0.23)이 남아 있는 PC | Start Menu 숫자가 1.0.29가 아님 | **완화** · Door B를 **1.0.29**로 재설치 |
| K2 | EC Live Call은 NeuSpeak 서버 필요 | 서버 없으면 흰/빈 칸처럼 보일 수 있음 | 문서화됨 · 연결 후 재시도 |
| K3 | Setup unsigned | SmartScreen 경고 | 운영상 유지 (서명 GRANT 별도) |
| K4 | USB ISO-only | BusyBox / payload not found 가능 | Boot kit / make-usb 권장 |

---

## 출처·방법 (투명성)

| 출처 종류 | 예 |
|-----------|-----|
| GitHub Release | `Nueavenue/os-neuavenue` `os-neu-setup-1.0.x-…` |
| 소스 커밋 | `~/neuOS` `af29202` · `b11de8e` · … |
| Control 보고서 | `docs/handoff/control-tower/REPORT-*-1.0.*.md` |
| Agent 기록 | Cursor agent transcripts / GRANT 프롬프트 요약 (비밀·개인키 제외) |

**UNKNOWN:** 일부 구버전(1.0.2–1.0.4 등)은 Release 본문이 짧아 세부 사유를 한 줄로만 적음.

---

## 링크

- Try it: https://os.neuavenue.com  
- Docs: https://docs.neuavenue.com  
- 이 글(뷰어): https://docs.neuavenue.com/view.html?doc=blog-osneu-version-history-1.0-to-1.0.29.md  
- Windows 설치 가이드: https://docs.neuavenue.com/view.html?doc=windows-install-guide.md  

**Filed · 공개 블로그 · os.neu v1.0→1.0.29 · 2026-11-26**
