# 🚀 지금 바로 배포하기 - GitHub + Vercel

## ✅ 준비 완료!
모든 파일이 준비되었습니다. 이제 배포만 하면 됩니다!

---

## 📝 STEP 1: GitHub에 푸시 (5분)

### 1-1. 터미널 열기
프로젝트 폴더에서 터미널을 엽니다.

### 1-2. Git 명령어 실행

```bash
# 1. Git 초기화 (처음이면)
git init

# 2. 모든 파일 스테이징
git add .

# 3. 커밋 메시지 작성
git commit -m "Initial commit - Travel PWA ready for deployment"

# 4. main 브랜치로 설정
git branch -M main
```

### 1-3. GitHub 저장소 생성
1. 브라우저에서 [github.com/new](https://github.com/new) 열기
2. **Repository name**: `travel-app` 입력
3. **Public** 선택
4. ⚠️ **"Add a README file" 체크 해제** (중요!)
5. **"Create repository"** 클릭

### 1-4. GitHub에 푸시
GitHub에서 생성된 저장소 페이지에 표시된 명령어 사용:

```bash
# YOUR-USERNAME을 본인의 GitHub 아이디로 변경!
git remote add origin https://github.com/YOUR-USERNAME/travel-app.git

# 푸시!
git push -u origin main
```

**완료!** GitHub에서 코드가 올라간 것을 확인하세요.

---

## 🌐 STEP 2: Vercel 배포 (3분)

### 2-1. Vercel 계정 생성 및 로그인
1. [vercel.com](https://vercel.com) 접속
2. **"Continue with GitHub"** 클릭
3. GitHub 계정으로 로그인
4. Vercel이 GitHub 접근 권한 요청하면 **"Authorize"** 클릭

### 2-2. 새 프로젝트 만들기
1. Vercel 대시보드에서 **"Add New..."** 버튼 클릭
2. **"Project"** 선택

### 2-3. GitHub 저장소 연결
1. **"Import Git Repository"** 섹션에서 `travel-app` 찾기
   - 안 보이면: **"Adjust GitHub App Permissions"** 클릭하여 권한 추가
2. `travel-app` 저장소 옆의 **"Import"** 버튼 클릭

### 2-4. 프로젝트 설정
다음 설정이 자동으로 감지되는지 확인:

- **Framework Preset**: `Vite` ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

모두 자동으로 설정되므로 변경할 필요 없습니다!

### 2-5. 환경 변수 추가 (중요! ⚠️)

**"Environment Variables"** 섹션에서 다음 변수들을 하나씩 추가:

#### 필수 환경 변수:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | (Supabase 프로젝트 URL) | Production |
| `SUPABASE_ANON_KEY` | (Supabase anon key) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase service role key) | Production |
| `SUPABASE_DB_URL` | (Supabase DB URL) | Production |
| `OPENWEATHER_API_KEY` | (OpenWeather API key) | Production |
| `TOUR_API_KEY` | (한국관광공사 API key) | Production |

#### 선택 환경 변수 (있으면 추가):

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | (있으면 추가) |
| `KAKAO_REST_API_KEY` | (있으면 추가) |
| `KAKAO_JAVASCRIPT_KEY` | (있으면 추가) |

**추가 방법:**
1. **Name** 필드에 변수 이름 입력 (예: `SUPABASE_URL`)
2. **Value** 필드에 값 붙여넣기
3. **Environment**: Production 선택 (기본값)
4. **"Add"** 버튼 클릭
5. 다음 변수로 반복

### 2-6. 배포 시작!
1. 모든 환경 변수를 추가했는지 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인 (약 2-3분 소요)

**배포 중...**
- Building... ⏳
- Deploying... ⏳
- Success! ✅

---

## 🎉 STEP 3: 배포 완료! 테스트하기

### 3-1. 배포 URL 확인
배포가 완료되면:
- **"Congratulations!"** 메시지 표시
- URL 형식: `https://travel-app-xxxxx.vercel.app`
- **"Visit"** 버튼 클릭

### 3-2. 데스크톱 테스트
1. 배포된 URL 접속
2. 앱이 정상적으로 로드되는지 확인
3. 로그인/회원가입 테스트
4. Chrome DevTools (F12) → Application → Manifest 확인

### 3-3. 모바일 테스트 (Android)
1. 모바일 Chrome으로 URL 접속
2. 화면 하단에 **"앱으로 설치하기"** 배너 확인
3. **"설치"** 버튼 클릭
4. 홈 화면에 **"Escape the Ordinary"** 아이콘 확인
5. 앱 아이콘 탭하여 전체 화면으로 실행

### 3-4. 모바일 테스트 (iOS)
1. Safari로 URL 접속
2. 하단 **공유 버튼 (⬆️)** 탭
3. **"홈 화면에 추가"** 선택
4. **"추가"** 탭
5. 홈 화면에서 앱 아이콘 확인

---

## 🔧 STEP 4: 환경 변수 값 찾기

### Supabase 값들:

1. [supabase.com](https://supabase.com) 로그인
2. 프로젝트 선택
3. **Settings** → **API**
4. 다음 값들 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** (Show 클릭) → `SUPABASE_SERVICE_ROLE_KEY`
5. **Settings** → **Database**
   - **Connection string** → `SUPABASE_DB_URL`

### OpenWeather API:

1. [openweathermap.org](https://openweathermap.org/api) 접속
2. 계정 생성 후 로그인
3. **API keys** 탭
4. API key 복사 → `OPENWEATHER_API_KEY`

### 한국관광공사 API:

1. [data.go.kr](https://www.data.go.kr) 접속
2. 한국관광공사 API 검색
3. 활용신청 후 승인
4. 인증키 복사 → `TOUR_API_KEY`

---

## 📱 STEP 5: Lighthouse 점수 확인

### Chrome DevTools에서:
1. 배포된 URL 접속
2. **F12** 눌러 DevTools 열기
3. **Lighthouse** 탭 클릭
4. 카테고리 선택:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
5. **"Generate report"** 클릭
6. 결과 확인:
   - 🎯 PWA: 90점 이상 목표
   - 🎯 Performance: 80점 이상
   - 🎯 Accessibility: 90점 이상

---

## 🎨 STEP 6: 아이콘 교체 (선택)

현재 placeholder 아이콘을 실제 이미지로 교체:

### 방법:
1. [squoosh.app](https://squoosh.app) 접속
2. "Escape the Ordinary" 이미지 업로드
3. Resize → 192x192 → 다운로드 → `icon-192.png`
4. 다시 업로드 → Resize → 512x512 → `icon-512.png`
5. `/public/` 폴더에 복사 (기존 파일 덮어쓰기)
6. Git 푸시:
```bash
git add public/icon-192.png public/icon-512.png
git commit -m "Update app icons"
git push
```
7. Vercel이 자동으로 재배포! 🎉

---

## ✅ 완료 체크리스트

### GitHub:
- [ ] Git 초기화 완료
- [ ] 모든 파일 커밋
- [ ] GitHub 저장소 생성
- [ ] GitHub에 푸시 완료

### Vercel:
- [ ] Vercel 계정 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 모두 추가
- [ ] 배포 성공

### 테스트:
- [ ] 배포 URL 접속 확인
- [ ] 로그인/회원가입 작동
- [ ] 여행 추천 기능 작동
- [ ] Android PWA 설치 테스트
- [ ] iOS PWA 설치 테스트
- [ ] Lighthouse PWA 점수 90+

### 선택사항:
- [ ] 실제 앱 아이콘 교체
- [ ] 커스텀 도메인 연결
- [ ] 친구들에게 공유

---

## 🔄 업데이트 방법

코드를 수정한 후:

```bash
# 1. 변경사항 추가
git add .

# 2. 커밋
git commit -m "Update feature"

# 3. 푸시
git push
```

→ **Vercel이 자동으로 재배포!** 🚀

---

## 🐛 문제 해결

### "Build Failed" 에러
1. Vercel 대시보드 → 프로젝트 → Deployments
2. 실패한 배포 클릭
3. Build Logs 확인
4. 에러 메시지 읽고 수정

### "환경 변수가 없습니다" 에러
1. Vercel 프로젝트 → Settings → Environment Variables
2. 모든 필수 변수 추가되었는지 확인
3. 값에 따옴표 없이 입력했는지 확인
4. Deployments → 우측 ⋯ → Redeploy

### "Service Worker 등록 실패"
- HTTPS로 배포되었는지 확인 (Vercel은 자동 HTTPS ✅)
- `/public/sw.js` 파일 존재 확인
- 브라우저 캐시 삭제 후 재시도

### "설치 프롬프트가 안 뜸"
- HTTPS 필수 (Vercel은 자동 ✅)
- Service Worker 등록 확인
- manifest.json 유효성 확인
- Chrome DevTools → Application → Manifest 확인

---

## 🎊 축하합니다!

여행 추천 앱이 이제 실제 PWA로 배포되었습니다! 🎉

**배포 URL**: `https://your-app.vercel.app`

### 다음 단계:
1. 친구들에게 URL 공유
2. 피드백 수집
3. 기능 개선
4. SNS에 자랑하기! 🚀

---

## 📊 배포 정보

- **플랫폼**: Vercel
- **배포 시간**: 약 2-3분
- **자동 배포**: Git push 시 자동
- **HTTPS**: 자동 설정
- **무료 플랜**: 무제한 배포

---

**성공하셨나요?** 🎉
배포 URL을 공유해주세요! 함께 축하합시다! 🎊
