# 🔴 보완 필요 자료 (MVP 개발용)

> **작성일**: 2025-12-30
> **목적**: 프론트엔드 MVP 개발 시 필요한 추가 자료 정리

---

## 1. API Response 스키마 (TypeScript)

### 1.1 인증 API

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
  };
}

// POST /api/auth/signup
interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

interface SignupResponse {
  user: User;
}
```

### 1.2 어카운트 API

```typescript
// GET /api/users/me/account
interface AccountResponse {
  balance: number;          // 가용 잔액
  lockedBalance: number;    // 락 잔액
  total: number;            // 총 잔액
  locks: Array<{
    groupId: string;
    groupName: string;
    amount: number;
    lockedAt: string;
  }>;
}

// POST /api/users/me/account/charge
interface ChargeRequest {
  amount: number;           // 충전 금액
  paymentMethod: 'tosspay'; // MVP: 토스페이만
  returnUrl: string;        // 충전 후 복귀 URL
}

interface ChargeResponse {
  transactionId: string;
  newBalance: number;
  chargedAt: string;
}
```

### 1.3 모임 API

```typescript
// GET /api/groups/:id
interface GroupDetailResponse {
  id: string;
  name: string;
  description: string;
  category: 'STUDY' | 'HOBBY' | 'SPORTS' | 'CULTURE' | 'ETC';
  monthlyFee: number;       // 월 납입금
  depositAmount: number;    // 보증금 (= monthlyFee)
  maxMembers: number;
  currentMembers: number;
  balance: number;          // 계모임 금고 잔액
  cpId: string;
  cpNickname: string;
  imageUrl?: string;
  status: 'recruiting' | 'active' | 'completed';
  createdAt: string;
}

// POST /api/groups/:id/join
interface JoinGroupRequest {
  userId: string;
}

interface JoinGroupResponse {
  membershipId: string;
  lockedAmount: number;     // 락된 보증금
  joinedAt: string;
}
```

### 1.4 피드 API

```typescript
// GET /api/groups/:groupId/posts
interface PostListRequest {
  page: number;
  limit: number;            // 20개 고정
}

interface PostListResponse {
  posts: Array<{
    id: string;
    authorId: string;
    authorNickname: string;
    authorAvatar?: string;
    content: string;
    images: Array<{
      url: string;
      order: number;
    }>;
    isAnnouncement: boolean; // 공지 여부
    likeCount: number;
    commentCount: number;
    isLikedByMe: boolean;
    createdAt: string;
  }>;
  totalPages: number;
  totalCount: number;
}

// POST /api/groups/:groupId/posts
interface CreatePostRequest {
  content: string;
  imageUrls?: string[];
  isAnnouncement?: boolean; // CP만 가능
}

interface CreatePostResponse {
  postId: string;
  createdAt: string;
}

// POST /api/posts/:postId/like
interface LikeResponse {
  liked: boolean;
  count: number;
}
```

### 1.5 장부 API

```typescript
// GET /api/groups/:groupId/ledger/summary
interface LedgerSummaryResponse {
  totalBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
}

// GET /api/groups/:groupId/ledger
interface LedgerEntryListResponse {
  entries: Array<{
    id: string;
    type: 'income' | 'expense' | 'deposit_in' | 'deposit_out';
    amount: number;
    balanceAfter: number;
    category?: string;
    memo?: string;
    userId: string;
    userNickname: string;
    voteId?: string;         // 투표 연결 (지출인 경우)
    createdAt: string;
  }>;
  totalPages: number;
}
```

### 1.6 투표 API

```typescript
// GET /api/groups/:groupId/votes
interface VoteListRequest {
  status?: 'open' | 'approved' | 'rejected' | 'expired';
}

interface VoteListResponse {
  votes: Array<{
    id: string;
    type: 'expense' | 'kick' | 'rule_change';
    title: string;
    description?: string;
    amount?: number;         // expense인 경우
    requiredRatio: number;   // 0.5 (50%) 또는 0.67 (67%)
    yesCount: number;
    noCount: number;
    abstainCount: number;
    myVote?: 'approve' | 'reject' | 'abstain';
    status: 'open' | 'approved' | 'rejected' | 'expired';
    expiresAt: string;
    createdAt: string;
  }>;
}

// POST /api/votes/:voteId/cast
interface CastVoteRequest {
  vote: 'approve' | 'reject' | 'abstain';
}

interface CastVoteResponse {
  yesCount: number;
  noCount: number;
  abstainCount: number;
  myVote: 'approve' | 'reject' | 'abstain';
}
```

### 1.7 Django 분석 API

```typescript
// POST /api/analyze/monthly-stats
interface MonthlyStatsRequest {
  transactions: Array<{
    date: string;
    amount: number;
    category: string;
  }>;
}

interface MonthlyStatsResponse {
  total: number;
  avgPerDay: number;
  categories: Record<string, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;    // 전월 대비 증감률
}

// POST /api/analyze/category-ratio
interface CategoryRatioRequest {
  transactions: Array<{
    category: string;
    amount: number;
  }>;
}

interface CategoryRatioResponse {
  ratios: Array<{
    category: string;
    amount: number;
    percent: number;
  }>;
}
```

---

## 2. 폼 유효성 검사 (Zod)

```typescript
import { z } from 'zod';

// 로그인
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상입니다'),
});

// 회원가입
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상입니다')
    .regex(/[A-Z]/, '대문자를 1개 이상 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 1개 이상 포함해야 합니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상입니다')
    .max(10, '닉네임은 최대 10자입니다'),
});

