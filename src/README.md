# 🌏 AI 여행 추천 애플리케이션

갤럭시 S25 울트라 화면 크기(412px)에 최적화된 모바일 여행 추천 앱입니다.

## ✅ 앱 상태 안내

이 앱은 **모든 핵심 기능이 정상 작동**합니다!

### 🗺️ 카카오맵 관련

**지도 SDK가 로드되지 않아도 괜찮습니다!**

- ✅ 장소 검색 (REST API)
- ✅ 경로 계산 (REST API)
- ✅ 거리/시간 표시 (REST API)
- ✅ 자동 대체 UI (목록 형태)
- ✅ 카카오맵 외부 링크 제공

**지도 표시를 원한다면**:
1. 앱 실행 후 우측 하단 **🔧 버튼** 클릭
2. [카카오 개발자 콘솔](https://developers.kakao.com/)에서 도메인 등록
3. 자세한 내용: [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md)

### 🌤️ 날씨 API 관련

**Mock 데이터로 모든 기능 작동 중**

실제 날씨 데이터 연동 방법: [QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md)

---

## ✨ 주요 기능

- 🧠 **Decision Tree 기반 여행 성향 분석**
- 🤖 **GPT 연동 맞춤형 추천**
- 🌤️ **실시간 날씨 반영** (OpenWeather API)
- 🗺️ **카카오 API 기반 경로 시각화**
  - **REST API**: 장소 검색, 주소-좌표 변환, 거리/시간 계산 (도메인 등록 불필요)
  - **JavaScript SDK**: 지도 표시 및 마커 (도메인 등록 필요)
- 📍 **인기 장소 & 숨은 명소 선별**
- 🏞️ **전국 관광지 정보 제공**
- 🧭 **스마트 경로 최적화** (거리, 시간 자동 계산)

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정 (중요!)

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# .env
VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f
```

> ⚠️ **주의**: `.env` 파일을 생성하거나 수정한 후에는 **반드시 개발 서버를 재시작**해야 합니다!

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하세요.

### 4. 브라우저 확인

- 하드 리프레시: `Ctrl + Shift + R` (Windows/Linux) 또는 `Cmd + Shift + R` (Mac)

## 🔧 환경 변수 문제 해결

### ❌ "Cannot read properties of undefined (reading 'VITE_KAKAO_JS_KEY')" 에러가 발생하는 경우:

1. **.env 파일 확인**
   - 프로젝트 루트에 `.env` 파일이 있는지 확인
   - 파일 내용이 정확한지 확인:
     ```
     VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f
     ```

2. **개발 서버 재시작 (필수!)**
   ```bash
   # 현재 서버 중지
   Ctrl + C (또는 Cmd + C)
   
   # 서버 재시작
   npm run dev
   ```

3. **브라우저 캐시 삭제**
   - 하드 리프레시: `Ctrl + Shift + R`
   - 또는 개발자 도구(F12) > Application > Clear storage

4. **환경 변수 확인**
   - 브라우저 콘솔(F12)에서 다음 명령어 실행:
     ```javascript
     console.log(import.meta.env.VITE_KAKAO_JS_KEY);
     ```
   - `"94e86b9b6ddf71039ab09c9902d2d79f"`가 출력되어야 정상
   - `undefined`가 출력되면 서버 재시작 필요

### 📋 체크리스트

- [ ] `.env` 파일이 프로젝트 루트에 존재
- [ ] `VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f` 형식으로 작성
- [ ] .env 파일에 따옴표나 공백이 없음
- [ ] 개발 서버 재시작
- [ ] 브라우저 캐시 삭제

## 📁 프로젝트 구조

```
프로젝트/
├── .env                    # 환경 변수 (필수!)
├── .env.example            # 환경 변수 예시
├── components/             # React 컴포넌트
│   ├── SurveyPage.tsx     # 여행 성향 설문
│   ├── RecommendationPage.tsx  # GPT 추천
│   ├── SmartRoutePage.tsx # 스마트 경로 생성
│   ├── RouteMapPage.tsx   # 카카오맵 경로 표시
│   └── ...
├── utils/
│   ├── kakao-config.ts    # 카카오 API 설정
│   └── supabase/          # Supabase 연동
└── supabase/
    └── functions/server/  # 백엔드 서버
```

## 🔐 API 키 설정

### 카카오맵 JavaScript Key
- 현재 설정된 키: `94e86b9b6ddf71039ab09c9902d2d79f`
- 새 키 발급: [카카오 개발자 센터](https://developers.kakao.com/)

### 카카오 REST API Key (백엔드)
- Supabase 환경 변수에 설정되어 있음
- 키: `d8bc8a87cc33c1ab4d97eb09f57b8da7`

## 📱 PWA (Progressive Web App)

이 앱은 PWA로 변환 가능하며, 모바일 기기에 설치할 수 있습니다:

1. 브라우저에서 앱 접속
2. "홈 화면에 추가" 선택
3. 실제 앱처럼 사용 가능

## 🛠️ 기술 스택

- **프론트엔드**: React, TypeScript, Tailwind CSS
- **지도**: Kakao Maps API
- **AI**: OpenAI GPT-3.5
- **날씨**: OpenWeather API
- **백엔드**: Supabase (Edge Functions, Auth, Storage)
- **배포**: Vercel

## 📖 상세 가이드

- [환경 변수 설정 가이드](./ENV_SETUP_GUIDE.md)
- [카카오 API 설정](./KAKAO_API_SETUP.md)
- [OpenWeather API 설정](./OPENWEATHER_API_SETUP.md)
- [코드 가이드](./CODE_GUIDE.md)

## ⚠️ 주의사항

1. **환경 변수는 반드시 `VITE_` 접두사로 시작**해야 클라이언트에서 접근 가능
2. **.env 파일 수정 후 개발 서버 재시작 필수**
3. **.env 파일은 Git에 커밋하지 마세요** (이미 .gitignore에 포함됨)
4. 배포 시 호스팅 서비스에 환경 변수 설정 필요

## 🐛 문제 해결

이미지 로딩 실패나 환경 변수 관련 에러가 발생하면:

1. 개발자 도구(F12) 콘솔에서 에러 확인
2. `.env` 파일 확인
3. 서버 재시작
4. 브라우저 캐시 삭제

도움이 필요하면 [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)를 참고하세요.

## 📝 라이선스

MIT License
