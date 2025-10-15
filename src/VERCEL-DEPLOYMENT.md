# 🚀 Vercel 배포 완전 가이드

## ✅ 준비 완료 체크
- [x] package.json
- [x] vercel.json
- [x] vite.config.ts
- [x] index.html
- [x] PWA 파일들 (/public/)

모든 파일이 준비되었습니다! 이제 배포만 하면 됩니다.

---

## 🎯 배포 방법 선택

### 방법 1: GitHub + Vercel (추천) ⭐⭐⭐
**장점:**
- 가장 쉬움
- 자동 배포 (Git push하면 자동 재배포)
- 프리뷰 URL 제공
- 웹 UI로 쉽게 관리

### 방법 2: Vercel CLI
**장점:**
- 빠름 (GitHub 없이 바로 배포)
- 터미널에서 모든 작업

---

## 📱 방법 1: GitHub + Vercel (가장 쉬움)

### STEP 1: GitHub에 코드 푸시 (3분)

#### 1-1. 로컬에서 Git 초기화
터미널에서 프로젝트 폴더로 이동 후:

```bash
# Git 초기화 (이미 했으면 스킵)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "PWA ready for deployment"

# 기본 브랜치를 main으로 설정
git branch -M main
```

#### 1-2. GitHub 저장소 생성
1. [github.com](https://github.com) 접속
2. 오른쪽 상단 "+" → "New repository" 클릭
3. Repository name: `travel-app` (원하는 이름)
4. Public 또는 Private 선택
5. **"Add a README file" 체크 해제** (중요!)
6. "Create repository" 클릭

#### 1-3. GitHub에 푸시
GitHub에서 제공하는 명령어 복사 후 실행:

```bash
git remote add origin https://github.com/YOUR-USERNAME/travel-app.git
git push -u origin main
```

**완료!** GitHub에서 코드를 확인하세요.

---

### STEP 2: Vercel 배포 (2분)

#### 2-1. Vercel 계정 생성
1. [vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. **"Continue with GitHub"** 선택 (추천)
4. GitHub로 로그인

#### 2-2. 프로젝트 배포
1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서 GitHub 저장소 찾기
   - 안 보이면: "Adjust GitHub App Permissions" 클릭
3. `travel-app` 저장소 옆에 **"Import"** 클릭
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)

#### 2-3. 환경 변수 추가 (중요!)
"Environment Variables" 섹션에서 다음 변수들을 추가하세요:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your-supabase-url |
| `SUPABASE_ANON_KEY` | your-anon-key |
| `SUPABASE_SERVICE_ROLE_KEY` | your-service-role-key |
| `SUPABASE_DB_URL` | your-db-url |
| `OPENWEATHER_API_KEY` | your-openweather-key |
| `TOUR_API_KEY` | your-tour-api-key |
| `OPENAI_API_KEY` | your-openai-key (있다면) |
| `KAKAO_REST_API_KEY` | your-kakao-key (선택) |
| `KAKAO_JAVASCRIPT_KEY` | your-kakao-js-key (선택) |

**환경 변수 추가 방법:**
1. "Name" 필드에 변수 이름 입력
2. "Value" 필드에 값 입력
3. "Add" 클릭
4. 모든 변수 추가 완료할 때까지 반복

#### 2-4. 배포 시작
1. 모든 설정 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인 (약 2-3분 소요)

**배포 완료!** 🎉

---

### STEP 3: 배포 확인 (1분)

#### 3-1. 배포 URL 확인
배포가 완료되면:
- `https://your-app.vercel.app` 형식의 URL이 생성됩니다
- "Visit" 버튼 클릭하여 확인

#### 3-2. 기능 테스트
- ✅ 페이지가 정상적으로 로드되는가?
- ✅ 로그인/회원가입 작동하는가?
- ✅ 여행 추천 기능 작동하는가?
- ✅ 환경 변수가 제대로 작동하는가?

---

## 💻 방법 2: Vercel CLI (빠른 배포)

### STEP 1: Vercel CLI 설치

```bash
# npm 사용
npm i -g vercel

# 또는 yarn 사용
yarn global add vercel
```

### STEP 2: 로그인

```bash
vercel login
```

이메일을 입력하면 인증 메일이 발송됩니다. 메일에서 "Verify" 클릭.

### STEP 3: 배포

```bash
# 프로젝트 폴더에서
vercel

# 질문에 답변:
# Set up and deploy? Y
# Which scope? (본인 계정 선택)
# Link to existing project? N
# What's your project's name? travel-app
# In which directory is your code located? ./
# Want to override the settings? N
```

### STEP 4: 환경 변수 추가

```bash
# 각 환경 변수 추가
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENWEATHER_API_KEY
vercel env add TOUR_API_KEY

# 각 명령어 실행 후 값을 입력하고
# Environment (Production, Preview, Development):
# Production 선택 (또는 all)
```

### STEP 5: 프로덕션 배포

```bash
vercel --prod
```

**배포 완료!** 터미널에 URL이 표시됩니다.

---

## 📱 배포 후 PWA 테스트

### 1. 데스크톱 (Chrome)
1. 배포된 URL 접속
2. 주소창 오른쪽 **"설치"** 아이콘 클릭
3. "설치" 버튼 클릭
4. 앱이 독립 창으로 실행됨

### 2. Android (Chrome/Samsung Internet)
1. 모바일 브라우저로 URL 접속
2. 화면 하단에 **"앱으로 설치하기"** 배너 표시
3. "설치" 버튼 클릭
4. 홈 화면에서 앱 아이콘 확인
5. 앱 실행 (전체 화면, 주소창 없음)

### 3. iOS (Safari)
1. Safari로 URL 접속
2. 하단 **공유 버튼 (⬆️)** 클릭
3. **"홈 화면에 추가"** 선택
4. "추가" 클릭
5. 홈 화면에서 앱 아이콘 확인

---

## 🔧 Vercel 대시보드 기능

배포 후 [vercel.com/dashboard](https://vercel.com/dashboard)에서:

### 1. 배포 관리
- 모든 배포 버전 확인
- 이전 버전으로 롤백
- 배포 로그 확인

### 2. 환경 변수 관리
- Settings → Environment Variables
- 변수 추가/수정/삭제
- 환경별 설정 (Production, Preview, Development)

### 3. 도메인 설정
- Settings → Domains
- 커스텀 도메인 추가
- 예: `yourapp.com` 연결

### 4. 분석
- Analytics 탭
- 방문자 수, 페이지 뷰 등 확인

### 5. 자동 배포
- GitHub에 push하면 자동으로 재배포
- Pull Request마다 프리뷰 URL 생성

---

## ⚡ 빠른 업데이트 방법

코드를 수정한 후:

### GitHub 연결한 경우:
```bash
git add .
git commit -m "Update feature"
git push
```
→ 자동으로 Vercel에 재배포됨!

### Vercel CLI 사용한 경우:
```bash
vercel --prod
```
→ 수동으로 재배포

---

## 🎨 커스텀 도메인 연결 (선택)

### 1. 도메인 구매
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google)

### 2. Vercel에 도메인 추가
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `myapp.com`)
3. "Add" 클릭

