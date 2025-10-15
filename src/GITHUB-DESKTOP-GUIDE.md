# 🖥️ GitHub Desktop 완벽 가이드

## ✅ 준비 완료!
프로젝트 파일이 모두 준비되었습니다:
- ✅ App.tsx
- ✅ package.json, vercel.json
- ✅ public/ (manifest.json, sw.js, 아이콘)
- ✅ components/ (모든 컴포넌트)
- ✅ 총 파일 수: 60+ 파일

이제 GitHub Desktop으로 업로드만 하면 됩니다!

---

## 🚀 STEP 1: GitHub Desktop 다운로드 (2분)

### 1-1. 다운로드
1. [desktop.github.com](https://desktop.github.com) 접속
2. **"Download for Windows"** 또는 **"Download for macOS"** 클릭
3. 다운로드 완료 대기

### 1-2. 설치
1. 다운로드한 파일 실행
   - Windows: `GitHubDesktopSetup.exe`
   - Mac: `GitHub Desktop.dmg`
2. 설치 진행 (자동)
3. 설치 완료 후 **"Finish"** 또는 **"Open"**

---

## 🔑 STEP 2: GitHub 로그인 (1분)

### 2-1. GitHub Desktop 시작 화면

첫 실행 시 환영 화면이 나타납니다:
- **"Sign in to GitHub.com"** 버튼 보임

### 2-2. 로그인
1. **"Sign in to GitHub.com"** 클릭
2. 브라우저가 자동으로 열림
3. GitHub에 로그인 (이미 로그인되어 있으면 자동)
4. **"Authorize desktop"** 버튼 클릭
5. GitHub Desktop으로 자동 복귀

**완료!** ✅ 로그인 성공 메시지 표시

### 2-3. 사용자 설정 (자동)
- Name: GitHub 이름 자동 입력
- Email: GitHub 이메일 자동 입력
- **"Finish"** 클릭

---

## 📁 STEP 3: 프로젝트 추가 (1분)

### 3-1. 메인 화면
로그인 후 다음 중 하나를 선택:
- **"Add a Local Repository"** (추천)
- 또는 상단 메뉴 **File** → **Add Local Repository...**

### 3-2. 폴더 선택
1. **"Choose..."** 버튼 클릭
2. 여행앱 프로젝트 폴더 찾기
   - 예: `C:\Users\YourName\travel-app\`
   - 또는: `/Users/YourName/travel-app/`
3. 폴더 선택 후 **"Select Folder"** 또는 **"열기"** 클릭

### 3-3. Git 초기화 (필요시)
만약 **"This directory does not appear to be a Git repository"** 메시지가 뜨면:
1. **"Create a repository"** 클릭
2. 또는 **"create a repository"** 링크 클릭
3. Repository details:
   - Name: `travel-app` (자동 입력됨)
   - Description: `AI 기반 맞춤형 여행 추천 PWA`
   - **"Git Ignore"**: Node 선택
   - **"License"**: None
4. **"Create Repository"** 클릭

**완료!** ✅ 프로젝트가 추가됨

---

## 📤 STEP 4: GitHub에 업로드 (Publish) (1분)

### 4-1. 변경사항 확인
좌측에 모든 파일 목록이 표시됩니다:
- ✅ App.tsx
- ✅ package.json
- ✅ public/manifest.json
- ✅ components/...
- ✅ ... (60+ 파일)

### 4-2. Commit 생성 (필요시)
만약 **"Publish repository"** 버튼이 안 보이고 변경사항이 있다면:

1. 좌측 하단 **Summary** 입력:
   ```
   Initial commit - Travel PWA
   ```
2. **Description** (선택):
   ```
   PWA 배포 준비 완료
   - Vercel 설정
   - Supabase 연동
   - 모든 컴포넌트
   ```
3. **"Commit to main"** 버튼 클릭

### 4-3. Publish Repository
1. 상단 중앙에 **"Publish repository"** 버튼 클릭
   - 또는 **Repository** 메뉴 → **Push**

2. Publish repository 다이얼로그:
   - **Name**: `travel-app` (그대로 유지)
   - **Description**: `AI 기반 맞춤형 여행 추천 PWA` (선택)
   - **Keep this code private**: ⬜ **체크 해제** (Public으로!)
   - **Organization**: (본인 계정 선택)

3. **"Publish repository"** 버튼 클릭

### 4-4. 업로드 진행
- 진행바 표시: "Publishing repository..."
- 파일 업로드 중: 60+ 파일
- 완료: "Published successfully!" ✅

**완료!** 🎉 GitHub에 업로드됨!

---

## ✅ STEP 5: GitHub에서 확인 (30초)

### 5-1. GitHub 웹사이트 열기
GitHub Desktop에서:
1. **Repository** 메뉴 → **View on GitHub**
2. 또는 단축키: `Ctrl+Shift+G` (Windows) / `Cmd+Shift+G` (Mac)

브라우저가 열리고 GitHub 저장소 페이지가 표시됩니다!

### 5-2. 파일 확인
GitHub 저장소에서 다음 파일들이 보여야 합니다:
- ✅ App.tsx
- ✅ package.json
- ✅ vercel.json
- ✅ index.html
- ✅ public/ 폴더
- ✅ components/ 폴더
- ✅ styles/ 폴더
- ✅ ... (모든 파일)

**완료!** ✅ 모든 파일이 GitHub에 업로드됨!

---

## 🌐 STEP 6: Vercel 배포 (3분)

이제 GitHub에 코드가 올라갔으니 Vercel에서 배포할 수 있습니다!

### 6-1. Vercel 접속
1. [vercel.com](https://vercel.com) 접속
2. **"Continue with GitHub"** 로그인

### 6-2. 새 프로젝트
1. **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서 `travel-app` 찾기
3. **"Import"** 버튼 클릭

### 6-3. 프로젝트 설정
자동 감지됨 (변경 안 해도 됨):
- Framework Preset: **Vite** ✅
- Root Directory: `./` ✅
- Build Command: `npm run build` ✅
- Output Directory: `dist` ✅

### 6-4. 환경 변수 추가 ⚠️ 중요!

**"Environment Variables"** 섹션에서 하나씩 추가:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your-supabase-project-url |
| `SUPABASE_ANON_KEY` | your-supabase-anon-key |
| `SUPABASE_SERVICE_ROLE_KEY` | your-supabase-service-role-key |
| `SUPABASE_DB_URL` | your-supabase-db-url |
| `OPENWEATHER_API_KEY` | your-openweather-api-key |
| `TOUR_API_KEY` | your-tour-api-key |

**추가 방법:**
1. Name 필드에 변수 이름 입력
2. Value 필드에 값 붙여넣기
3. **"Add"** 클릭
4. 다음 변수 반복

### 6-5. 배포!
1. 모든 환경 변수 추가 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 (2-3분)
   - Building...
   - Deploying...
4. **"Congratulations!"** 🎉

---

## 📱 STEP 7: PWA 테스트 (2분)

### 7-1. 배포 URL 확인
- URL 형식: `https://travel-app-xxxxx.vercel.app`
- **"Visit"** 버튼 클릭

### 7-2. 데스크톱 테스트
1. Chrome에서 접속
2. 주소창 오른쪽 **"설치"** 아이콘 클릭
3. **"설치"** 버튼 클릭
4. 앱이 독립 창으로 실행 ✅

### 7-3. 모바일 테스트 (Android)
1. 모바일 Chrome으로 URL 접속
2. 화면 하단 **"앱으로 설치하기"** 배너
3. **"설치"** 클릭
4. 홈 화면에 **"Escape the Ordinary"** 아이콘 생성 ✅

### 7-4. 모바일 테스트 (iOS)
1. Safari로 URL 접속
2. 공유 버튼 (⬆️) 탭
3. **"홈 화면에 추가"** 선택
4. **"추가"** 탭
5. 홈 화면에 아이콘 생성 ✅

---

## 🔄 추후 업데이트 방법

코드를 수정한 후:

### GitHub Desktop에서:
1. 파일 수정 후 저장
2. GitHub Desktop 열기
3. 좌측에 변경된 파일 목록 표시
4. 하단 **Summary** 입력: "Update feature"
5. **"Commit to main"** 클릭
6. 상단 **"Push origin"** 버튼 클릭

→ **Vercel이 자동으로 재배포!** 🚀

---

## 📊 GitHub Desktop 주요 기능

### 1. Changes 탭
- 모든 변경된 파일 목록
- Diff 비교 (이전 vs 현재)
- 선택적으로 Commit 가능

### 2. History 탭
- 모든 Commit 기록
- 각 Commit의 변경사항
- 시간별 타임라인

### 3. Branch 관리
- 상단 **Current Branch** 드롭다운
- 새 Branch 생성
- Branch 전환

### 4. Pull Request
- **Branch** → **Create Pull Request**
- GitHub에서 PR 생성

---

## ✅ 완료 체크리스트

- [ ] GitHub Desktop 설치
- [ ] GitHub 로그인
- [ ] 프로젝트 폴더 추가
- [ ] Publish repository 완료
- [ ] GitHub에서 파일 확인
- [ ] Vercel 프로젝트 Import
- [ ] 환경 변수 추가
- [ ] Deploy 성공
- [ ] 배포 URL 접속 확인
- [ ] PWA 설치 테스트

---

## 🐛 문제 해결

### "This directory does not appear to be a Git repository"
→ **"Create a repository"** 클릭하여 Git 초기화

### "Publish repository" 버튼이 안 보임
→ 먼저 Commit 생성 후 Push

### "Authentication failed"
→ GitHub Desktop에서 Sign out → Sign in 다시

### "Repository already exists"
→ GitHub.com에서 기존 저장소 삭제 후 재시도

### Vercel에서 "Repository not found"
→ GitHub에서 파일이 모두 업로드되었는지 확인

---

## 🎊 축하합니다!

GitHub Desktop을 사용하면:
- ✅ 클릭만으로 간단하게 업로드
- ✅ 시각적으로 변경사항 확인
- ✅ 충돌 해결 쉬움
- ✅ 추후 업데이트 편함

**이제 여행 추천 앱이 실제 PWA로 배포되었습니다!** 🎉

---

## 📱 다음 단계

1. **공유**: 친구들에게 URL 공유
2. **피드백**: 사용자 피드백 수집
3. **개선**: 기능 추가 및 버그 수정
4. **아이콘**: 실제 PNG 아이콘으로 교체
5. **도메인**: 커스텀 도메인 연결 (선택)

**성공하셨나요?** 🚀
배포 URL을 공유해주세요! 함께 축하합시다! 🎊
