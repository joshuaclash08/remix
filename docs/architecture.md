# 아키텍처 명세서 (Architecture Specification)

## 1. 개요 및 기술 스택
- **Framework**: Next.js 16 (App Router) + React 19 / TypeScript
- **Package Manager**: Bun 1.3+
- **Styling**: Tailwind CSS
- **Animations**: GSAP + Framer Motion
- **State Management**: Zustand (Accessibility / Cart)

## 2. 뷰포트 센더링
- `MobileDeviceContainer`: 넓은 화면에서는 좌우 흰색 공백 처리, 중앙 430px 고정 렌더링.
- 실기기 스마트폰에서는 전체 화면으로 표출.
