# Phase 2 APIs (Week 2-3: 1/6 - 1/19)

> **목표**: SNS 피드 기능 구현
> **기간**: 2026-01-06 ~ 2026-01-19 (2~3주차)

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 14개 |
| FE 담당 | 8개 |
| BE 담당 | 14개 |
| 체크포인트 | 피드 Full Flow 작동, 이미지 업로드 성공 |

---

## API 목록

### Week 2 (1/6 - 1/12): 피드 기본

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /challenges/{id}/posts | 피드 목록 조회 | P0 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#054-게시글-목록-조회) |
| POST | /challenges/{id}/posts | 글 작성 (텍스트) | P0 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#056-게시글-작성) |
| PUT | /challenges/{id}/posts/{id}/pin | 공지사항 핀 (CP 전용) | P2 | FE+BE | [07_API_SNS.md](./07_API_SNS.md) |
| POST | /challenges/{id}/posts/{id}/like | 좋아요 토글 | P1 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#059-게시글-좋아요) |

### Week 3 (1/13 - 1/19): 댓글 + 이미지

| Method | Endpoint | 설명 | 우선순위 | 담당 | 상세 문서 |
|--------|----------|------|---------|------|-----------|
| GET | /challenges/{id}/posts/{id}/comments | 댓글 목록 | P0 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#063-댓글-목록-조회) |
| POST | /challenges/{id}/posts/{id}/comments | 댓글 작성 | P0 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#064-댓글-작성) |
| POST | /comments/{id}/replies | 대댓글 작성 | P1 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#068-대댓글-작성) |
| PUT | /comments/{id} | 댓글 수정 | P1 | FE+BE | [07_API_SNS.md](./07_API_SNS.md) |
| POST | /challenges/{id}/posts/upload | 이미지 업로드 | P1 | FE+BE | [07_API_SNS.md](./07_API_SNS.md#061-파일-업로드) |

---

## FE 작업

### Week 2

| 대분류 | 중분류 | 기능 | 우선순위 | UX 구현 |
|--------|--------|------|---------|---------|
| 피드 | 목록 | 피드 목록 조회 | P0 | Skeleton + Pull-to-Refresh |
| 피드 | 빈 상태 | 빈 피드 상태 | P0 | 첫 글 작성 CTA ⭐ |
| 피드 | 작성 | 글 작성 (텍스트) | P0 | FAB 버튼 (56px) |
| 피드 | 좋아요 | 좋아요 토글 | P0 | Optimistic UI + 44px 타겟 |

### Week 3

| 대분류 | 중분류 | 기능 | 우선순위 | UX 구현 |
|--------|--------|------|---------|---------|
| 피드 | 댓글 | 댓글/대댓글 | P0 | 2단계까지 |
| 피드 | 이미지 | 이미지 업로드 | P1 | Progress Bar + 실패 시 Fallback |
| 피드 | Skeleton | Skeleton UI | P0 | 피드 카드 Skeleton |

---

## 체크포인트

- [ ] 피드 Full Flow 작동 (Week 3)
- [ ] 이미지 업로드 성공 (Week 3)

---

## 의존성

| 기능 | 선행 조건 |
|------|----------|
| 피드 목록 | Phase1 Seed 데이터 |
| 이미지 업로드 | S3 연동 |

---

**이전 Phase**: [Phase1_APIs.md](./Phase1_APIs.md) - 인증/환경설정  
**다음 Phase**: [Phase3_APIs.md](./Phase3_APIs.md) - 온보딩/충전/모임생성/가입
