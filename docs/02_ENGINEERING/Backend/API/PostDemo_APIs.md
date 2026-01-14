# Post-Demo APIs

> **목표**: 데모 이후 추가 기능 구현
> **기간**: 데모 종료 후

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 24개 |
| 우선순위 | P2 전체 |
| 비고 | MVP 이후 확장 기능 |

---

## API 목록

### 홈

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /posts/feed | 통합 피드 (내 모임 최신 소식) | P2 | FE+BE | [07_API_SNS.md](./07_API_SNS.md) |

### 모임 탐색

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /search | 통합 검색 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#080-통합-검색) |
| GET | /search/challenges | 챌린지 검색 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#081-챌린지-검색) |
| GET | /search/autocomplete | 검색어 자동완성 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#082-검색어-자동완성) |

### 어카운트

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| POST | /accounts/withdraw | 출금 신청 | P2 | FE+BE | [03_API_ACCOUNT.md](./03_API_ACCOUNT.md#019-출금) |
| DELETE | /challenges/{id}/leave | 완주/탈퇴 + 보증금 해제 | P2 | FE+BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#031-챌린지-탈퇴) |

### 인증

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| POST | /auth/oauth/google | Google 소셜 로그인 | P2 | FE+BE | - |
| POST | /auth/oauth/kakao | Kakao 소셜 로그인 | P2 | FE+BE | - |

### 알림

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /notifications | 알림 목록 | P2 | FE+BE | [08_API_SYSTEM.md](./08_API_SYSTEM.md#071-알림-목록-조회) |
| PUT | /notifications/{id}/read | 알림 읽음 처리 | P2 | FE+BE | [08_API_SYSTEM.md](./08_API_SYSTEM.md#073-알림-읽음-처리) |
| WebSocket | /ws/notifications | 실시간 푸시 알림 | P2 | FE+BE | - |

### 통계/분석

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /analytics/user/activity | 사용자 활동 통계 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#083-사용자-활동-통계) |
| GET | /analytics/dashboard | 전체 통계 대시보드 | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#085-전체-통계-대시보드) |
| GET | /analytics/user/report | 개인 리포트 생성 | P3 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#086-개인-리포트-생성) |

### 추천

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /recommendations/savings-plan | 맞춤형 저축 플랜 | P3 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#088-맞춤형-저축-플랜-추천) |

---

## FE 작업

| 대분류 | 중분류 | 기능 | 우선순위 |
|--------|--------|------|---------|
| 피드 | 무한스크롤 | 무한 스크롤 구현 | P2 |
| 접근성 | 스크린리더 | ARIA 라벨 추가 | P2 |

---

## 비고

- **Elasticsearch**: 모임 탐색 검색 기능
- **WebSocket**: 실시간 알림 푸시
- **소셜 로그인**: Google/Kakao OAuth

---

**이전 Phase**: [Phase6_APIs.md](./Phase6_APIs.md) - 통합 테스트
