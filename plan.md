# 배리어프리 셀프오더 플랫폼 — 기술 스펙 & 부트스트랩 가이드

> 이 문서는 AI 코딩 에이전트가 배경지식 없이 바로 개발을 시작할 수 있도록 작성된
> 온보딩 스펙입니다. QR/NFC 태그 → 즉시 실행되는 접근성 우선(장애인 대상 배리어키오스크
> 대체재) 주문 플랫폼을 만드는 것이 목표입니다.

## 0. 프로젝트 목표 요약

- 시각/청각/지체 장애인 등 다양한 사용자가 **매장 키오스크 없이 자기 스마트폰으로** 주문할 수 있어야 함
- QR/NFC를 태그하는 즉시(설치 여부 무관) 화면이 떠야 함 — 설치를 요구하며 막는 순간 이탈
- 카메라, 가속도계/자이로, 햅틱(진동) 등 **기기 하드웨어를 적극 활용**해 직관적 UX 제공
- 애니메이션/모션은 **부드럽고(fluid), 예측 가능하고, 끌 수 있어야** 함 (전정기관 장애/멀미 대응)
- 최종 형태는 **웹(PWA/App Clip) + 네이티브 앱**을 하나의 코드베이스로 유지하는 크로스플랫폼 플랫폼

## 1. 단계별 아키텍처 (반드시 이 순서로 진행)

| 단계 | 산출물 | 이유 |
|---|---|---|
| **Phase 1** | 순수 웹 PWA (Next.js) | App Clip은 본체 앱의 App Store 심사 + App Clip Experience 사전 승인이 필요해 프로토타입 단계에서 가장 느림. 웹은 QR/NFC 태그 즉시 브라우저에서 열림 |
| **Phase 2** | Expo(React Native) 모노레포로 이식, `react-native-web`으로 웹도 같은 코드로 빌드 | 네이티브 하드웨어 API(정밀 햅틱, 백그라운드 NFC 등)는 웹 표준 API로 한계가 있음 (§3 참고) |
| **Phase 3** | 네이티브 앱을 스토어에 게시 → iOS App Clip 타겟 추가 | App Clip은 본체 앱 없이 단독 배포 불가 |
| **Phase 4** | Universal Links(AASA) / App Links(assetlinks.json) 연결 → 설치 유저는 딥링크, 미설치는 App Clip/웹으로 자동 분기 | |

**지금 시작할 것: Phase 1 (Next.js PWA)** — 단, 나중에 Phase 2로 옮길 것을 고려해서 UI 컴포넌트/상태 로직은 프레임워크 종속을 최소화해서 작성.

## 2. 전체 기술 스택

### 언어 / 코어
- **TypeScript** (전 구간 필수, strict 모드)
- **Phase 1**: Next.js 15 (App Router), React 19
- **Phase 2+**: Expo (SDK 52+), Expo Router, React Native, `react-native-web`

### 상태관리 / 데이터
- **Zustand** — 가볍고 RN/Web 동시 호환, 접근성 설정(글자 크기, 모션 감소 등) 전역 상태 관리에 적합
- **TanStack Query** — 메뉴/주문 API 캐싱

### 스타일링 / 디자인 시스템
- **Tamagui** (권장) — RN + Web을 하나의 컴포넌트로 컴파일, 애니메이션·접근성(포커스, 터치 타겟)까지 프레임워크 레벨에서 고려됨. 크로스플랫폼 "fluid" 모션에 가장 적합
  - 대안: NativeWind (Tailwind 문법 선호 시) — 단 애니메이션은 별도 라이브러리 필요
- **디자인 토큰**: 색상 대비 WCAG 2.2 AA(4.5:1) 이상, 터치 타겟 최소 44×44pt(가능하면 88pt+)

### 애니메이션 / 모션
- **react-native-reanimated 3** — 네이티브 스레드에서 돌아가 60fps 유지, 웹 빌드도 지원
- **react-native-gesture-handler** — 스와이프/드래그 제스처 (모션 장애가 있는 사용자를 위해 제스처 실패 허용 범위를 넉넉히)
- **모션 감소 대응 필수**:
  - 네이티브: `AccessibilityInfo.isReduceMotionEnabled()`
  - 웹: CSS `prefers-reduced-motion` 미디어쿼리
  - → 이 값을 Zustand 전역 상태에 반영해서 모든 애니메이션 duration/scale을 조건부로 낮추거나 끄기

### 접근성(a11y) 전용
- React Native 내장 접근성 prop: `accessibilityLabel`, `accessibilityRole`, `accessibilityLiveRegion`, `accessible`
- **expo-speech** — TTS(메뉴 항목 읽어주기, 시각장애 대응)
- 웹 검증: `@axe-core/react` (개발 중 실시간 a11y 위반 감지)
- 테스트: 실기기 VoiceOver(iOS) / TalkBack(Android) 수동 QA 체크리스트 별도 문서화 필수 (수치로 성능을 단정하지 말 것 — 기기·버전마다 다름)

### 하드웨어 접근 (카메라 / 센서 / 햅틱)

> **가장 중요한 제약**: iOS Safari(웹)는 `Vibration API`를 아예 지원하지 않음(WebKit 미구현, 향후에도 계획 없음). 즉 **정밀한 햅틱 피드백이 필요하면 Phase 1 웹만으로는 한계가 있고, Phase 2 네이티브 전환이 사실상 필수**입니다. 이 점을 처음부터 설계에 반영하세요.

