# 백엔드 구현 가이드

## 1. Spring Boot 백엔드 구조

### 1.1 계층별 역할

```
Spring Boot Application
├── Presentation Layer (Controller)
│   └── REST API 엔드포인트 정의
├── Business Layer (Service)
│   └── 비즈니스 로직 실행
├── Persistence Layer (Repository/Mapper)
│   └── 데이터베이스 접근
└── Domain Layer (Entity/DTO)
    └── 비즈니스 객체 정의
```

### 1.2 패키지 구조

```
src/main/java/com/woorido
├── domain
│   ├── challenge
│   │   ├── Challenge.java (엔티티)
│   │   ├── ChallengeController.java
│   │   ├── ChallengeService.java
│   │   ├── ChallengeMapper.java (MyBatis)
│   │   └── dto
│   │       ├── ChallengeCreateRequest.java
│   │       ├── ChallengeResponse.java
│   │       └── ChallengeJoinRequest.java
│   ├── vote
│   │   ├── Vote.java
│   │   ├── VoteController.java
│   │   ├── VoteService.java
│   │   ├── VoteMapper.java
│   │   └── dto
│   ├── transaction
│   ├── meeting
│   └── member
├── common
│   ├── config
│   │   ├── DatabaseConfig.java
│   │   └── SecurityConfig.java
│   ├── exception
│   │   ├── GlobalExceptionHandler.java
│   │   └── BusinessException.java
│   └── util
│       ├── DateUtil.java
│       └── CryptoUtil.java
└── integration
    └── django
        ├── DjangoSyncService.java
        └── dto

src/main/resources
├── mybatis
│   └── mapper
│       ├── ChallengeMapper.xml
│       ├── VoteMapper.xml
│       └── TransactionMapper.xml
└── application.yml
```

## 2. MyBatis 패턴

### 2.1 Mapper 인터페이스

```java
// ChallengeMapper.java

package com.woorido.domain.challenge;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChallengeMapper {

    /**
     * 챌린지 생성
     */
    void insertChallenge(Challenge challenge);

    /**
     * 챌린지 단건 조회
     */
    Challenge selectChallengeById(@Param("id") Long id);

    /**
     * 챌린지 목록 조회 (페이징)
     */
    List<Challenge> selectChallenges(
        @Param("status") String status,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /**
     * 챌린지 수정
     */
    int updateChallenge(Challenge challenge);

    /**
     * 챌린지 삭제 (soft delete)
     */
    int deleteChallenge(@Param("id") Long id);

    /**
     * 챌린지 잔액 조회 (입회비 계산용)
     */
    ChallengeBalanceInfo selectBalanceInfo(@Param("challengeId") Long challengeId);
}
```

### 2.2 Mapper XML

```xml
<!-- ChallengeMapper.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.woorido.domain.challenge.ChallengeMapper">

    <!-- Result Map -->
    <resultMap id="challengeResultMap" type="com.woorido.domain.challenge.Challenge">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="description" column="description"/>
        <result property="category" column="category"/>
        <result property="participationFee" column="participation_fee"/>
        <result property="deposit" column="deposit"/>
        <result property="balance" column="balance"/>
        <result property="status" column="status"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>

        <!-- Association: 리더 정보 -->
        <association property="leader" javaType="com.woorido.domain.member.Member">
            <id property="id" column="leader_id"/>
            <result property="name" column="leader_name"/>
            <result property="email" column="leader_email"/>
        </association>

        <!-- Collection: 멤버 목록 (N+1 방지) -->
        <collection property="members" ofType="com.woorido.domain.member.Member"
                    select="com.woorido.domain.member.MemberMapper.selectMembersByChallengeId"
                    column="id"/>
    </resultMap>

    <!-- 챌린지 생성 -->
    <insert id="insertChallenge" parameterType="com.woorido.domain.challenge.Challenge"
            useGeneratedKeys="true" keyProperty="id">
        INSERT INTO challenges (
            title, description, category,
            participation_fee, deposit, balance,
            leader_id, status, created_at, updated_at
        ) VALUES (
            #{title}, #{description}, #{category},
            #{participationFee}, #{deposit}, #{balance},
            #{leaderId}, #{status}, SYSDATE, SYSDATE
        )
    </insert>

    <!-- 챌린지 단건 조회 -->
    <select id="selectChallengeById" resultMap="challengeResultMap">
        SELECT
            c.id, c.title, c.description, c.category,
            c.participation_fee, c.deposit, c.balance,
            c.status, c.created_at, c.updated_at,
            u.id as leader_id,
            u.name as leader_name,
            u.email as leader_email
        FROM challenges c
        INNER JOIN users u ON c.leader_id = u.id
        WHERE c.id = #{id}
          AND c.deleted_at IS NULL
    </select>

    <!-- 챌린지 목록 조회 (Cursor-based Pagination) -->
    <select id="selectChallenges" resultMap="challengeResultMap">
        SELECT
            c.id, c.title, c.description, c.category,
            c.participation_fee, c.deposit, c.balance,
            c.status, c.created_at, c.updated_at,
            u.id as leader_id,
            u.name as leader_name
        FROM challenges c
        INNER JOIN users u ON c.leader_id = u.id
        WHERE c.deleted_at IS NULL
          <if test="status != null">
          AND c.status = #{status}
          </if>
        ORDER BY c.created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <!-- 챌린지 잔액 조회 (입회비 계산용, FOR UPDATE) -->
    <select id="selectBalanceInfo" resultType="com.woorido.domain.challenge.ChallengeBalanceInfo">
        SELECT
            balance,
            (SELECT COUNT(*) FROM challenge_members WHERE challenge_id = #{challengeId} AND left_at IS NULL) as member_count
        FROM challenges
        WHERE id = #{challengeId}
        FOR UPDATE
    </select>

    <!-- 챌린지 수정 -->
    <update id="updateChallenge" parameterType="com.woorido.domain.challenge.Challenge">
        UPDATE challenges
        SET title = #{title},
            description = #{description},
            balance = #{balance},
            status = #{status},
            updated_at = SYSDATE
        WHERE id = #{id}
    </update>

    <!-- 챌린지 삭제 (Soft Delete) -->
    <update id="deleteChallenge">
        UPDATE challenges
        SET deleted_at = SYSDATE
        WHERE id = #{id}
    </update>

</mapper>
```

