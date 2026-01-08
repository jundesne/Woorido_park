# WOORIDO 디자인 토큰 v1.0

> **Purpose:** 플랫폼 공통 디자인 시스템
> **Last Updated:** 2026-01-08

---

## 1. 색상 (Colors)

### 1.1 브랜드 색상

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-primary` | #6366F1 | 메인 액션 |
| `--color-primary-light` | #818CF8 | 호버 |
| `--color-primary-dark` | #4F46E5 | 액티브 |
| `--color-secondary` | #10B981 | 성공, 완료 |
| `--color-accent` | #F59E0B | 강조, 알림 |

### 1.2 시맨틱 색상

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-success` | #10B981 | 성공 |
| `--color-warning` | #F59E0B | 경고 |
| `--color-error` | #EF4444 | 에러 |
| `--color-info` | #3B82F6 | 정보 |

### 1.3 중립 색상

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-gray-50` | #F9FAFB | 배경 |
| `--color-gray-100` | #F3F4F6 | 카드 배경 |
| `--color-gray-200` | #E5E7EB | 보더 |
| `--color-gray-400` | #9CA3AF | 비활성 텍스트 |
| `--color-gray-600` | #4B5563 | 보조 텍스트 |
| `--color-gray-900` | #111827 | 메인 텍스트 |

### 1.4 다크 모드

| 라이트 | 다크 |
|--------|------|
| `gray-50` | `gray-900` |
| `gray-100` | `gray-800` |
| `gray-900` | `gray-50` |

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

```css
--font-sans: 'Pretendard', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### 2.2 폰트 크기

| 토큰 | 모바일 | 데스크탑 | 용도 |
|------|--------|---------|------|
| `--text-xs` | 11px | 12px | 캡션 |
| `--text-sm` | 13px | 14px | 보조 텍스트 |
| `--text-base` | 15px | 16px | 본문 |
| `--text-lg` | 17px | 18px | 소제목 |
| `--text-xl` | 20px | 22px | 제목 |
| `--text-2xl` | 24px | 28px | 대제목 |
| `--text-3xl` | 30px | 36px | 히어로 |

### 2.3 폰트 굵기

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-normal` | 400 | 본문 |
| `--font-medium` | 500 | 강조 |
| `--font-semibold` | 600 | 제목 |
| `--font-bold` | 700 | 버튼 |

---

## 3. 간격 (Spacing)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--space-1` | 4px | 최소 간격 |
| `--space-2` | 8px | 아이콘-텍스트 |
| `--space-3` | 12px | 요소 내부 |
| `--space-4` | 16px | 카드 패딩 |
| `--space-6` | 24px | 섹션 간격 |
| `--space-8` | 32px | 큰 섹션 |

---

## 4. 둥글기 (Border Radius)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 4px | 작은 버튼 |
| `--radius-md` | 8px | 카드 |
| `--radius-lg` | 12px | 모달 |
| `--radius-xl` | 16px | 바텀시트 |
| `--radius-full` | 9999px | 원형 |

---

## 5. 그림자 (Shadow)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 카드 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | 드롭다운 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 모달 |

---

## 6. 애니메이션

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--duration-fast` | 150ms | 호버 |
| `--duration-normal` | 250ms | 전환 |
| `--duration-slow` | 400ms | 모달 |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 기본 |

---

## 7. Z-Index

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--z-dropdown` | 1000 | 드롭다운 |
| `--z-sticky` | 1020 | 스티키 헤더 |
| `--z-modal` | 1050 | 모달 |
| `--z-toast` | 1080 | 토스트 |

---

**관련 문서:**
- [IA_MOBILE.md](../MOBILE/IA_MOBILE.md)
- [IA_DESKTOP.md](../DESKTOP/IA_DESKTOP.md)
