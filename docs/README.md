# WOORIDO 문서 가이드

> 프로젝트 문서 네비게이션 및 변경 이력 요약

---

## 📂 문서 구조

| 문서 | 목적 | 경로 |
|------|------|------|
| **정책 정의서** | 서비스 정책 (기준 문서) | [POLICY_DEFINITION.md](./01_PLANNING/Product/POLICY_DEFINITION.md) |
| **프로덕트 아젠다** | 비즈니스 로직/기능 명세 | [PRODUCT_AGENDA.md](./01_PLANNING/Product/PRODUCT_AGENDA.md) |
| **ERD 명세서** | 데이터베이스 스키마 | [ERD_SPECIFICATION.md](./02_ENGINEERING/Database/ERD_SPECIFICATION.md) |
| **용어 정의** | 용어/네이밍 컨벤션 | [TERMINOLOGY.md](./01_PLANNING/Product/TERMINOLOGY.md) |
| **개발 일정** | 스프린트/체크포인트 | [SCHEDULE.md](./SCHEDULE.md) |
| **백로그** | 변경 이력/신규 기능 | [BACKLOG.md](./BACKLOG.md) |

---

## 📋 문서 역할

```
POLICY_DEFINITION.md (기준 문서)
    │
    ├── PRODUCT_AGENDA.md (정책 참조)
    │       └── 비즈니스 로직, 기능 설계
    │
    └── ERD_SPECIFICATION.md (정책 코드 연결)
            └── DB 스키마, 제약조건
```

---

## 🔄 최근 변경 요약

최근 변경사항은 [BACKLOG.md](./BACKLOG.md) 참조

---

## 📖 관련 문서

- [시스템 아키텍처](./02_ENGINEERING/Architecture/SYSTEM_ARCHITECTURE.md)
- [유스케이스 명세](./01_PLANNING/Requirements/USE_CASES.md)
- [WBS 일정](./05_PROJECT_MANAGEMENT/WBS_AI_MASTER.md)