## 3. Service Layer 패턴

### 3.1 Service 클래스 구조

```java
// ChallengeService.java

package com.woorido.domain.challenge;

import com.woorido.domain.member.MemberMapper;
import com.woorido.domain.transaction.TransactionService;
import com.woorido.integration.django.DjangoSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;
    private final MemberMapper memberMapper;
    private final TransactionService transactionService;
    private final DjangoSyncService djangoSyncService;

    /**
     * 챌린지 생성
     */
    @Transactional
    public Challenge createChallenge(ChallengeCreateRequest request, Long leaderId) {
        // 1. 엔티티 생성
        Challenge challenge = Challenge.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .participationFee(request.getParticipationFee())
            .deposit(request.getDeposit())
            .balance(BigDecimal.ZERO)
            .leaderId(leaderId)
            .status("ACTIVE")
            .build();

        // 2. DB 저장
        challengeMapper.insertChallenge(challenge);

        // 3. 리더 멤버십 생성
        memberMapper.insertMember(
            challenge.getId(),
            leaderId,
            "LEADER"
        );

        // 4. Django 동기화 (비동기, 실패해도 메인 플로우 영향 없음)
        try {
            djangoSyncService.syncChallenge(challenge);
        } catch (Exception e) {
            log.warn("Failed to sync challenge to Django: {}", e.getMessage());
        }

        log.info("Challenge created: id={}, title={}", challenge.getId(), challenge.getTitle());

        return challenge;
    }

    /**
     * 챌린지 가입 (입회비 포함)
     */
    @Transactional
    public JoinResult joinChallenge(Long challengeId, Long userId) {
        // 1. 챌린지 존재 확인
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new ChallengeNotFoundException(challengeId);
        }

        // 2. 중복 가입 확인
        if (memberMapper.existsMember(challengeId, userId)) {
            throw new AlreadyMemberException(challengeId, userId);
        }

        // 3. 입회비 계산 (Pessimistic Lock)
        ChallengeBalanceInfo balanceInfo = challengeMapper.selectBalanceInfo(challengeId);
        BigDecimal entryFee = calculateEntryFee(
            balanceInfo.getBalance(),
            balanceInfo.getMemberCount()
        );

        // 4. 보증금 + 입회비
        BigDecimal totalAmount = challenge.getDeposit().add(entryFee);

        // 5. 거래 처리 (트랜잭션)
        transactionService.processJoin(challengeId, userId, entryFee, challenge.getDeposit());

        // 6. 멤버십 생성
        Long memberId = memberMapper.insertMember(challengeId, userId, "FOLLOWER");

        // 7. 챌린지 잔액 업데이트
        BigDecimal newBalance = balanceInfo.getBalance().add(entryFee);
        challengeMapper.updateBalance(challengeId, newBalance);

        // 8. Django 동기화
        try {
            djangoSyncService.syncMember(memberId, challengeId, userId);
        } catch (Exception e) {
            log.warn("Failed to sync member to Django: {}", e.getMessage());
        }

        log.info("User {} joined challenge {}: entryFee={}, deposit={}",
            userId, challengeId, entryFee, challenge.getDeposit());

        return JoinResult.builder()
            .memberId(memberId)
            .entryFee(entryFee)
            .deposit(challenge.getDeposit())
            .totalAmount(totalAmount)
            .build();
    }

    /**
     * 입회비 계산
     * 공식: balance / (current_members - 1)
     */
    private BigDecimal calculateEntryFee(BigDecimal balance, int currentMembers) {
        if (currentMembers <= 1) {
            return BigDecimal.ZERO;
        }

        return balance.divide(
            BigDecimal.valueOf(currentMembers - 1),
            0,
            RoundingMode.FLOOR
        );
    }

    /**
     * 챌린지 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Challenge> getChallenges(String status, int page, int size) {
        int offset = page * size;
        return challengeMapper.selectChallenges(status, offset, size);
    }

    /**
     * 챌린지 상세 조회
     */
    @Transactional(readOnly = true)
    public Challenge getChallengeDetail(Long challengeId) {
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new ChallengeNotFoundException(challengeId);
        }
        return challenge;
    }
}
```

## 4. 트랜잭션 관리

### 4.1 트랜잭션 격리 레벨

```java
// TransactionService.java

@Service
@Slf4j
public class TransactionService {

    @Autowired
    private TransactionMapper transactionMapper;

    /**
     * 챌린지 가입 거래 처리
     * Isolation: READ_COMMITTED (기본값)
     * Propagation: REQUIRED (기본값)
     */
    @Transactional
    public void processJoin(Long challengeId, Long userId, BigDecimal entryFee, BigDecimal deposit) {
        // 1. 입회비 거래 생성
        if (entryFee.compareTo(BigDecimal.ZERO) > 0) {
            Transaction entryFeeTransaction = Transaction.builder()
                .challengeId(challengeId)
                .userId(userId)
                .type("ENTRY_FEE")
                .amount(entryFee)
                .status("COMPLETED")
                .build();
            transactionMapper.insertTransaction(entryFeeTransaction);
        }

        // 2. 보증금 거래 생성
        Transaction depositTransaction = Transaction.builder()
            .challengeId(challengeId)
            .userId(userId)
            .type("DEPOSIT")
            .amount(deposit)
            .status("COMPLETED")
            .build();
        transactionMapper.insertTransaction(depositTransaction);

        log.info("Transactions created for user {} joining challenge {}",
            userId, challengeId);
    }

    /**
     * 보증금 락 해제 처리
     * 정상 탈퇴 시 호출 (미납 없는 경우)
     * 
     * ⚠️ 주의: 완주(Completion)는 1년 인증 마크이며 보증금과 무관합니다.
     * 보증금 락은 오직 "정상 탈퇴" 시에만 해제됩니다.
     */
    @Transactional
    public void releaseDepositOnLeave(Long challengeId, Long userId) {
        // 1. 원래 보증금 조회
        Transaction depositTransaction = transactionMapper.selectDepositTransaction(
            challengeId, userId
        );

        if (depositTransaction == null) {
            throw new TransactionNotFoundException("Deposit not found");
        }

        // 2. 보증금 락 해제 거래 생성
        Transaction unlockTransaction = Transaction.builder()
            .challengeId(challengeId)
            .userId(userId)
            .type("DEPOSIT_UNLOCK")  // REFUND → UNLOCK으로 변경
            .amount(depositTransaction.getAmount())
            .status("COMPLETED")
            .relatedTransactionId(depositTransaction.getId())
            .build();

        transactionMapper.insertTransaction(unlockTransaction);

        log.info("Deposit lock released for user {} leaving challenge {}",
            userId, challengeId);
    }
}
```

