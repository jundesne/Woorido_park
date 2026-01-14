# Phase 4 APIs (Week 5: 1/27 - 2/5)

> **목표**: 장부 + 투표 API 구현
> **기간**: 2026-01-27 ~ 2026-02-05 (5주차)

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 12개 |
| FE 담당 | 4개 |
| BE 담당 | 12개 |
| 체크포인트 | 투표승인→장부기록 테스트, 장부 차트 정상 렌더링 |

---

## API 목록

### Week 5 전반 (1/27 - 1/31): 투표/장부 API

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /challenges/{id}/votes | 투표 목록 조회 | P0 | BE | [06_API_VOTE.md](./06_API_VOTE.md#041-투표-목록-조회) |
| POST | /challenges/{id}/votes | 투표 생성 | P0 | BE | [06_API_VOTE.md](./06_API_VOTE.md#043-투표-생성) |
| PUT | /votes/{id}/cast | 투표 참여 | P0 | BE | [06_API_VOTE.md](./06_API_VOTE.md#044-투표하기) |
| GET | /votes/{id}/result | 투표 결과 | P1 | BE | [06_API_VOTE.md](./06_API_VOTE.md#045-투표-결과-조회) |
| GET | /challenges/{id}/ledger | 장부 조회 | P1 | BE | [09_API_LEDGER.md](./09_API_LEDGER.md#052-장부-조회) |
| POST | /challenges/{id}/expenses | 지출 등록 | P0 | BE | [07_API_SNS.md](./07_API_SNS.md) |
| PUT | /challenges/{id}/expenses/{id}/approve | 지출 승인 | P0 | BE | [07_API_SNS.md](./07_API_SNS.md) |
| GET | /challenges/{id}/expenses | 지출 목록 | P0 | BE | [07_API_SNS.md](./07_API_SNS.md) |

### Week 5 후반 (2/1 - 2/5): Django 분석 연동

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /analytics/challenge/{id} | 챌린지 분석 (Django) | P2 | FE+BE | [10_API_DJANGO.md](./10_API_DJANGO.md#084-챌린지-분석) |
| GET | /challenges/{id}/ledger | 거래 내역 타임라인 | P1 | FE+BE | [09_API_LEDGER.md](./09_API_LEDGER.md#052-장부-조회) |

---

## FE 작업

| 대분류 | 중분류 | 기능 | 우선순위 | UX 구현 |
|--------|--------|------|---------|---------|
| 장부 | 차트 | Recharts 차트 | P0 | 차트 실패 → 숫자 Fallback |
| 장부 | 요약 | 요약 카드 UI | P0 | Skeleton Card |
| 장부 | 빈 상태 | 빈 장부 상태 | P0 | 첫 지출 요청 안내 ⭐ |
| 장부 | 내역 | 거래 내역 타임라인 | P0 | 무한스크롤 + Skeleton |

---

## BE 작업

| 대분류 | 중분류 | 기능 | 우선순위 | 비고 |
|--------|--------|------|---------|------|
| 투표 | API | 생성/참여 API | P0 | 장부 테스트용 선행 |
| 장부 | API | 기본 CRUD API | P0 | - |
| 장부-투표 | 연동 | 승인 → 장부 연동 | P0 | 핵심 연동 |
| 장부 | Django | 분석 연동 | P0 | Spring→Django 프록시 |

---

## 체크포인트

- [ ] 투표승인→장부기록 테스트 (Week 5 전반)
- [ ] 장부 차트 정상 렌더링 (Week 5 후반)

---

## 의존성

| 기능 | 선행 조건 |
|------|----------|
| 투표 API | Phase3 완료 |
| 장부 API | 투표 API 완료 |
| Django 분석 | 장부 API 완료 |

---

**이전 Phase**: [Phase3_APIs.md](./Phase3_APIs.md) - 온보딩/충전/모임생성/가입  
**다음 Phase**: [Phase5_APIs.md](./Phase5_APIs.md) - 투표 UI/Flow
