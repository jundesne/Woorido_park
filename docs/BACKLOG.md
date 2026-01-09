# WOORIDO 백로그

> 기능 변경 이력 및 신규 추가 항목

---

## 기능 백로그

### 챌린지 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 챌린지 상태 시스템 | RECRUITING → ACTIVE → CLOSED 상태 흐름 | P-046 ~ P-050 |
| 입회비 계산 공식 | 챌린지 어카운트 잔액 / (현재 멤버 수 - 1) | P-015 |

### 유저 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 유저 점수 시스템 | WRD-105 기반 점수 공식: 36.5 + (납입×0.7) + (활동×0.15) | P-051 |
| 리더 승계 시스템 | 리더 30일 미활동 시 팔로워 강퇴 요청 가능, 점수 최고자 승계 | P-033 ~ P-035 |

### 정기 모임

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 정기 모임 기능 | 오프라인 만남 이벤트, 과반수 참석 필수 | P-043 ~ P-045 |
| 모임 관련 지출 투표 | 참석자만 투표 가능, 건별 승인 | P-042 |

### 장부 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 사용처 자동 기록 | PG 결제 시 상호명/업종 자동 파싱 (조작 불가) | P-029 |

---

## ERD 변경 이력

### 신규 테이블

| 테이블 | 설명 |
|--------|------|
| `user_scores` | 유저 점수 저장 (WRD-105) |
| `meetings` | 정기 모임 |
| `meeting_attendees` | 모임 참석자 |
| `reports` | 신고 시스템 |
| `admins` | 관리자 계정 |
| `fee_policies` | 수수료 정책 |
| `admin_logs` | 감사 추적 |

### 컬럼 추가

| 테이블 | 컬럼 | 설명 |
|--------|------|------|
| `gye` | `sub_leader_id` | 부리더 (점수 2위 자동 지정) |
| `gye` | `leader_last_active_at` | 리더 최근 활동일 |
| `gye` | `is_verified` | 완주 인증 (1년 운영) |
| `gye` | `status` | 챌린지 상태 (RECRUITING/ACTIVE/CLOSED) |
| `gye` | `activated_at` | ACTIVE 전환 시점 |
| `gye_members` | `privilege_status` | 권한 상태 (ACTIVE/REVOKED) |
| `gye_members` | `privilege_revoked_at` | 권한 박탈 시점 |
| `ledger_entries` | `merchant_name` | 상호명 (PG 자동 입력) |
| `ledger_entries` | `merchant_category` | 업종 |
| `ledger_entries` | `pg_provider` | PG사 |
| `votes` | `meeting_id` | 모임 관련 지출용 |
| `votes` | `meeting_title/date/location` | 모임 참석 투표용 |
| `votes` | `ledger_entry_id` | 투표-장부 연결 |
| `vote_records` | `choice` 확장 | ATTEND/ABSENT 추가 (정기 모임 참석 투표용) |
| `users` | `account_status` | 계정 상태 (ACTIVE/SUSPENDED/BANNED) |
| `users` | `suspended_at/until` | 정지 시점/해제 시점 |
| `users` | `warning_count` | 경고 횟수 |
| `users` | `report_received_count` | 신고 당한 횟수 |
| `accounts` | `version` | Optimistic Lock |
| `account_transactions` | `type` 확장 | ENTRY_FEE, SUPPORT 추가 |
| `account_transactions` | `idempotency_key` | 중복 요청 검증 |
| `gye_members` | `leave_reason` | 탈퇴 사유 |

### 인덱스 추가

| 테이블 | 인덱스 | 설명 |
|--------|--------|------|
| `gye` | `idx_gye_verified` | 완주 인증 챌린지 조회용 |
| `gye` | `idx_gye_inactive_leader` | 리더 미활동 조회용 |
| `votes` | `idx_votes_ledger` | 장부 연결 조회용 |
| `votes` | `idx_votes_meeting` | 모임 관련 지출 조회용 |
| `gye_members` | `idx_members_revoked` | 자동 탈퇴 대상 조회용 |
| `ledger_entries` | `idx_ledger_merchant` | 사용처 검색용 |
| `users` | `idx_users_status` | 계정 상태 조회용 |
| `users` | `idx_users_suspended` | 정지 해제 예정 조회용 |

---

## ERD 스키마 변경사항 (v2.1 통합)

| 테이블 | 변경 내용 |
|--------|---------|
| **gye** | `is_verified`, `verified_at` 추가, 용어 매핑 주석 |
| **gye_members** | `privilege_status`, `privilege_revoked_at`, `leave_reason` 추가, 역할 FOLLOWER로 변경 |
| **admins** | 신규 - 관리자 계정 |
| **fee_policies** | 신규 - 수수료 정책 |
| **reports** | 신규 - 신고 관리 |
| **admin_logs** | 신규 - 감사 추적 |

---

## 정책 변경 이력

| 정책 코드 | 변경 내용 |
|----------|----------|
| P-015 | 입회비 계산 공식 추가 |
| P-021 | 권한 박탈 및 유예 기간 상세화 |
| P-033 ~ P-035 | 리더 활동/승계/부리더 정책 추가 |
| P-043 ~ P-045 | 정기 모임 정책 추가 |
| P-046 ~ P-050 | 챌린지 상태 정책 추가 |
| P-051 | 모임 참석 점수 정책 추가 |
| P-030 | PRODUCT_AGENDA 신고 누적 횟수 동기화 (3건 → 20회, 2026-01-09) |