### 4.2 Optimistic Locking (낙관적 락)

```java
// Challenge.java (Entity)

@Data
@Builder
public class Challenge {
    private Long id;
    private String title;
    private String description;

    @Version  // JPA 스타일
    private Long version;  // 낙관적 락용

    // ... 기타 필드
}
```

```xml
<!-- ChallengeMapper.xml -->

<!-- Optimistic Lock을 사용한 업데이트 -->
<update id="updateChallengeWithVersion" parameterType="com.woorido.domain.challenge.Challenge">
    UPDATE challenges
    SET balance = #{balance},
        version = version + 1,
        updated_at = SYSDATE
    WHERE id = #{id}
      AND version = #{version}
</update>
```

```java
// Service에서 낙관적 락 사용

@Transactional
public void updateChallengeBalance(Long challengeId, BigDecimal newBalance) {
    Challenge challenge = challengeMapper.selectChallengeById(challengeId);

    challenge.setBalance(newBalance);

    int rowsAffected = challengeMapper.updateChallengeWithVersion(challenge);

    if (rowsAffected == 0) {
        // 버전 불일치 = 동시 수정 발생
        throw new OptimisticLockException("Challenge was modified by another transaction");
    }
}
```

### 4.3 Pessimistic Locking (비관적 락)

```xml
<!-- 입회비 계산 시 FOR UPDATE 사용 -->
<select id="selectBalanceInfo" resultType="ChallengeBalanceInfo">
    SELECT balance, member_count
    FROM challenges
    WHERE id = #{challengeId}
    FOR UPDATE  <!-- 비관적 락 -->
</select>
```

## 5. 예외 처리

### 5.1 비즈니스 예외 정의

```java
// BusinessException.java

package com.woorido.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final String message;

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }
}

// ChallengeNotFoundException.java

public class ChallengeNotFoundException extends BusinessException {
    public ChallengeNotFoundException(Long challengeId) {
        super("CHALLENGE_NOT_FOUND", "챌린지를 찾을 수 없습니다: " + challengeId);
    }
}

// AlreadyMemberException.java

public class AlreadyMemberException extends BusinessException {
    public AlreadyMemberException(Long challengeId, Long userId) {
        super("ALREADY_MEMBER",
            String.format("이미 챌린지에 가입했습니다: challengeId=%d, userId=%d",
                challengeId, userId));
    }
}
```

### 5.2 글로벌 예외 핸들러

```java
// GlobalExceptionHandler.java

package com.woorido.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        log.warn("Business exception: code={}, message={}",
            ex.getErrorCode(), ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .build();

        HttpStatus status = determineHttpStatus(ex.getErrorCode());

        return ResponseEntity.status(status).body(response);
    }

    /**
     * DB 제약 조건 위반 (중복 키 등)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
        DataIntegrityViolationException ex
    ) {
        log.error("Data integrity violation: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("CONSTRAINT_VIOLATION")
            .message("데이터 무결성 오류가 발생했습니다")
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * 낙관적 락 예외
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(OptimisticLockException ex) {
        log.warn("Optimistic lock exception: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("CONCURRENT_MODIFICATION")
            .message("다른 사용자가 동시에 수정했습니다. 다시 시도해주세요.")
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * 일반 예외
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        log.error("Unexpected exception", ex);

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("INTERNAL_SERVER_ERROR")
            .message("서버 오류가 발생했습니다")
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * 에러 코드에 따라 HTTP 상태 코드 결정
     */
    private HttpStatus determineHttpStatus(String errorCode) {
        return switch (errorCode) {
            case "CHALLENGE_NOT_FOUND", "VOTE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "ALREADY_MEMBER", "VOTE_ALREADY_CAST" -> HttpStatus.CONFLICT;
            case "NOT_LEADER", "NOT_AUTHORIZED" -> HttpStatus.FORBIDDEN;
            case "INVALID_INPUT" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
```

## 6. Controller Layer 패턴

### 6.1 REST API 설계

```java
// ChallengeController.java

package com.woorido.domain.challenge;

import com.woorido.common.security.CurrentUser;
import com.woorido.domain.challenge.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    /**
     * 챌린지 생성
     * POST /api/challenges
     */
    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(
        @Valid @RequestBody ChallengeCreateRequest request,
        @CurrentUser Long userId
    ) {
        log.info("Create challenge request: title={}, userId={}", request.getTitle(), userId);

        Challenge challenge = challengeService.createChallenge(request, userId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ChallengeResponse.from(challenge));
    }

    /**
     * 챌린지 가입
     * POST /api/challenges/{id}/join
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<JoinResponse> joinChallenge(
        @PathVariable("id") Long challengeId,
        @CurrentUser Long userId
    ) {
        log.info("Join challenge request: challengeId={}, userId={}", challengeId, userId);

        JoinResult result = challengeService.joinChallenge(challengeId, userId);

        return ResponseEntity.ok(JoinResponse.from(result));
    }

    /**
     * 챌린지 목록 조회
     * GET /api/challenges?status=ACTIVE&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getChallenges(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Get challenges: status={}, page={}, size={}", status, page, size);

        List<Challenge> challenges = challengeService.getChallenges(status, page, size);

        List<ChallengeResponse> response = challenges.stream()
            .map(ChallengeResponse::from)
            .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * 챌린지 상세 조회
     * GET /api/challenges/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(
        @PathVariable("id") Long challengeId
    ) {
        log.info("Get challenge detail: id={}", challengeId);

        Challenge challenge = challengeService.getChallengeDetail(challengeId);

        return ResponseEntity.ok(ChallengeDetailResponse.from(challenge));
    }
}
```

