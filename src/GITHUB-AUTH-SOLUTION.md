# 🔑 GitHub 인증 문제 해결

## 🚨 문제
`git push` 실행 시 로그인 창이 안 뜨거나, 비밀번호가 거부됩니다.

→ GitHub는 2021년부터 **비밀번호 대신 Token** 사용!

---

## ✅ 해결 방법 (3가지)

### 방법 1: GitHub Desktop (가장 쉬움! ⭐⭐⭐)
### 방법 2: GitHub CLI
### 방법 3: Personal Access Token

---

## 🎯 방법 1: GitHub Desktop (추천!)

### 왜 추천?
- ✅ 클릭만으로 간단하게 push
- ✅ 로그인 자동 처리
- ✅ 비주얼하게 파일 관리
- ✅ 충돌 해결 쉬움

### STEP 1: GitHub Desktop 다운로드
1. [desktop.github.com](https://desktop.github.com) 접속
2. **"Download for Windows/Mac"** 클릭
3. 설치 파일 실행

### STEP 2: GitHub 로그인
1. GitHub Desktop 실행
2. **"Sign in to GitHub.com"** 클릭
3. 브라우저에서 GitHub 로그인
4. **"Authorize desktop"** 클릭

### STEP 3: 저장소 추가
1. GitHub Desktop에서 **"File"** → **"Add Local Repository"**
2. **"Choose..."** 클릭
3. 프로젝트 폴더 선택
4. **"Add Repository"** 클릭

### STEP 4: GitHub에 Publish
1. 좌측 상단에서 **"Publish repository"** 클릭
2. Repository name: **`travel-app`** 확인
3. **"Keep this code private"** 체크 해제 (Public으로)
4. **"Publish repository"** 클릭

**완료!** 🎉 GitHub에 자동으로 업로드됩니다!

### STEP 5: 확인
1. GitHub.com에서 저장소 확인
2. 모든 파일이 올라갔는지 확인

---

## ⚡ 방법 2: GitHub CLI

### STEP 1: GitHub CLI 설치

**Windows:**
```bash
# winget 사용
winget install --id GitHub.cli

# 또는 Scoop
scoop install gh
```

**Mac:**
```bash
brew install gh
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install gh

# Fedora
sudo dnf install gh
```

### STEP 2: GitHub 로그인
```bash
gh auth login
```

질문에 답변:
1. **What account do you want to log into?** → GitHub.com
2. **What is your preferred protocol?** → HTTPS
3. **Authenticate Git with your GitHub credentials?** → Yes
4. **How would you like to authenticate?** → Login with a web browser

→ 브라우저에서 코드 입력 후 로그인

### STEP 3: 저장소 생성 및 Push
```bash
# GitHub에 저장소 생성 (public)
gh repo create travel-app --public --source=. --remote=origin --push
```

**한 줄로 끝!** 🎉

---

## 🔐 방법 3: Personal Access Token (수동)

### STEP 1: Token 생성

1. GitHub.com 로그인
2. 우측 상단 프로필 → **Settings** 클릭
3. 좌측 메뉴 맨 아래 **"Developer settings"** 클릭
4. **"Personal access tokens"** → **"Tokens (classic)"** 클릭
5. **"Generate new token"** → **"Generate new token (classic)"**

### STEP 2: Token 설정

1. **Note**: `Vercel Deploy Token` 입력
2. **Expiration**: 90 days (또는 원하는 기간)
3. **Select scopes**에서 체크:
   - ✅ **repo** (전체 체크)
   - ✅ **workflow**
4. 아래로 스크롤하여 **"Generate token"** 클릭

### STEP 3: Token 복사
⚠️ **중요**: Token은 **한 번만** 표시됩니다! 복사해두세요!

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

→ 메모장이나 안전한 곳에 저장

### STEP 4: Token으로 Push

#### 4-1. 캐시된 자격증명 제거 (Windows)
```bash
# 자격증명 관리자에서 제거
git credential-manager-core erase
```

#### 4-2. Push 시도
```bash
git push -u origin main
```

#### 4-3. 로그인 창이 뜨면:
- **Username**: GitHub 아이디
- **Password**: 생성한 Token 붙여넣기 (비밀번호 아님!)

---

## 🎯 추천 순서

### 가장 쉬운 순서:
1. **GitHub Desktop** 사용 ⭐⭐⭐ (클릭만!)
2. **GitHub CLI** 사용 ⭐⭐ (터미널 좋아하면)
3. **Personal Access Token** ⭐ (수동)

---

## ✅ GitHub Desktop 상세 가이드

### 처음 설치 후:

1. **GitHub Desktop 실행**
2. **File** → **Options** → **Accounts**
3. **Sign in** 클릭
4. 브라우저에서 로그인 완료

### 프로젝트 추가:

1. **File** → **Add Local Repository**
2. **Choose...** 클릭
3. 프로젝트 폴더 선택
4. **Add Repository**

### 변경사항 확인:

좌측에 모든 변경된 파일 목록이 보입니다:
- ✅ App.tsx
- ✅ package.json
- ✅ public/manifest.json
- 등등...

### Commit 생성:

1. 좌측 하단 **Summary** 입력: "Initial commit"
2. **Commit to main** 버튼 클릭

### GitHub에 Push:

1. 상단 **Publish repository** 버튼 클릭
2. Repository name 확인: `travel-app`
3. **Keep this code private** 체크 해제 (Public)
4. **Publish repository** 클릭

**완료!** 🎊

---

## 🐛 문제 해결

### "Repository not found"
- 저장소 이름 확인
- Public/Private 설정 확인
- GitHub 로그인 상태 확인

### "Authentication failed"
- Token이 만료되지 않았는지 확인
- Token에 필요한 권한(repo)이 있는지 확인
- Token을 정확히 복사했는지 확인

### "Could not read from remote repository"
- SSH 대신 HTTPS 사용:
```bash
git remote set-url origin https://github.com/YOUR-USERNAME/travel-app.git
```

### GitHub Desktop에서 "Failed to publish"
- 로그아웃 후 재로그인
- Settings → Accounts → Sign out → Sign in

---

## 📱 GitHub Desktop 추가 기능

### 장점:
- ✅ 파일 변경사항 시각적으로 확인
- ✅ Diff 비교 쉬움
- ✅ Branch 관리 쉬움
- ✅ Pull Request 생성 가능
- ✅ 충돌 해결 GUI로 쉽게
- ✅ History 보기 편함

### 추후 업데이트할 때:
1. 파일 수정
2. GitHub Desktop 열기
3. 변경사항 확인
4. Commit 메시지 작성
5. **Commit to main** 클릭
6. **Push origin** 클릭
→ Vercel 자동 재배포! 🚀

---

## 🎊 추천!

**가장 쉬운 방법: GitHub Desktop**

1. 다운로드: [desktop.github.com](https://desktop.github.com)
2. 설치 및 로그인
3. 프로젝트 추가
4. Publish repository
5. 완료!

**시간**: 약 3분
**난이도**: ⭐ (매우 쉬움)
**추천도**: ⭐⭐⭐⭐⭐

---

**지금 GitHub Desktop을 설치하시겠어요?** 🎯

아니면 GitHub CLI나 Token 방식을 원하시나요?
