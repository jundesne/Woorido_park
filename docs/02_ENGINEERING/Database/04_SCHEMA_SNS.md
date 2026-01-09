# WOORIDO ERD - SNS 도메인
**posts, post_images, post_likes, comments**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)

---

## 1. 게시글 (posts)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  gye_id UUID REFERENCES gye(id) ON DELETE CASCADE,  -- NULL이면 공개 피드
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 내용
  content VARCHAR(4000) NOT NULL,

  -- 비정규화 카운터 (Atomic Operations)
  like_count NUMBER DEFAULT 0 NOT NULL,
  comment_count NUMBER DEFAULT 0 NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_like_count CHECK (like_count >= 0),
  CONSTRAINT chk_comment_count CHECK (comment_count >= 0)
);

CREATE INDEX idx_posts_gye_created ON posts(gye_id, created_at DESC);
CREATE INDEX idx_posts_creator ON posts(created_by, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);  -- 전체 피드용
```

**비정규화 카운터 관리:**
- `like_count`, `comment_count`는 Atomic Operations로 증감
- 매일 새벽 3시 Scheduled Job으로 정합성 검증
- 상세 구현: [07_IMPLEMENTATION_PATTERNS.md](./07_IMPLEMENTATION_PATTERNS.md) 참조

---

## 2. 게시글 이미지 (post_images)

```sql
CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order NUMBER NOT NULL,

  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  CONSTRAINT uk_post_image_order UNIQUE (post_id, display_order)
);

CREATE INDEX idx_post_images_post ON post_images(post_id, display_order);
```

---

## 3. 좋아요 (post_likes)

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  CONSTRAINT uk_post_user_like UNIQUE (post_id, user_id)
);

CREATE INDEX idx_likes_post ON post_likes(post_id, created_at DESC);
CREATE INDEX idx_likes_user ON post_likes(user_id, created_at DESC);
```

---

## 4. 댓글 (comments)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 내용
  content VARCHAR(1000) NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_creator ON comments(created_by, created_at DESC);
```

---

**최종 수정**: 2026-01-09