### 6.2 DTO 패턴

```java
// ChallengeCreateRequest.java

package com.woorido.domain.challenge.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 챌린지 생성 요청 DTO
 * 
 * 용어 정의:
 * - supportAmount: 월 서포트 (납입금)
 * - depositLock: 보증금 락 (미납 충당용 예치금)
 */
@Data
public class ChallengeCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotNull(message = "서포트(월 납입금)는 필수입니다")
    @DecimalMin(value = "10000", message = "서포트는 최소 10,000원입니다")
    private BigDecimal supportAmount;  // participationFee → supportAmount

    @NotNull(message = "보증금 락은 필수입니다")
    @DecimalMin(value = "10000", message = "보증금 락은 서포트와 동일(1개월치)")
    private BigDecimal depositLock;  // deposit → depositLock
}

// ChallengeResponse.java

/**
 * 챌린지 응답 DTO
 * 
 * 용어 정의:
 * - supportAmount: 월 서포트 (납입금)
 * - depositLock: 보증금 락
 * - openBalance: 오픈 잔액 (챌린지 공동 자금)
 * - followerCount: 팔로워 수 (멤버 수)
 */
@Data
@Builder
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal supportAmount;      // participationFee → supportAmount
    private BigDecimal depositLock;        // deposit → depositLock
    private BigDecimal openBalance;        // balance → openBalance
    private int followerCount;             // memberCount → followerCount
    private String status;
    private String leaderName;
    private LocalDateTime createdAt;

    public static ChallengeResponse from(Challenge challenge) {
        return ChallengeResponse.builder()
            .id(challenge.getId())
            .title(challenge.getTitle())
            .description(challenge.getDescription())
            .category(challenge.getCategory())
            .supportAmount(challenge.getSupportAmount())
            .depositLock(challenge.getDepositLock())
            .openBalance(challenge.getOpenBalance())
            .followerCount(challenge.getFollowers() != null ? challenge.getFollowers().size() : 0)
            .status(challenge.getStatus())
            .leaderName(challenge.getLeader() != null ? challenge.getLeader().getName() : null)
            .createdAt(challenge.getCreatedAt())
            .build();
    }
}
```

## 7. Django 연동

### 7.1 DjangoSyncService

```java
// DjangoSyncService.java

package com.woorido.integration.django;

import com.woorido.domain.challenge.Challenge;
import com.woorido.domain.transaction.Transaction;
import com.woorido.integration.django.dto.ChallengeSyncDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class DjangoSyncService {

    @Value("${django.api.url}")
    private String djangoApiUrl;  // http://django:8001

    private final RestTemplate restTemplate;

    public DjangoSyncService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 챌린지 데이터 Django로 전송
     */
    public void syncChallenge(Challenge challenge) {
        String url = djangoApiUrl + "/api/sync/challenge";

        ChallengeSyncDTO dto = ChallengeSyncDTO.builder()
            .challengeId(challenge.getId())
            .title(challenge.getTitle())
            .description(challenge.getDescription())
            .category(challenge.getCategory())
            .memberCount(challenge.getMembers() != null ? challenge.getMembers().size() : 0)
            .balance(challenge.getBalance())
            .participationFee(challenge.getParticipationFee())
            .deposit(challenge.getDeposit())
            .status(challenge.getStatus())
            .leaderId(challenge.getLeaderId())
            .createdAt(challenge.getCreatedAt())
            .build();

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, dto, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Synced challenge {} to Django", challenge.getId());
            } else {
                log.warn("Django sync returned non-2xx status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Failed to sync challenge {} to Django: {}",
                challenge.getId(), e.getMessage());
            // 재시도 큐에 추가 (향후 구현)
        }
    }

    /**
     * 거래 데이터 Django로 전송
     */
    public void syncTransaction(Transaction transaction) {
        String url = djangoApiUrl + "/api/sync/transaction";
        // 유사한 방식으로 구현
    }

    /**
     * 멤버 데이터 Django로 전송
     */
    public void syncMember(Long memberId, Long challengeId, Long userId) {
        String url = djangoApiUrl + "/api/sync/member";
        // 유사한 방식으로 구현
    }
}
```

### 7.2 RestTemplate 설정

```java
// RestTemplateConfig.java

package com.woorido.common.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(3))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
    }
}
```

## 8. Validation

### 8.1 Bean Validation

```java
// ChallengeCreateRequest.java

@Data
public class ChallengeCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(min = 5, max = 100, message = "제목은 5~100자여야 합니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    @NotNull(message = "카테고리는 필수입니다")
    @Pattern(regexp = "EXERCISE|STUDY|SAVING|OTHER", message = "유효하지 않은 카테고리입니다")
    private String category;

    @NotNull(message = "참가비는 필수입니다")
    @DecimalMin(value = "0", message = "참가비는 0 이상이어야 합니다")
    @DecimalMax(value = "10000000", message = "참가비는 1000만원 이하여야 합니다")
    private BigDecimal participationFee;

    @NotNull(message = "보증금은 필수입니다")
    @DecimalMin(value = "1000", message = "보증금은 최소 1000원입니다")
    @DecimalMax(value = "10000000", message = "보증금은 1000만원 이하여야 합니다")
    private BigDecimal deposit;
}
```

### 8.2 커스텀 Validator

