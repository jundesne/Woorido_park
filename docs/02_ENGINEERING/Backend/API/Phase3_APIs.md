# Phase 3 APIs (Week 4: 1/20 - 1/26)

> **목표**: 핵심 사용자 플로우 (온보딩 → 충전 → 모임 생성/가입)
> **기간**: 2026-01-20 ~ 2026-01-26 (4주차)

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 16개 |
| FE 담당 | 12개 |
| BE 담당 | 10개 |
| 체크포인트 | 충전→가입→보증금락 Full Flow |

---

## API 목록

### 홈/온보딩

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /recommendations/challenges | 인기 모임 추천 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#087-챌린지-추천) |

### 어카운트/충전

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /accounts/me | 가용/락 잔액 조회 | P0 | FE+BE | [03_API_ACCOUNT.md](./03_API_ACCOUNT.md#015-내-어카운트-조회) |
| POST | /accounts/charge | 토스페이 충전 | P0 | FE+BE | [03_API_ACCOUNT.md](./03_API_ACCOUNT.md#017-크레딧-충전) |
| POST | /accounts/charge/callback | 충전 콜백 | P0 | BE | [03_API_ACCOUNT.md](./03_API_ACCOUNT.md#018-충전-콜백-내부-api) |

### 모임 생성

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| POST | /challenges | 모임 생성 (3단계 폼) | P0 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#022-챌린지-생성) |
| GET | /challenges | 모임 목록 조회 | P0 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#023-챌린지-목록-조회) |

### 모임 상세 (공개)

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /challenges/{id} | 모임 정보 조회 | P0 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#024-챌린지-상세-조회) |
| POST | /challenges/{id}/join | 가입 신청 + 보증금 | P0 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#030-챌린지-가입) |

### 나의 모임

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /challenges/me | 가입한 모임 목록 | P0 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#027-내-챌린지-목록) |

---

## FE 작업

| 대분류 | 중분류 | 기능 | 우선순위 | UX 구현 |
|--------|--------|------|---------|---------|
| 홈 | 온보딩 | 신규 유저 웰컴 | P0 | 모임 없음 → 추천/충전 CTA ⭐ |
| 홈 | 온보딩 | 인기 모임 추천 | P0 | Skeleton Cards |
| 어카운트 | 잔액 카드 | 가용/락 잔액 표시 | P0 | Animated Counter + 0원 CTA |
| 어카운트 | 충전 | 충전 금액 선택 | P0 | 프리셋 버튼 48px |
| 어카운트 | 충전 | 토스페이 결제 | P0 | 전체 화면 로딩 |
| 어카운트 | 충전 | 충전 후 복귀 | P0 | returnUrl 복귀 ⭐ |
| 모임 생성 | 전체 | 3단계 폼 | P0 | Step Indicator |
| 모임 생성 | 운영 설정 | 보증금 미리보기 | P0 | 자동 계산 표시 ⭐ |
| 모임 상세 | 정보 | 정보 조회 | P0 | Skeleton Page |
| 모임 상세 | 정보 | 비용 계산기 | P0 | 납입+보증금 = 필요 금액 ⭐ |
| 모임 상세 | 가입 | 가입 확인 모달 | P0 | 56px 고정 하단 버튼 |
| 모임 상세 | 가입 | 잔액 부족 분기 | P0 | 충전 유도 + 복귀 약속 ⭐ |
| 나의 모임 | 리스트 | 가입한 모임 카드 | P0 | 알림 뱃지 (새 글/투표) |
| 나의 모임 | 리스트 | 빈 상태 | P0 | 모임 찾기 CTA ⭐ |

---

## 체크포인트

- [ ] 충전→가입→보증금락 Full Flow

---

## ⭐ 핵심 차별화 포인트

- **비용 계산기**: 납입+보증금 = 필요 금액 자동 계산
- **가입 확인 모달**: 56px 고정 하단 버튼
- **잔액 부족 분기**: 충전 유도 + 복귀

---

**이전 Phase**: [Phase2_APIs.md](./Phase2_APIs.md) - SNS 피드  
**다음 Phase**: [Phase4_APIs.md](./Phase4_APIs.md) - 장부/투표 API