| 기능 | Phase 1 (웹) | Phase 2+ (네이티브/Expo) |
|---|---|---|
| 카메라 (바코드/메뉴 스캔 등) | `getUserMedia` (iOS/Android 모두 지원) | `expo-camera` |
| 가속도계/자이로 (기울임 제스처 등) | `DeviceMotionEvent` — **iOS는 반드시 사용자 제스처(버튼 탭) 안에서 `requestPermission()` 호출해야 동작** | `expo-sensors` (Accelerometer, Gyroscope) |
| 햅틱/진동 | Android Chrome: `navigator.vibrate()` 동작 / **iOS Safari: 미지원** (폴리필 존재하나 iOS 18.4+부터 클릭 이벤트 1초 이내로 제한되는 등 불안정 — 프로덕션 의존 비권장) | `expo-haptics` (Core Haptics/Android Vibrator 완전 지원, 강도·패턴 세밀 제어) |
| NFC (앱 실행 후 태그 읽기) | 웹 NFC는 Android Chrome 일부만 지원, iOS Safari 전면 미지원 | `react-native-nfc-manager` |
| QR/NFC로 앱 **최초 실행** (미설치 유저) | URL 태깅만으로 브라우저 오픈 (별도 라이브러리 불필요) | iOS: App Clip / Android: App Links → 웹 폴백 |

### 결제
- **Apple Pay** (App Clip 표준 연동, 마찰 최소화) / **Google Pay**
- 웹 단계에서는 Stripe Elements 등으로 통일 처리 후 네이티브 전환 시 각 OS 결제 SDK 연동

### 인프라 / 배포
- **EAS (Expo Application Services)** — iOS/Android 빌드 + App Clip 타겟 관리
- `.well-known/apple-app-site-association`, `.well-known/assetlinks.json` 호스팅 (도메인 서버, Vercel 등)
- iOS App Clip 타겟: `@bacons/apple-targets` (구 `expo-apple-targets`) config plugin

### 테스트
- Jest + React Native Testing Library (로직/컴포넌트)
- Detox (E2E, 네이티브 단계 진입 후)
- `@axe-core/react` + 수동 스크린리더 QA (a11y)

## 3. Phase 1 (지금 시작) 부트스트랩 커맨드

```bash
# Next.js PWA 초기화
npx create-next-app@latest barrier-free-kiosk --typescript --app --tailwind --eslint
cd barrier-free-kiosk

# 상태관리 / 데이터 페칭
npm install zustand @tanstack/react-query

# 접근성 검증 (개발 의존성)
npm install -D @axe-core/react

# PWA 설정
npm install next-pwa

# QR 생성 (매장 태그 출력용, 개발 스크립트에서만 사용)
npm install -D qrcode
```

`app/layout.tsx`에 `manifest.json` 연결 + 기본 서비스워커 등록 → Vercel 배포 → 발급된 URL을 QR/NFC 태그에 인코딩.

## 4. 폴더 구조 (Phase 2 이식을 염두에 둔 설계)

```
/app                     # Next.js App Router (Phase1) → Expo Router로 대체 예정
/components
  /ui                    # Tamagui 기반 순수 프레젠테이션 컴포넌트 (프레임워크 비종속 로직)
  /a11y                  # 접근성 전용 wrapper (TTS 버튼, 모션 감소 토글 등)
/hooks
  useReducedMotion.ts     # 웹: matchMedia / 네이티브 전환 시 AccessibilityInfo로 교체
  useHaptics.ts            # 웹: navigator.vibrate 폴백 / 네이티브 전환 시 expo-haptics로 교체
/store                    # Zustand 스토어 (주문, 접근성 설정)
/lib
  /api                     # 메뉴/주문/결제 API 클라이언트
public/manifest.json
public/.well-known/        # 추후 AASA, assetlinks.json 위치 (Phase 4)
```

`hooks/` 아래 하드웨어 접근 로직을 **인터페이스로 감싸서** Phase 2 전환 시 구현체만 교체하면 되도록 설계하는 것이 핵심입니다.

## 5. 접근성 설계 원칙 (모든 화면에 적용)

1. **터치 타겟 최소 44×44pt**, 지체장애 고려 시 핵심 CTA는 88pt+
2. **모든 애니메이션에 reduced-motion 분기 필수** — 끄면 즉시 상태 전환(페이드/슬라이드 없이)
3. **포커스 순서**를 시각적 순서와 일치시키고, 스크린리더 라이브 리전으로 주문 상태 변경(예: "장바구니에 담김") 안내
4. **색만으로 정보 전달 금지** (예: 품절 표시는 색+텍스트+아이콘 동시)
5. **동적 글자 크기(Dynamic Type/Android 폰트 스케일) 대응** — 고정 px 대신 상대 단위
6. **한 손 조작 고려**: 하단 고정 CTA, 스와이프 대체 버튼 항상 제공(제스처 단독 의존 금지)
7. **햅틱은 보조 신호로만 사용** (진동이 안 되는 환경에서도 시각/청각 피드백이 항상 동반되어야 함 — iOS 웹 단계의 제약 때문에 더욱 중요)

## 6. 다음 단계에서 결정해야 할 것 (지금은 보류)

- 백엔드 API 구조 (주문/결제/메뉴 관리)
- App Clip Experience 등록 및 Apple 심사 타임라인 확보 (Phase 3 진입 최소 1~2일 전 신청)
- 매장별 QR/NFC 프로비저닝 방식 (URL에 테이블/매장 ID 포함하는 방식 권장: `kiosk.yourdomain.com/{storeId}/table/{n}`)

---

**요약**: Phase 1은 Next.js PWA로 시작하되, 하드웨어 접근 로직은 처음부터 인터페이스로 분리해서 작성하고, 햅틱은 iOS 웹에서 동작하지 않는다는 전제하에 항상 시각/청각 대체 피드백을 병행 설계하세요.