```java
// UniqueChallengeTitleValidator.java

package com.woorido.common.validation;

import com.woorido.domain.challenge.ChallengeMapper;
import lombok.RequiredArgsConstructor;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

@RequiredArgsConstructor
public class UniqueChallengeTitleValidator
    implements ConstraintValidator<UniqueChallengeTitle, String> {

    private final ChallengeMapper challengeMapper;

    @Override
    public boolean isValid(String title, ConstraintValidatorContext context) {
        if (title == null) {
            return true;  // @NotBlank가 처리
        }

        return !challengeMapper.existsByTitle(title);
    }
}

// UniqueChallengeTitle.java (Annotation)

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueChallengeTitleValidator.class)
public @interface UniqueChallengeTitle {
    String message() default "이미 존재하는 챌린지 제목입니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

## 9. 설정 파일

### 9.1 application.yml

```yaml
spring:
  application:
    name: woorido-backend

  datasource:
    driver-class-name: oracle.jdbc.OracleDriver
    url: jdbc:oracle:thin:@localhost:1521:XE
    username: woorido
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jackson:
    time-zone: Asia/Seoul
    date-format: yyyy-MM-dd'T'HH:mm:ss

mybatis:
  mapper-locations: classpath:mybatis/mapper/**/*.xml
  type-aliases-package: com.woorido.domain
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30

# Django 연동
django:
  api:
    url: http://localhost:8001

# 로깅
logging:
  level:
    com.woorido: INFO
    com.woorido.domain: DEBUG
  file:
    name: logs/application.log
```

## 10. AI 도구 활용 팁

### 10.1 Claude Code 활용

**ERD → MyBatis Mapper XML 생성**:
```
프롬프트: "challenges 테이블의 ERD를 보고 MyBatis Mapper XML을 생성해줘.
         CRUD 작업과 pagination, FOR UPDATE 쿼리도 포함해줘."
```

**Service 로직 생성**:
```
프롬프트: "챌린지 가입 로직을 구현해줘. 입회비 계산, 트랜잭션 처리,
         예외 처리, Django 동기화까지 포함해줘."
```

### 10.2 Cursor + Copilot 활용

- **실시간 코드 완성**: Service 메서드 시그니처만 작성하면 자동 완성
- **테스트 코드 생성**: `// Test for joinChallenge` 주석만 작성
- **DTO 변환 메서드**: `ChallengeResponse.from(challenge)` 패턴 학습

### 10.3 개발 시간 단축

| 작업 | 수동 | AI 활용 | 단축률 |
|------|------|---------|--------|
| Mapper XML 작성 | 3시간 | 20분 | 89% |
| Service 로직 | 5시간 | 1.5시간 | 70% |
| DTO 클래스 | 2시간 | 15분 | 88% |
| 예외 처리 | 2시간 | 30분 | 75% |

---

**문서 버전**: 3.0
**최종 수정**: 2026-01-07
**작성자**: AI-Assisted Development Team

---

## 11. 자동 서포트 납입 시스템 ⭐ NEW

### 11.1 월간 자동 납입 스케줄러

```java
// AutoPaymentScheduler.java

package com.woorido.scheduler;

import com.woorido.domain.challenge.ChallengeMapper;
import com.woorido.domain.member.GyeMemberMapper;
import com.woorido.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoPaymentScheduler {

    private final GyeMemberMapper memberMapper;
    private final PaymentService paymentService;

    /**
     * 매월 1일 00:00에 자동 서포트 납입 실행
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void processMonthlySupport() {
        log.info("=== 월간 자동 서포트 납입 시작 ===");

        // 모든 활성 멤버 조회
        List<GyeMember> activeMembers = memberMapper.selectActiveMembers();

        for (GyeMember member : activeMembers) {
            try {
                paymentService.processAutoSupport(member);
            } catch (Exception e) {
                log.error("자동 납입 실패: memberId={}", member.getId(), e);
            }
        }

        log.info("=== 월간 자동 서포트 납입 완료: 처리 {}건 ===", activeMembers.size());
    }
}
```

### 11.2 보증금 충당 및 권한 박탈 로직

```java
// PaymentService.java

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final AccountMapper accountMapper;
    private final TransactionMapper transactionMapper;
    private final GyeMemberMapper memberMapper;
    private final NotificationService notificationService;

    /**
     * 자동 서포트 납입 처리
     * 1. 가용 크레딧으로 납입 시도
     * 2. 부족 시 보증금에서 자동 납입
     * 3. 보증금 사용 시 즉시 권한 박탈
     */
    @Transactional
    public void processAutoSupport(GyeMember member) {
        Account account = accountMapper.selectByUserIdForUpdate(member.getUserId());
        Challenge challenge = challengeMapper.selectById(member.getChallengeId());
        
        BigDecimal supportAmount = challenge.getSupportAmount();

        // 1. 가용 크레딧 확인
        if (account.getCreditBalance().compareTo(supportAmount) >= 0) {
            // 정상 납입
            deductCredit(account, supportAmount, member.getChallengeId());
            addToOpen(challenge, supportAmount);
            log.info("정상 납입 완료: userId={}, amount={}", member.getUserId(), supportAmount);
            return;
        }

        // 2. 보증금에서 자동 납입 (안심결제)
        if (member.getDepositLockAmount().compareTo(supportAmount) >= 0) {
            useDepositForSupport(member, supportAmount);
            addToOpen(challenge, supportAmount);
            
            // ⚡ 즉시 권한 박탈
            revokePrivileges(member);
            
            // ⚡ 즉시 알림 발송
            notificationService.sendDepositUsedAlert(member.getUserId());
            
            log.warn("보증금 사용 납입: userId={}, 권한 박탈됨", member.getUserId());
            return;
        }

        // 3. 보증금도 부족 - 이미 권한 박탈 상태
        log.warn("납입 불가: userId={}, 보증금 부족", member.getUserId());
    }

    /**
     * 권한 박탈: 정기 모임 참석 투표 불가
     */
    private void revokePrivileges(GyeMember member) {
        member.setPrivilegeStatus("REVOKED");
        member.setPrivilegeRevokedAt(LocalDateTime.now());
        memberMapper.updatePrivilegeStatus(member);
    }

    /**
     * 자동 탈퇴 체크 (2개월 경과 시)
     */
    @Scheduled(cron = "0 0 6 * * *")  // 매일 06:00
    public void checkAutoLeave() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        
        List<GyeMember> revokedMembers = memberMapper.selectRevokedMembersBefore(threshold);
        
        for (GyeMember member : revokedMembers) {
            processAutoLeave(member);
        }
    }

    private void processAutoLeave(GyeMember member) {
        member.setLeftAt(LocalDateTime.now());
        member.setLeaveReason("AUTO_LEAVE_DEPOSIT_NOT_RECHARGED");
        memberMapper.update(member);
        
        // 리더에게만 알림
        notificationService.sendAutoLeaveNotificationToLeader(
            member.getChallengeId(), 
            member.getUserId()
        );
        
        log.info("자동 탈퇴 처리: userId={}, challengeId={}", 
            member.getUserId(), member.getChallengeId());
    }
}
```