### 3. DNS 설정
Vercel이 제공하는 값으로 도메인 DNS 설정:
- Type: `A` 또는 `CNAME`
- Name: `@` 또는 `www`
- Value: Vercel이 제공하는 값

### 4. 완료!
- 24-48시간 내에 적용
- HTTPS 자동 설정
- `https://myapp.com`으로 접속

---

## 📊 배포 성공 체크리스트

- [ ] Vercel에 배포 완료
- [ ] 배포 URL 접속 가능
- [ ] 환경 변수 모두 설정
- [ ] 로그인/회원가입 작동
- [ ] 여행 추천 기능 작동
- [ ] PWA 설치 테스트 (Android)
- [ ] PWA 설치 테스트 (iOS)
- [ ] Chrome Lighthouse 점수 확인 (90+)
- [ ] 오프라인 모드 테스트
- [ ] Service Worker 작동 확인

---

## 🐛 문제 해결

### "Build Failed"
1. Vercel 대시보드 → 프로젝트 → Deployments
2. 실패한 배포 클릭
3. Build Logs 확인
4. 에러 메시지 확인 후 수정

### "Environment Variable Not Found"
1. Settings → Environment Variables
2. 모든 필수 변수가 추가되었는지 확인
3. 변수 값에 따옴표 없이 입력했는지 확인
4. Redeploy

### "404 Error"
1. `vercel.json` 파일이 있는지 확인
2. `rewrites` 설정이 있는지 확인
3. Redeploy

### "Service Worker 등록 실패"
1. HTTPS로 배포되었는지 확인 (Vercel은 자동 HTTPS)
2. `/public/sw.js` 파일이 있는지 확인
3. 브라우저 캐시 삭제 후 재시도

---

## 🎉 배포 완료 후

### 1. URL 공유
- 친구, 가족에게 공유
- 피드백 수집

### 2. 모니터링
- Vercel Analytics로 방문자 확인
- 에러 로그 모니터링

### 3. 지속적 개선
- 사용자 피드백 반영
- 새 기능 추가
- 성능 최적화

---

## 📱 배포 URL 예시

```
프로덕션: https://travel-app.vercel.app
커스텀: https://yourapp.com (도메인 연결 시)
```

---

## 💡 다음 단계

1. **아이콘 개선**: 실제 PNG 아이콘으로 교체
2. **Lighthouse 최적화**: PWA 점수 100점 만들기
3. **커스텀 도메인**: 전문적인 도메인 연결
4. **마케팅**: 사용자 모으기
5. **앱스토어**: Capacitor로 네이티브 앱 변환

---

**준비되셨나요?** 🚀

위의 방법 중 하나를 선택하여 배포를 시작하세요!

- **GitHub + Vercel**: 추천! 자동 배포 원하면
- **Vercel CLI**: 빠르게 배포하고 싶으면

**성공하셨나요?** 🎊
- 배포 URL을 공유하세요!
- PWA 설치를 테스트하세요!
- 친구들에게 자랑하세요!
