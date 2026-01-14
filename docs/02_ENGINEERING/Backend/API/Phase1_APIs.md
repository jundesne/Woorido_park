# Phase 1 APIs (Week 1: 12/30 - 1/5)

> **목표**: 개발 환경 구축 + 인증 기본 기능
> **기간**: 2025-12-30 ~ 2026-01-05 (1주차)

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 4개 |
| FE 담당 | 3개 |
| BE 담당 | 4개 |
| 체크포인트 | 개발환경 100% 작동 |

---

## API 목록

### 인증 (AUTH)

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| POST | /auth/login | JWT 로그인 | P0 | FE+BE | [01_API_AUTH.md](./01_API_AUTH.md#002-로그인) |
| POST | /auth/signup | 회원가입 | P0 | FE+BE | [01_API_AUTH.md](./01_API_AUTH.md#001-회원가입) |

### 모임 Seed 데이터

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| POST | /challenges | 테스트 모임 생성 | P0 | BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#022-챌린지-생성) |
| POST | /challenges/{id}/join | 테스트 멤버 가입 | P0 | BE | [04_API_CHALLENGE.md](./04_API_CHALLENGE.md#030-챌린지-가입) |

---

## FE 작업

| 대분류 | 중분류 | 기능 | 우선순위 | UX 구현 |
|--------|--------|------|---------|---------|
| 공통 | 헤더 | 로고 + 네비게이션 | P0 | 터치 타겟 44px 이상 |
| 공통 | 레이아웃 | 반응형 기본 구조 | P0 | Mobile/Desktop 분기 |
| 공통 | Skeleton | 공통 Skeleton 컴포넌트 | P0 | Card/List/Page 3종 |
| 인증 | 로그인 | JWT 인증 폼 | P0 | Enter키 지원 + 에러 메시지 |

---

## BE 작업

| 대분류 | 중분류 | 기능 | 우선순위 | 비고 |
|--------|--------|------|---------|------|
| 인증 | 로그인 | JWT 인증 기본 | P0 | Spring Security |
| 모임 | Seed 데이터 | 테스트 모임 2개 + 멤버 5명 | P0 | SNS 테스트용 필수 |
| 환경 | Django | 프로젝트 초기화 + pandas | P0 | Spring↔Django 통신 |

---

## 체크포인트

- [ ] 개발환경 100% 작동
- [ ] 테스트 모임 DB 존재
- [ ] Spring↔Django 통신 성공

---

**다음 Phase**: [Phase2_APIs.md](./Phase2_APIs.md) - SNS 피드
