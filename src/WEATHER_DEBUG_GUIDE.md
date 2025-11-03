# 🌤️ 날씨 연동 디버깅 가이드

## 📋 목차
1. [빠른 진단](#빠른-진단)
2. [일반적인 문제와 해결방법](#일반적인-문제와-해결방법)
3. [로그 확인 방법](#로그-확인-방법)
4. [OpenWeather API 키 설정](#openweather-api-키-설정)
5. [고급 디버깅](#고급-디버깅)

---

## 🚀 빠른 진단

### 1단계: 테스트 페이지 접근
1. 앱 홈 화면에서 **"🌤️ 날씨 연동 테스트"** 카드 클릭
2. **"진단 시작"** 버튼 클릭
3. 4가지 자동 테스트 결과 확인

### 2단계: 테스트 결과 해석

#### ✅ 모든 테스트 통과
- 날씨 API가 정상 작동 중
- 실제 날씨 데이터 사용 중

#### ⚠️ "Mock 데이터 사용 중" 경고
- **원인**: OPENWEATHER_API_KEY가 설정되지 않았거나 API 오류
- **해결**: 아래 "OpenWeather API 키 설정" 참고

#### ❌ API 서버 연결 실패
- **원인**: Supabase Edge Function이 배포되지 않음
- **해결**: Supabase 대시보드에서 Functions 탭 확인

---

## 🔍 일반적인 문제와 해결방법

### 문제 1: Mock 데이터만 표시됨 (💡 아이콘 표시)

**증상**:
- 날씨 위젯에 💡 아이콘이 표시됨
- "실시간 데이터 연결 대기 중" 메시지
- 항상 같은 날씨 표시 (20°C, 맑음)

**원인**:
- OPENWEATHER_API_KEY 환경 변수가 설정되지 않음
- 또는 API 키가 유효하지 않음

**해결 방법**:
1. https://openweathermap.org/ 접속
2. 무료 계정 생성 (Sign up)
3. API Keys 메뉴에서 키 복사
4. Supabase 대시보드로 이동:
   - Project Settings → Edge Functions → Add secret
   - Name: `OPENWEATHER_API_KEY`
   - Value: 복사한 API 키
5. Edge Function 재배포 (자동으로 재시작됨)
6. 앱 새로고침 (F5)

**참고**:
- OpenWeather 무료 플랜: 1분당 60회 요청 제한
- API 키 활성화까지 최대 2시간 소요 가능

---

### 문제 2: "날씨 정보 로드 실패" 에러

**증상**:
- 빨간색 에러 메시지 표시
- 구체적인 에러 내용 표시

**원인**:
- 네트워크 오류
- Supabase 프로젝트 설정 문제
- CORS 에러

**해결 방법**:

#### A. 브라우저 콘솔 확인
1. F12 눌러서 개발자 도구 열기
2. Console 탭 선택
3. `[WeatherWidget]` 로그 찾기
4. 빨간색 에러 메시지 확인

#### B. CORS 에러인 경우
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
→ 백엔드 코드에 CORS가 이미 설정되어 있으므로, Edge Function을 재배포하세요.

#### C. 404 Not Found 에러
```
[WeatherWidget] Response status: 404
```
→ Edge Function이 배포되지 않았습니다. Supabase 대시보드 확인 필요.

---

### 문제 3: 특정 도시만 날씨가 안 나옴

**증상**:
- 서울은 되는데 다른 도시는 안 됨
- 또는 반대로 영어 도시명은 되는데 한글은 안 됨

**원인**:
- 도시명 매핑 누락
- OpenWeather API가 해당 도시를 인식 못함

**해결 방법**:

#### 백엔드 코드 확인
`/supabase/functions/server/index.tsx` 파일의 `cityNameMap` 확인:

```typescript
const cityNameMap: Record<string, string> = {
  "서울": "Seoul",
  "부산": "Busan",
  // ... 더 많은 도시
};
```

#### 도시 추가 방법
1. 위 파일 편집
2. 원하는 도시를 `"한글명": "영문명"` 형식으로 추가
3. Edge Function 재배포

---

## 📊 로그 확인 방법

### 프론트엔드 로그 (브라우저)

1. **F12** 눌러서 개발자 도구 열기
2. **Console** 탭 선택
3. 필터에 `Weather` 입력

**주요 로그 메시지**:
```
[WeatherWidget] ===== STARTING WEATHER FETCH =====
[WeatherWidget] City: 서울
[WeatherWidget] Project ID: fyrmbzodedjkwtlkyymp
[WeatherWidget] Public Anon Key: exists (length: 183)
[WeatherWidget] Request URL: https://...
[WeatherWidget] Response status: 200
[WeatherWidget] Weather data received: {...}
[WeatherWidget] Is mock data: NO
[WeatherWidget] ✅ Real weather data loaded successfully
[WeatherWidget] ===== WEATHER FETCH COMPLETE =====
```

### 백엔드 로그 (Supabase)

1. Supabase 대시보드 접속
2. **Edge Functions** → **make-server-80cc3277** → **Logs** 탭
3. 실시간 로그 확인

**주요 로그 메시지**:
```
[Weather API] ===== WEATHER REQUEST =====
[Weather API] City requested: 서울
[Weather API] OPENWEATHER_API_KEY: SET (length: 32)
[Weather API] City mapping: 서울 → Seoul
[Weather API] Calling OpenWeather API...
[Weather API] OpenWeather API response status: 200 OK
[Weather API] ✅ OpenWeather API success
[Weather API] ✅ Sending REAL weather data: {...}
[Weather API] ===== WEATHER REQUEST COMPLETE =====
```

---

## 🔑 OpenWeather API 키 설정

### 1. API 키 발급

1. **회원가입**: https://openweathermap.org/
2. **로그인** 후 계정 메뉴 → **My API keys**
3. Default 키 복사 또는 **Create Key** 클릭

### 2. Supabase에 키 등록

#### 방법 A: Supabase 대시보드 (권장)
1. Supabase 프로젝트 대시보드 접속
2. **Settings** (왼쪽 사이드바 하단) 클릭
3. **Edge Functions** 탭 선택
4. **Add secret** 버튼 클릭
5. 입력:
   - **Name**: `OPENWEATHER_API_KEY`
   - **Value**: 복사한 API 키
6. **Save** 클릭

#### 방법 B: Supabase CLI
```bash
supabase secrets set OPENWEATHER_API_KEY=your_api_key_here
```

### 3. 적용 확인

1. Edge Function 자동 재시작 대기 (약 30초)
2. 앱 새로고침 (F5)
3. 날씨 위젯에서 💡 아이콘이 사라졌는지 확인
4. 테스트 페이지에서 "OpenWeather API Key 설정" 항목이 ✓로 바뀌었는지 확인

---

## 🛠️ 고급 디버깅

### Network 탭 활용

1. F12 → **Network** 탭
2. 필터에 `weather` 입력
3. 날씨 API 호출 찾기
4. 클릭하여 상세 정보 확인:
   - **Headers**: 요청/응답 헤더
   - **Preview**: 응답 데이터 미리보기
   - **Response**: 원본 응답

### 직접 API 테스트

브라우저 콘솔에서 직접 테스트:

```javascript
// 프로젝트 정보 확인
console.log('Project ID:', 'fyrmbzodedjkwtlkyymp');

// 날씨 API 직접 호출
fetch('https://fyrmbzodedjkwtlkyymp.supabase.co/functions/v1/make-server-80cc3277/weather/서울', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Weather data:', data));
```

### OpenWeather API 직접 테스트

백엔드를 거치지 않고 OpenWeather API 직접 호출:

```bash
# 터미널에서 실행
curl "https://api.openweathermap.org/data/2.5/weather?q=Seoul,KR&appid=YOUR_API_KEY&units=metric&lang=kr"
```

**응답 예시**:
```json
{
  "main": {
    "temp": 15.2,
    "humidity": 65
  },
  "weather": [
    {
      "description": "맑음",
      "icon": "01d"
    }
  ],
  "wind": {
    "speed": 3.5
  }
}
```

---

## 📝 체크리스트

날씨 연동 문제 발생 시 순서대로 확인:

- [ ] **테스트 페이지**에서 진단 실행
- [ ] **브라우저 콘솔**에서 `[WeatherWidget]` 로그 확인
- [ ] **Supabase 대시보드**에서 Edge Function 로그 확인
- [ ] **OPENWEATHER_API_KEY** 환경 변수 설정 확인
- [ ] **API 키 유효성** 확인 (OpenWeather 대시보드)
- [ ] **Edge Function 배포** 상태 확인
- [ ] **네트워크 연결** 확인
- [ ] 앱 **새로고침** (F5)

---

## 🆘 추가 도움이 필요한 경우

### 자주 하는 실수

1. **API 키를 프론트엔드에 넣음**
   - ❌ WeatherWidget에 직접 API 키 입력
   - ✅ Supabase Edge Function 환경 변수에 설정

2. **잘못된 환경 변수 이름**
   - ❌ `OPENWEATHER_KEY`, `WEATHER_API_KEY`
   - ✅ `OPENWEATHER_API_KEY` (정확히 이 이름)

3. **API 키 활성화 대기 안 함**
   - 새로 발급받은 API 키는 최대 2시간 소요
   - 조금 기다린 후 다시 시도

### 문제가 계속되면

1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. 시크릿 모드에서 테스트
3. 다른 브라우저에서 테스트
4. Edge Function 로그에서 구체적인 에러 확인

---

**마지막 업데이트**: 2025-10-21  
**작성자**: Figma Make AI Assistant
