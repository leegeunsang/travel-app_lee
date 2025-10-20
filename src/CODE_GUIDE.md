# 여행 앱 - 핵심 코드 가이드

## 📁 프로젝트 구조 개요

```
여행 앱
├── 프론트엔드 (React + TypeScript)
├── 백엔드 (Supabase Edge Functions + Hono)
├── 외부 API 연동 (Tour API, OpenWeather, OpenAI)
└── PWA 설정
```

---

## 🎯 1. 메인 엔트리 포인트

### `/App.tsx`
**역할**: 전체 앱의 루트 컴포넌트, 페이지 라우팅 관리

**주요 기능**:
- 페이지 간 네비게이션 상태 관리
- 사용자 인증 상태 관리
- 여행 성향, 선택된 장소 등 전역 상태 관리
- 하단 네비게이션 바 표시

**핵심 코드 구조**:
```tsx
export default function App() {
  const [currentPage, setCurrentPage] = useState('survey');
  const [travelStyle, setTravelStyle] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  
  // 페이지별 렌더링
  switch(currentPage) {
    case 'survey': return <SurveyPage />;
    case 'recommendation': return <RecommendationPage />;
    case 'smart-route': return <SmartRoutePage />;
    // ...
  }
}
```

### `/main.tsx`
**역할**: React 앱 초기화 및 PWA 등록

**핵심 기능**:
- React DOM 렌더링
- Service Worker 등록 (PWA)
- Toaster (알림) 초기화

---

## 🖥️ 2. 핵심 페이지 컴포넌트

### `/components/SurveyPage.tsx`
**역할**: 여행 성향 분석 설문 페이지

**주요 기능**:
- Decision Tree 기반 질문 흐름
- 사용자 답변에 따라 여행 성향 분류 (힐링/관광/액티비티)
- 결과를 백엔드에 저장

**중요 상태**:
```tsx
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState<string[]>([]);
const [result, setResult] = useState('');
```

**백엔드 연동**:
```tsx
// 설문 결과 저장
await fetch(`${apiUrl}/save-preference`, {
  method: 'POST',
  body: JSON.stringify({ userId, travelStyle, answers })
});
```

---

### `/components/RecommendationPage.tsx`
**역할**: GPT 기반 맞춤형 여행 추천 페이지

**주요 기능**:
- 여행 성향 + 위치 + 날씨 기반 GPT 추천
- OpenAI API 연동

**백엔드 연동**:
```tsx
// GPT 추천 요청
const response = await fetch(`${apiUrl}/recommend`, {
  method: 'POST',
  body: JSON.stringify({ travelStyle, location, weather })
});
```

---

### `/components/SmartRoutePage.tsx`
**역할**: 스마트 장소 선별 및 경로 생성 페이지

**주요 기능**:
- 리뷰 수/평점 기반 장소 필터링
- 인기 장소 vs 숨은 명소 구분
- 드래그 앤 드롭으로 순서 조정
- 카카오맵 경로 안내 연동

**핵심 로직**:
```tsx
// 장소 선별 기준
- 인기 장소: 리뷰 수 상위 30% + 평점 4.0 이상
- 숨은 명소: 리뷰 수 하위 30% + 평점 4.5 이상
```

**백엔드 연동**:
```tsx
// 스마트 장소 선별
const response = await fetch(`${apiUrl}/select-places`, {
  method: 'POST',
  body: JSON.stringify({ 
    location, 
    travelStyle, 
    categories,
    offset // 무한 스크롤
  })
});
```

---

### `/components/RouteMapPage.tsx`
**역할**: 생성된 경로를 지도에 표시하고 네비게이션 제공

**주요 기능**:
- 카카오맵 SDK로 지도 표시
- 경유지별 거리/시간 계산
- 교통수단별 경로 안내

---

### `/components/AttractionsExplore.tsx`
**역할**: 한국관광공사 공공데이터 기반 관광지 탐색

**주요 기능**:
- 지역별 관광지 조회
- 키워드 검색
- 상세 정보 및 이미지 조회
- 축제/이벤트 정보

**백엔드 연동**:
```tsx
// 지역별 관광지 조회
const response = await fetch(
  `${apiUrl}/attractions/${areaCode}?page=${page}`
);

// 키워드 검색
const response = await fetch(
  `${apiUrl}/attractions/search/${keyword}`
);
```

---

### `/components/WeatherWidget.tsx`
**역할**: 실시간 날씨 위젯

**주요 기능**:
- OpenWeather API 연동
- 도시별 현재 날씨 표시
- 온도, 날씨 아이콘, 습도, 풍속

**백엔드 연동**:
```tsx
const response = await fetch(`${apiUrl}/weather/${city}`);
```

---

