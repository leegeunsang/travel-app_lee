# 🚀 Supabase Edge Function 배포 가이드

## ❌ "404 Not Found" 에러가 발생하는 이유

날씨 API 호출 시 404 에러가 발생하면, **Supabase Edge Function이 배포되지 않았다**는 의미입니다.

```
[RecommendationPage] Weather API error: 404 - 404 Not Found
```

이 앱은 백엔드 API로 Supabase Edge Functions를 사용합니다. Edge Function은 서버리스 함수로, 배포하지 않으면 작동하지 않습니다.

---

## 📋 필수 사항

### 1. Edge Function 파일 구조

```
supabase/
└── functions/
    └── server/
        ├── index.tsx      ← 메인 서버 코드
        ├── auth.tsx       ← 인증 로직
        └── kv_store.tsx   ← 데이터베이스 유틸리티
```

### 2. 필요한 환경 변수

Edge Function이 작동하려면 다음 환경 변수가 필요합니다:

- `SUPABASE_URL` (자동 설정됨)
- `SUPABASE_SERVICE_ROLE_KEY` (자동 설정됨)
- `SUPABASE_ANON_KEY` (자동 설정됨)
- `SUPABASE_DB_URL` (자동 설정됨)
- `OPENAI_API_KEY` (수동 설정 필요 - GPT 추천용)
- `OPENWEATHER_API_KEY` (수동 설정 필요 - 날씨 API용)
- `TOUR_API_KEY` (수동 설정 필요 - 관광 데이터용)

---

## 🛠️ 배포 방법

### 방법 1: Supabase CLI로 배포 (권장)

#### Step 1: Supabase CLI 설치

**Windows (PowerShell):**
```powershell
scoop install supabase
```

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

또는 npm으로:
```bash
npm install -g supabase
```

#### Step 2: Supabase 프로젝트 연결

```bash
# Supabase에 로그인
supabase login

# 프로젝트 연결 (프로젝트 디렉토리에서 실행)
supabase link --project-ref fyrmbzodedjkwtlkyymp
```

#### Step 3: Edge Function 배포

```bash
# 모든 함수 배포
supabase functions deploy

# 특정 함수만 배포
supabase functions deploy server
```

#### Step 4: 환경 변수 설정

```bash
# OPENWEATHER_API_KEY 설정
supabase secrets set OPENWEATHER_API_KEY=your_api_key_here

# OPENAI_API_KEY 설정
supabase secrets set OPENAI_API_KEY=your_api_key_here

# TOUR_API_KEY 설정
supabase secrets set TOUR_API_KEY=your_api_key_here
```

#### Step 5: 배포 확인

```bash
# 배포된 함수 목록 확인
supabase functions list

# 함수 로그 확인
supabase functions logs server
```

---

### 방법 2: Supabase 대시보드로 배포

#### Step 1: 대시보드 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `fyrmbzodedjkwtlkyymp`

#### Step 2: Edge Functions 페이지 이동

1. 왼쪽 사이드바에서 **"Edge Functions"** 클릭
2. **"Create a new function"** 버튼 클릭

#### Step 3: 함수 생성

1. **Function name**: `server`
2. **Code**: `/supabase/functions/server/index.tsx` 파일 내용 복사 & 붙여넣기

⚠️ **주의**: 대시보드에서는 한 번에 하나의 파일만 업로드할 수 있어서, `auth.tsx`와 `kv_store.tsx`의 내용을 `index.tsx`에 통합해야 합니다.

#### Step 4: 환경 변수 설정

1. **Settings** → **Edge Functions** 탭
2. **Add secret** 클릭하여 다음 변수 추가:
   - `OPENWEATHER_API_KEY`
   - `OPENAI_API_KEY`
   - `TOUR_API_KEY`

---

## ✅ 배포 확인 방법

### 1. Health Check 테스트

브라우저 주소창에 입력:
```
https://fyrmbzodedjkwtlkyymp.supabase.co/functions/v1/make-server-80cc3277/health
```

**정상 응답**:
```json
{"status":"ok"}
```

**404 에러**: Edge Function이 배포되지 않음

### 2. 날씨 API 테스트

브라우저 주소창에 입력:
```
https://fyrmbzodedjkwtlkyymp.supabase.co/functions/v1/make-server-80cc3277/weather/서울
```

**정상 응답** (Mock 데이터):
```json
{
  "temperature": 20,
  "description": "맑음",
  "icon": "01d",
  "humidity": 60,
  "windSpeed": 2.5,
  "isMock": true
}
```

### 3. 앱에서 테스트

1. 앱 홈 화면에서 **"🌤️ 날씨 연동 테스트"** 클릭
2. **"진단 시작"** 버튼 클릭
3. **"API 서버 연결"** 항목이 ✅로 표시되는지 확인

---

## 🔧 트러블슈팅

### 문제 1: "supabase: command not found"

**원인**: Supabase CLI가 설치되지 않음

**해결**:
```bash
npm install -g supabase
```

### 문제 2: "Project not linked"

**원인**: 프로젝트가 연결되지 않음

**해결**:
```bash
supabase link --project-ref fyrmbzodedjkwtlkyymp
```

### 문제 3: 배포 후에도 404 에러

**원인**: 
- 함수 이름이 잘못됨
- 배포가 완료되지 않음

**해결**:
1. 배포 상태 확인:
```bash
supabase functions list
```

2. 로그 확인:
```bash
supabase functions logs server
```

3. 함수 이름이 `server`인지 확인
4. 다시 배포:
```bash
supabase functions deploy server --no-verify-jwt
```

### 문제 4: CORS 에러

**원인**: CORS 헤더가 설정되지 않음

**해결**: `/supabase/functions/server/index.tsx`에 다음 코드 확인:
```typescript
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
```

### 문제 5: "Import not found" 에러

**원인**: `auth.tsx`, `kv_store.tsx` 파일을 찾을 수 없음

**해결**: 
1. CLI 배포 사용 (권장)
2. 또는 모든 파일을 하나로 통합

---

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] Supabase CLI 설치됨
- [ ] Supabase 프로젝트 연결됨
- [ ] `/supabase/functions/server/` 디렉토리 존재
- [ ] `index.tsx`, `auth.tsx`, `kv_store.tsx` 파일 존재
- [ ] `supabase functions deploy server` 실행
- [ ] 환경 변수 설정 (OPENWEATHER_API_KEY 등)
- [ ] Health check URL 테스트 통과
- [ ] 날씨 API URL 테스트 통과
- [ ] 앱에서 "API 서버 연결" 테스트 통과

---

## 🎯 빠른 배포 (한 줄 명령어)

```bash
# 1. CLI 설치 (npm 사용)
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref fyrmbzodedjkwtlkyymp

# 4. 함수 배포
supabase functions deploy server

# 5. 환경 변수 설정
supabase secrets set OPENWEATHER_API_KEY=your_key_here
```

완료! 이제 앱에서 날씨 API가 작동합니다.

---

## 📚 추가 자료

- [Supabase Edge Functions 공식 문서](https://supabase.com/docs/guides/functions)
- [Supabase CLI 설치 가이드](https://supabase.com/docs/guides/cli)
- [OpenWeather API 키 발급](https://openweathermap.org/)

---

**마지막 업데이트**: 2025-10-21  
**프로젝트 ID**: fyrmbzodedjkwtlkyymp