// 충전
export const chargeSchema = z.object({
  amount: z
    .number()
    .min(10000, '최소 충전 금액은 10,000원입니다')
    .max(1000000, '최대 충전 금액은 1,000,000원입니다')
    .multipleOf(1000, '1,000원 단위로 입력해주세요'),
});

// 모임 생성
export const createGroupSchema = z.object({
  name: z.string().min(2, '모임 이름은 최소 2자 이상입니다').max(20, '모임 이름은 최대 20자입니다'),
  description: z.string().max(500, '모임 소개는 최대 500자입니다'),
  category: z.enum(['STUDY', 'HOBBY', 'SPORTS', 'CULTURE', 'ETC']),
  monthlyFee: z.number().min(10000, '월 납입금은 최소 10,000원입니다'),
  maxMembers: z.number().min(2, '최소 2명 이상').max(50, '최대 50명'),
});

// 글 작성
export const createPostSchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요').max(2000, '최대 2,000자입니다'),
  imageUrls: z.array(z.string().url()).max(10, '이미지는 최대 10장까지 업로드할 수 있습니다').optional(),
});

// 지출 요청
export const createVoteSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '최대 200자입니다'),
  description: z.string().max(1000, '최대 1,000자입니다').optional(),
  amount: z.number().min(1, '금액을 입력해주세요'),
});
```

---

## 3. 에러 메시지 문구

```typescript
export const ERROR_MESSAGES = {
  // 인증
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다',
  INVALID_TOKEN: '로그인이 만료되었습니다. 다시 로그인해주세요',

  // 어카운트
  INSUFFICIENT_BALANCE: '잔액이 부족합니다. 충전 후 다시 시도해주세요',
  CHARGE_FAILED: '충전에 실패했습니다. 잠시 후 다시 시도해주세요',
  PAYMENT_CANCELED: '결제가 취소되었습니다',

  // 모임
  GROUP_FULL: '모임 정원이 가득 찼습니다',
  ALREADY_JOINED: '이미 가입한 모임입니다',
  NOT_A_MEMBER: '모임 멤버만 접근할 수 있습니다',

  // 투표
  ALREADY_VOTED: '이미 투표에 참여했습니다',
  VOTE_EXPIRED: '투표가 마감되었습니다',
  INSUFFICIENT_PERMISSION: 'CP만 수행할 수 있는 작업입니다',

  // 일반
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
} as const;
```

---

## 4. 디자인 토큰 (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',  // Primary
          600: '#0284c7',
          700: '#0369a1',
        },
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        // Neutrals
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          700: '#374151',
          900: '#111827',
        },
      },
      fontSize: {
        // Typography Scale
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        // 8px Grid System
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },
      borderRadius: {
        // Rounded System
        'card': '1rem',   // 16px
        'button': '0.5rem', // 8px
      },
      boxShadow: {
        // Elevation
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      animation: {
        // Micro-interactions
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 5. 반응형 브레이크포인트

```typescript
// Mobile-First 접근
export const BREAKPOINTS = {
  sm: 640,    // Small devices (phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices
} as const;

// Tailwind 기본 브레이크포인트 사용
// sm:  @media (min-width: 640px)
// md:  @media (min-width: 768px)
// lg:  @media (min-width: 1024px)
// xl:  @media (min-width: 1280px)

// 사용 예시
<div className="
  w-full           /* Mobile: 100% */
  sm:w-11/12       /* Tablet: 91.67% */
  lg:w-3/4         /* Desktop: 75% */
  xl:max-w-6xl     /* XL: 1152px max */
">
```

---

## 6. 상태 관리 구조

```typescript
// Zustand: UI 상태
import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  currentModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  currentModal: null,
  openModal: (id) => set({ currentModal: id }),
  closeModal: () => set({ currentModal: null }),
}));

// TanStack Query: 서버 상태
import { useQuery, useMutation } from '@tanstack/react-query';

export const useMyGroups = () => {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: fetchMyGroups,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useJoinGroup = () => {
  return useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
};
```

---

## 7. MSW 핸들러 (IA_Event_Mapping_v2.csv 기반)

```typescript
// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as LoginRequest;

    // Mock 검증
    if (email === 'test@woorido.com' && password === 'Test1234!') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@woorido.com',
          nickname: '김철수',
          profileImage: null,
          createdAt: '2025-01-01T00:00:00Z',
        },
      });
    }

    return HttpResponse.json(
      { message: ERROR_MESSAGES.LOGIN_FAILED },
      { status: 401 }
    );
  }),

  // POST /api/auth/signup
  http.post('/api/auth/signup', async ({ request }) => {
    const data = await request.json() as SignupRequest;

    // 이메일 중복 체크 (Mock)
    if (data.email === 'existing@woorido.com') {
      return HttpResponse.json(
        { message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      user: {
        id: '2',
        email: data.email,
        nickname: data.nickname,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];

// src/mocks/handlers/groups.ts
export const groupHandlers = [
  // GET /api/groups/:id
  http.get('/api/groups/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      id,
      name: '책벌레들',
      description: '한 달에 한 권씩 독서하는 모임입니다',
      category: 'STUDY',
      monthlyFee: 100000,
      depositAmount: 100000,
      maxMembers: 10,
      currentMembers: 8,
      balance: 800000,
      cpId: '1',
      cpNickname: '김철수',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
    });
  }),
];

// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { groupHandlers } from './handlers/groups';

export const worker = setupWorker(...authHandlers, ...groupHandlers);
```

---

**이 문서는 개발하면서 지속적으로 업데이트됩니다.**