### 11.3 충전 시 보증금 우선 복구

```java
// AccountService.java

@Service
@RequiredArgsConstructor
public class AccountService {

    /**
     * 크레딧 충전 시 보증금 락 우선 복구
     */
    @Transactional
    public ChargeResult chargeCredit(Long userId, BigDecimal amount) {
        Account account = accountMapper.selectByUserIdForUpdate(userId);
        
        // 1. 보증금 미충족 챌린지 조회
        List<GyeMember> deficitMembers = memberMapper.selectDepositDeficitMembers(userId);
        
        BigDecimal remaining = amount;
        
        // 2. 보증금 우선 복구
        for (GyeMember member : deficitMembers) {
            BigDecimal deficit = member.getRequiredDeposit()
                .subtract(member.getDepositLockAmount());
            
            if (remaining.compareTo(deficit) >= 0) {
                // 전액 복구
                restoreDeposit(member, deficit);
                restorePrivileges(member);  // 권한 복구
                remaining = remaining.subtract(deficit);
            } else {
                // 부분 복구 (권한은 아직 복구 안됨)
                restoreDeposit(member, remaining);
                remaining = BigDecimal.ZERO;
                break;
            }
        }
        
        // 3. 나머지는 가용 크레딧으로
        account.setCreditBalance(account.getCreditBalance().add(remaining));
        accountMapper.update(account);
        
        return ChargeResult.builder()
            .depositRestored(amount.subtract(remaining))
            .creditAdded(remaining)
            .build();
    }

    private void restorePrivileges(GyeMember member) {
        member.setPrivilegeStatus("ACTIVE");
        member.setPrivilegeRevokedAt(null);
        memberMapper.updatePrivilegeStatus(member);
    }
}
```

---

## 12. 수수료 계산 시스템 ⭐ NEW

### 12.1 수수료율 정책

| 구분 | 월 서포트 | 수수료율 |
|------|----------|---------|
| 소액 | 10,000원 미만 | 1% |
| 일반 | 10,000 ~ 200,000원 | 3% |
| 고액 | 200,000원 초과 | 1.5% |

### 12.2 수수료 계산 서비스

```java
// FeeCalculationService.java

@Service
public class FeeCalculationService {

    private static final BigDecimal SMALL_THRESHOLD = new BigDecimal("10000");
    private static final BigDecimal LARGE_THRESHOLD = new BigDecimal("200000");
    
    private static final BigDecimal SMALL_RATE = new BigDecimal("0.01");   // 1%
    private static final BigDecimal NORMAL_RATE = new BigDecimal("0.03");  // 3%
    private static final BigDecimal LARGE_RATE = new BigDecimal("0.015");  // 1.5%

    public BigDecimal calculateFee(BigDecimal supportAmount) {
        BigDecimal rate;
        
        if (supportAmount.compareTo(SMALL_THRESHOLD) < 0) {
            rate = SMALL_RATE;
        } else if (supportAmount.compareTo(LARGE_THRESHOLD) <= 0) {
            rate = NORMAL_RATE;
        } else {
            rate = LARGE_RATE;
        }
        
        return supportAmount.multiply(rate)
            .setScale(0, RoundingMode.DOWN);  // 원 미만 절사
    }
}
```

---

## 13. 정기 모임 관리 API ⭐ NEW

### 13.1 Meeting 엔티티

```java
@Data
@Builder
public class Meeting {
    private Long id;
    private Long challengeId;
    private Long voteId;           // 연결된 MEETING_ATTENDANCE 투표
    private String title;
    private String description;
    private LocalDateTime meetingDate;
    private String location;
    private int expectedAttendees;
    private String status;         // PLANNED, CONFIRMED, COMPLETED, CANCELLED
    private Long createdBy;
    private LocalDateTime createdAt;
}
```

### 13.2 Meeting Controller

```java
@RestController
@RequestMapping("/api/challenges/{challengeId}/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    /**
     * 정기 모임 참석 투표 생성 (리더 전용)
     * POST /api/challenges/{id}/meetings/vote
     */
    @PostMapping("/vote")
    public ResponseEntity<VoteResponse> createMeetingVote(
        @PathVariable Long challengeId,
        @RequestBody @Valid CreateMeetingVoteRequest request,
        @CurrentUser Long userId
    ) {
        return ResponseEntity.ok(
            meetingService.createMeetingAttendanceVote(challengeId, request, userId)
        );
    }

    /**
     * 정기 모임 목록 조회
     * GET /api/challenges/{id}/meetings
     */
    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getMeetings(
        @PathVariable Long challengeId
    ) {
        return ResponseEntity.ok(meetingService.getMeetings(challengeId));
    }

    /**
     * 참석 등록
     * POST /api/meetings/{id}/attend
     */
    @PostMapping("/{meetingId}/attend")
    public ResponseEntity<Void> registerAttendance(
        @PathVariable Long meetingId,
        @CurrentUser Long userId
    ) {
        meetingService.registerAttendance(meetingId, userId);
        return ResponseEntity.ok().build();
    }
}
```

### 13.3 권한 체크 인터셉터

```java
// MeetingPrivilegeInterceptor.java

@Component
@RequiredArgsConstructor
public class MeetingPrivilegeInterceptor implements HandlerInterceptor {

    private final GyeMemberMapper memberMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, ...) {
        // MEETING_ATTENDANCE 투표 참여 시 권한 체크
        Long userId = getCurrentUserId(request);
        Long challengeId = extractChallengeId(request);
        
        GyeMember member = memberMapper.selectByUserAndChallenge(userId, challengeId);
        
        if (member == null) {
            throw new UnauthorizedException("챌린지 멤버가 아닙니다.");
        }
        
        if ("REVOKED".equals(member.getPrivilegeStatus())) {
            throw new PrivilegeRevokedException(
                "보증금 충전이 필요합니다. 정기 모임에 참석할 수 없습니다."
            );
        }
        
        return true;
    }
}
```

