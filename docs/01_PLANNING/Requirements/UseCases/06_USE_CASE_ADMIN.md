# 관리자 도메인 유스케이스

> 관련 테이블: `admins`, `fee_policies`, `admin_logs`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)

---

## UC-ADMIN-01: 신고 처리

**액터**: 관리자 (ADMIN, SUPPORT)
**전제조건**: reports.status = 'PENDING'
**관련 테이블**: `reports`, `users`, `admin_logs`

**성공 시나리오**:
1. 관리자가 신고 목록 조회
2. 신고 상세 확인
3. 처리 결정
   - CONFIRMED: 위반 확인 → 피신고자 경고
   - REJECTED: 신고 기각
   - FALSE_REPORT: 허위 신고 → 신고자 경고
4. reports 상태 변경
   - status: 처리 결과
   - reviewed_at: 현재 시간
   - reviewed_by: 관리자 ID
   - admin_note: 처리 메모
5. admin_logs 기록
   - action: 'RESOLVE_REPORT'

**사후조건**:
- `reports.status` 변경
- `admin_logs` 기록 생성

---

## UC-ADMIN-02: 수수료 정책 관리

**액터**: 관리자 (SUPER_ADMIN)
**관련 테이블**: `fee_policies`, `admin_logs`

**성공 시나리오**:
1. 관리자가 "수수료 정책 관리" 접근
2. 현재 정책 목록 확인
   - min_amount, max_amount, rate
3. 정책 수정/추가
4. fee_policies 레코드 생성/수정
5. admin_logs 기록
   - action: 'CREATE_FEE_POLICY' 또는 'UPDATE_FEE_POLICY'

**사후조건**:
- `fee_policies` 레코드 변경
- `admin_logs` 기록 생성

---

## UC-ADMIN-03: 유저 정지/해제

**액터**: 관리자 (ADMIN)
**관련 테이블**: `users`, `admin_logs`

**성공 시나리오**:
1. 관리자가 유저 상세 조회
2. 정지 처리
   - users.account_status → 'SUSPENDED' 또는 'BANNED'
   - users.suspension_reason 기록
3. 또는 해제 처리
   - users.account_status → 'ACTIVE'
4. admin_logs 기록
   - action: 'SUSPEND_USER' 또는 'UNSUSPEND_USER'

**사후조건**:
- `users.account_status` 변경
- `admin_logs` 기록 생성

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [06_SCHEMA_ADMIN.md](../../../02_ENGINEERING/Database/06_SCHEMA_ADMIN.md) - ERD