## 🔧 3. 백엔드 (Supabase Edge Functions)

### `/supabase/functions/server/index.tsx`
**역할**: Hono 기반 웹 서버, 모든 API 엔드포인트 정의

**주요 엔드포인트**:

#### 1️⃣ 외부 API 연동
```tsx
// 날씨 조회
app.get("/make-server-80cc3277/weather/:city", async (c) => {
  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}`;
  // ...
});

// GPT 추천
app.post("/make-server-80cc3277/recommend", async (c) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const response = await fetch("https://api.openai.com/v1/chat/completions");
  // ...
});

// 관광지 조회
app.get("/make-server-80cc3277/attractions/:areaCode", async (c) => {
  const apiKey = Deno.env.get("TOUR_API_KEY");
  const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1`;
  // ...
});
```

#### 2️⃣ 사용자 데이터 관리 (KV Store)
```tsx
// 여행 성향 저장
app.post("/make-server-80cc3277/save-preference", async (c) => {
  await kv.set(`preference:${userId}`, { travelStyle, answers });
});

// 여행 일정 저장
app.post("/make-server-80cc3277/save-itinerary", async (c) => {
  await kv.set(`itinerary:${userId}:${Date.now()}`, itinerary);
});

// 북마크 관리
app.post("/make-server-80cc3277/bookmark", async (c) => {
  await kv.set(`bookmark:${userId}:${Date.now()}`, bookmarkData);
});
```

#### 3️⃣ 인증 (Supabase Auth)
```tsx
// 회원가입
app.post("/make-server-80cc3277/signup", async (c) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, user_metadata: { name }
  });
});
```

---

### `/supabase/functions/server/auth.tsx`
**역할**: Supabase Auth 헬퍼 함수

**핵심 함수**:
```tsx
// 회원가입
export async function signUp(email: string, password: string, name: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, 
    user_metadata: { name },
    email_confirm: true // 이메일 자동 확인
  });
}

// 토큰 검증
export async function verifyToken(accessToken: string) {
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return { success: !error, userId: user?.id };
}
```

---

### `/supabase/functions/server/kv_store.tsx`
**역할**: Key-Value 저장소 유틸리티 (보호된 파일, 수정 불가)

**제공 함수**:
- `get(key)`: 단일 값 조회
- `set(key, value)`: 값 저장
- `del(key)`: 값 삭제
- `mget(keys)`: 여러 값 조회
- `mset(items)`: 여러 값 저장
- `getByPrefix(prefix)`: 접두사로 검색

**사용 예시**:
```tsx
import * as kv from './kv_store.tsx';

// 저장
await kv.set('user:123', { name: 'John', age: 30 });

// 조회
const user = await kv.get('user:123');

// 접두사 검색 (모든 사용자 북마크)
const bookmarks = await kv.getByPrefix('bookmark:123:');
```

---

## 🔐 4. 인증 및 유틸리티

### `/utils/supabase/client.tsx`
**역할**: Supabase 클라이언트 싱글톤

**사용법**:
```tsx
import { createClient } from './utils/supabase/client';

const supabase = createClient();

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// 세션 확인
const { data: { session } } = await supabase.auth.getSession();
```

---

### `/utils/supabase/info.tsx`
**역할**: Supabase 프로젝트 정보 제공 (보호된 파일)

**제공 값**:
```tsx
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

---

### `/utils/pwa.ts`
**역할**: PWA Service Worker 등록

**기능**:
- 오프라인 지원
- 캐싱 전략
- 앱 설치 프롬프트

---

## 📱 5. PWA 설정

### `/public/manifest.json`
**역할**: PWA 앱 메타데이터

**핵심 설정**:
```json
{
  "name": "여행 추천 앱",
  "short_name": "여행앱",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

---

### `/public/sw.js`
**역할**: Service Worker (오프라인 캐싱)

**캐싱 전략**:
- 정적 파일: Cache First
- API 요청: Network First

---

## 🎨 6. 스타일링

### `/styles/globals.css`
**역할**: 전역 스타일 및 Tailwind 설정

**핵심 토큰**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

**중요**: `font-size`, `font-weight`, `line-height`는 기본 타이포그래피가 설정되어 있으므로 Tailwind 클래스를 사용하지 마세요!

---

## 🔑 7. 환경 변수

**필수 환경 변수** (Supabase Secret으로 설정):

```bash
# Supabase (자동 설정됨)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_DB_URL=postgresql://xxx

# 외부 API
TOUR_API_KEY=your-tour-api-key
OPENWEATHER_API_KEY=your-openweather-key
OPENAI_API_KEY=sk-xxx
KAKAO_REST_API_KEY=your-kakao-key (선택사항)
```

**설정 방법**: Supabase 대시보드에서 자동으로 관리됩니다.

---

## 🚀 8. API 호출 패턴

### 프론트엔드에서 백엔드 호출

```tsx
import { projectId, publicAnonKey } from './utils/supabase/info';

const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277`;

// GET 요청
const response = await fetch(`${apiUrl}/weather/서울`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
});

// POST 요청
const response = await fetch(`${apiUrl}/recommend`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({ travelStyle, location, weather })
});

// 인증이 필요한 요청 (로그인 후)
const session = await supabase.auth.getSession();
const accessToken = session.data.session?.access_token;

const response = await fetch(`${apiUrl}/bookmark`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}` // accessToken 사용
  },
  body: JSON.stringify({ location, name, category })
});
```

---

## 📊 9. 데이터 흐름

### 전체 사용자 여정

```
1. SurveyPage (설문)
   ↓ 여행 성향 결정 (힐링/관광/액티비티)
   ↓ 백엔드에 저장 (/save-preference)
   
2. RecommendationPage (GPT 추천)
   ↓ GPT가 맞춤형 추천 생성 (/recommend)
   ↓ 위치 선택
   
3. SmartRoutePage (장소 선별)
   ↓ 리뷰/평점 기반 필터링 (/select-places)
   ↓ 장소 추가/삭제, 순서 조정
   ↓ 경로 생성 버튼
   
4. RouteMapPage (경로 안내)
   ↓ 카카오맵에 경로 표시
   ↓ 거리/시간 계산
   ↓ 네비게이션 시작
   
5. ItineraryPage (일정 저장)
   ↓ 백엔드에 저장 (/save-itinerary)
```

---

## 🛠️ 10. 개발 시 주의사항

### ✅ DO (해야 할 것)
- 새로운 API 엔드포인트는 `/make-server-80cc3277/` 접두사 사용
- 환경 변수는 `Deno.env.get()` 사용
- 에러 발생 시 Mock 데이터 반환 (사용자 경험 유지)
- 모든 API 응답에 `isMock` 플래그 포함
- 로그를 상세하게 작성 (`console.log`)

### ❌ DON'T (하지 말아야 할 것)
- 보호된 파일 수정 금지:
  - `/supabase/functions/server/kv_store.tsx`
  - `/utils/supabase/info.tsx`
  - `/components/figma/ImageWithFallback.tsx`
- DDL/마이그레이션 파일 작성 금지 (실행 불가)
- `SUPABASE_SERVICE_ROLE_KEY`를 프론트엔드에 노출 금지
- Tailwind의 `text-*`, `font-*`, `leading-*` 클래스 사용 자제

---

## 📦 11. 주요 라이브러리

```json
{
  "react": "^18.x",
  "lucide-react": "아이콘",
  "recharts": "차트",
  "motion/react": "애니메이션",
  "react-dnd": "드래그 앤 드롭",
  "sonner": "토스트 알림",
  "hono": "백엔드 프레임워크 (Deno)",
  "@supabase/supabase-js": "Supabase 클라이언트"
}
```

---

## 🔍 12. 디버깅 가이드

### 백엔드 로그 확인
```bash
# Supabase 대시보드 > Functions > Logs
```

### 프론트엔드 디버깅
```tsx
// 브라우저 콘솔에서 확인
console.log('Current state:', { travelStyle, selectedPlaces });
```

### 일반적인 문제

**1. API 호출 실패**
- 환경 변수 확인
- CORS 헤더 확인
- 네트워크 탭에서 요청/응답 확인

**2. 인증 오류**
- 토큰 만료 확인
- `Authorization` 헤더 형식 확인 (`Bearer ${token}`)

**3. Mock 데이터만 표시됨**
- API 키 설정 확인
- 백엔드 로그에서 에러 확인

---

## 📈 13. 향후 개발 계획

### Phase 1 (현재)
- ✅ 기본 UI/UX
- ✅ 외부 API 연동
- ✅ GPT 추천 시스템
- ⚠️ Mock 데이터 기반 장소 선별

### Phase 2 (다음 단계)
- [ ] Selenium 크롤링으로 실제 리뷰 데이터 수집
- [ ] 카카오맵 SDK 완전 연동
- [ ] Decision Tree 알고리즘 고도화
- [ ] 사용자 후기 작성 기능

### Phase 3 (미래)
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 여행 공유 기능
- [ ] AI 챗봇 (실시간 질문 답변)
- [ ] 다국어 지원

---

## 📞 지원

문제가 발생하면:
1. 백엔드 로그 확인
2. 브라우저 콘솔 확인
3. 환경 변수 재확인
4. Mock 데이터로 폴백되는지 확인

---

**작성일**: 2025-10-20  
**버전**: 1.0