---

## 14. Django 연동 상세 ⭐ NEW

### 14.1 분석 API 호출

```java
// DjangoAnalyticsService.java

@Service
@RequiredArgsConstructor
public class DjangoAnalyticsService {

    private final WebClient djangoWebClient;

    /**
     * 월별 지출 통계 조회
     */
    public MonthlyStatsResponse getMonthlyStats(Long challengeId, List<Transaction> transactions) {
        return djangoWebClient.post()
            .uri("/api/analyze/monthly-stats")
            .bodyValue(AnalyzeRequest.builder()
                .challengeId(challengeId)
                .transactions(transactions)
                .build())
            .retrieve()
            .bodyToMono(MonthlyStatsResponse.class)
            .block();
    }

    /**
     * 카테고리별 비율 분석
     */
    public CategoryRatioResponse getCategoryRatio(Long challengeId, List<Transaction> transactions) {
        return djangoWebClient.post()
            .uri("/api/analyze/category-ratio")
            .bodyValue(AnalyzeRequest.builder()
                .challengeId(challengeId)
                .transactions(transactions)
                .build())
            .retrieve()
            .bodyToMono(CategoryRatioResponse.class)
            .block();
    }
}
```

### 14.2 검색 API 호출 (Elasticsearch)

```java
// DjangoSearchService.java

@Service
@RequiredArgsConstructor
public class DjangoSearchService {

    private final WebClient djangoWebClient;

    /**
     * 챌린지 검색 (한글 형태소 분석)
     */
    public SearchResponse searchChallenges(String query, int page, int size) {
        return djangoWebClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/api/search/challenges")
                .queryParam("q", query)
                .queryParam("page", page)
                .queryParam("size", size)
                .build())
            .retrieve()
            .bodyToMono(SearchResponse.class)
            .block();
    }

    /**
     * 개인화 추천 챌린지
     */
    public List<ChallengeRecommendation> getRecommendations(Long userId) {
        return djangoWebClient.get()
            .uri("/api/recommendations/challenges?userId=" + userId)
            .retrieve()
            .bodyToFlux(ChallengeRecommendation.class)
            .collectList()
            .block();
    }
}
```

---

## 15. 디자인 패턴 적용 가이드 ⭐ NEW

> WOORIDO Spring Boot 백엔드에는 **5가지 패턴**을 권장합니다.
> - **Layered Architecture + DTO 패턴**: 기본 구조 (이미 적용됨)
> - **Strategy 패턴**: 수수료 계산, 투표 승인
> - **Visitor 패턴**: 결제 시스템, 알림 시스템
> - **Factory 패턴**: 객체 생성 중앙화

### 15.1 Strategy 패턴 - 수수료 계산 리팩토링

**기존 코드 (if-else 분기):**
```java
// 문제: 수수료 정책 변경 시 FeeCalculationService 수정 필요
public BigDecimal calculateFee(BigDecimal amount) {
    if (amount.compareTo(SMALL_THRESHOLD) < 0) {
        return amount.multiply(new BigDecimal("0.01"));
    } else if (amount.compareTo(LARGE_THRESHOLD) <= 0) {
        return amount.multiply(new BigDecimal("0.03"));
    } else {
        return amount.multiply(new BigDecimal("0.015"));
    }
}
```

**Strategy 패턴 적용:**
```java
// 1. Strategy 인터페이스
public interface FeeStrategy {
    boolean supports(BigDecimal amount);
    BigDecimal calculate(BigDecimal amount);
}

// 2. 구체 Strategy 구현
@Component
@Order(1)
public class SmallAmountFeeStrategy implements FeeStrategy {
    private static final BigDecimal THRESHOLD = new BigDecimal("10000");
    private static final BigDecimal RATE = new BigDecimal("0.01");  // 1%
    
    @Override
    public boolean supports(BigDecimal amount) {
        return amount.compareTo(THRESHOLD) < 0;
    }
    
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return amount.multiply(RATE).setScale(0, RoundingMode.DOWN);
    }
}

@Component
@Order(2)
public class NormalAmountFeeStrategy implements FeeStrategy {
    private static final BigDecimal MIN = new BigDecimal("10000");
    private static final BigDecimal MAX = new BigDecimal("200000");
    private static final BigDecimal RATE = new BigDecimal("0.03");  // 3%
    
    @Override
    public boolean supports(BigDecimal amount) {
        return amount.compareTo(MIN) >= 0 && amount.compareTo(MAX) <= 0;
    }
    
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return amount.multiply(RATE).setScale(0, RoundingMode.DOWN);
    }
}

@Component
@Order(3)
public class LargeAmountFeeStrategy implements FeeStrategy {
    private static final BigDecimal THRESHOLD = new BigDecimal("200000");
    private static final BigDecimal RATE = new BigDecimal("0.015");  // 1.5%
    
    @Override
    public boolean supports(BigDecimal amount) {
        return amount.compareTo(THRESHOLD) > 0;
    }
    
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return amount.multiply(RATE).setScale(0, RoundingMode.DOWN);
    }
}

// 3. Context (Service)
@Service
@RequiredArgsConstructor
public class FeeCalculationService {
    private final List<FeeStrategy> strategies;  // Spring이 자동 주입
    
    public BigDecimal calculateFee(BigDecimal amount) {
        return strategies.stream()
            .filter(s -> s.supports(amount))
            .findFirst()
            .map(s -> s.calculate(amount))
            .orElseThrow(() -> new IllegalStateException("No strategy found"));
    }
}
```

**효과:**
- 새 수수료 정책 추가 시 Strategy 클래스만 추가
- FeeCalculationService 수정 불필요 (OCP 준수)

---

### 15.2 Visitor 패턴 - 결제 시스템

**적용 대상:** 결제 수단(Toss, 카카오페이, 계좌이체) × 연산(결제, 환불, 취소)

```java
// 1. Element 인터페이스 (결제 수단)
public interface PaymentElement {
    void accept(PaymentVisitor visitor);
}

// 2. 구체 Element (결제 수단별)
@Component
public class TossPayElement implements PaymentElement {
    private final TossPayClient client;
    
    @Override
    public void accept(PaymentVisitor visitor) {
        visitor.visit(this);
    }
    
    public PaymentResult process(PaymentRequest request) {
        return client.requestPayment(request);
    }
    
    public RefundResult refund(RefundRequest request) {
        return client.requestRefund(request);
    }
}

@Component
public class KakaoPayElement implements PaymentElement {
    private final KakaoPayClient client;
    
    @Override
    public void accept(PaymentVisitor visitor) {
        visitor.visit(this);
    }
    
    // 카카오페이 전용 메서드들...
}

// 3. Visitor 인터페이스
public interface PaymentVisitor {
    void visit(TossPayElement element);
    void visit(KakaoPayElement element);
    void visit(BankTransferElement element);
}

// 4. 구체 Visitor (연산별)
@Component
public class ChargeVisitor implements PaymentVisitor {
    @Override
    public void visit(TossPayElement element) {
        // 토스페이 충전 로직
        element.process(buildRequest());
    }
    
    @Override
    public void visit(KakaoPayElement element) {
        // 카카오페이 충전 로직
    }
    
    @Override
    public void visit(BankTransferElement element) {
        // 계좌이체 충전 로직
    }
}

@Component
public class RefundVisitor implements PaymentVisitor {
    @Override
    public void visit(TossPayElement element) {
        element.refund(buildRefundRequest());
    }
    // 다른 결제수단 환불 로직...
}

// 5. Factory로 생성 중앙화
@Component
@RequiredArgsConstructor
public class PaymentFactory {
    private final TossPayElement tossPay;
    private final KakaoPayElement kakaoPay;
    private final BankTransferElement bankTransfer;
    
    public PaymentElement create(String paymentMethod) {
        return switch (paymentMethod) {
            case "TOSS" -> tossPay;
            case "KAKAO" -> kakaoPay;
            case "BANK" -> bankTransfer;
            default -> throw new IllegalArgumentException("Unknown: " + paymentMethod);
        };
    }
}

// 6. 사용 예시
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentFactory paymentFactory;
    private final ChargeVisitor chargeVisitor;
    private final RefundVisitor refundVisitor;
    
    public void charge(String method, BigDecimal amount) {
        PaymentElement element = paymentFactory.create(method);
        element.accept(chargeVisitor);
    }
    
    public void refund(String method, String transactionId) {
        PaymentElement element = paymentFactory.create(method);
        element.accept(refundVisitor);
    }
}
```

**확장 효과:**
| 확장 시나리오 | 기존 방식 | Visitor 패턴 |
|-------------|----------|-------------|
| 새 결제수단 추가 | PaymentService 수정 | 새 Element 추가만 |
| 새 연산 추가 (취소) | 모든 결제수단 코드 수정 | 새 Visitor 추가만 |

---

### 15.3 Factory 패턴 - VoteStrategy 생성

```java
// VoteStrategyFactory.java

@Component
@RequiredArgsConstructor
public class VoteStrategyFactory {
    private final ExpenseVoteStrategy expenseStrategy;
    private final MeetingAttendanceVoteStrategy meetingStrategy;
    private final KickVoteStrategy kickStrategy;
    private final RuleChangeVoteStrategy ruleChangeStrategy;
    
    public VoteApprovalStrategy create(VoteType type) {
        return switch (type) {
            case EXPENSE -> expenseStrategy;
            case MEETING_ATTENDANCE -> meetingStrategy;
            case KICK -> kickStrategy;
            case RULE_CHANGE -> ruleChangeStrategy;
        };
    }
}

// VoteApprovalService 리팩토링
@Service
@RequiredArgsConstructor
public class VoteApprovalService {
    private final VoteStrategyFactory strategyFactory;
    
    public void approveVote(Vote vote) {
        VoteApprovalStrategy strategy = strategyFactory.create(vote.getType());
        strategy.execute(vote);
    }
}
```

---

### 15.4 DTO 패턴 - Java 17 Record 활용

```java
// 기존 (Lombok @Data)
@Data
public class ChallengeCreateRequest {
    private String title;
    private String description;
    private BigDecimal supportAmount;
}

// Java 17 Record 적용
public record ChallengeCreateRequest(
    @NotBlank String title,
    @Size(max = 1000) String description,
    @DecimalMin("10000") BigDecimal supportAmount,
    @DecimalMin("10000") BigDecimal depositLock
) {
    // 추가 검증 로직
    public ChallengeCreateRequest {
        if (depositLock.compareTo(supportAmount) != 0) {
            throw new IllegalArgumentException("보증금은 서포트와 동일해야 합니다");
        }
    }
}

// Response DTO도 Record로
public record ChallengeResponse(
    Long id,
    String title,
    BigDecimal supportAmount,
    BigDecimal openBalance,
    int followerCount,
    boolean isVerified
) {
    public static ChallengeResponse from(Challenge c) {
        return new ChallengeResponse(
            c.getId(), c.getTitle(), c.getSupportAmount(),
            c.getOpenBalance(), c.getFollowers().size(), c.isVerified()
        );
    }
}
```

**Record 장점:**
- 코드량 **70% 감소** (getter/setter/equals/hashCode 자동)
- **불변성 보장** (값 수정 불가)
- Jackson 직렬화 **완벽 호환**

---

### 15.5 패턴 적용 효과 요약

| 패턴 | 적용 대상 | 기대 효과 |
|------|----------|----------|
| **Strategy** | 수수료 계산, 투표 승인 | 새 정책 추가 시 기존 코드 수정 없음 |
| **Visitor** | 결제/알림 시스템 | 새 결제수단/알림채널 추가 용이 |
| **Factory** | Strategy/Element 생성 | 객체 생성 로직 중앙화 |
| **Record** | 모든 DTO | 코드량 70% 감소, 불변성 보장 |
