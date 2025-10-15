# 🔧 GitHub Desktop 파일 안 보이는 문제 해결

## 🚨 문제
GitHub Desktop에서 프로젝트를 추가했는데 왼쪽에 파일 목록이 안 보입니다.

## ✅ 해결 방법

### 방법 1: GitHub Desktop에서 저장소 생성 (추천!)

#### STEP 1: 프로젝트 폴더 다시 추가
1. GitHub Desktop에서 **File** → **Add Local Repository** 클릭
2. **Choose...** 버튼 클릭
3. 프로젝트 폴더 선택
4. **"Add Repository"** 클릭

#### STEP 2: "This directory does not appear..." 메시지가 뜨면
아래 메시지가 보일 겁니다:
```
This directory does not appear to be a Git repository.
Would you like to create a repository here instead?
```

**"create a repository"** 링크 클릭!

#### STEP 3: Create Repository 화면
1. **Name**: `travel-app` (자동으로 입력됨)
2. **Description**: `AI 기반 맞춤형 여행 추천 PWA`
3. **Git Ignore**: None (또는 Node 선택)
4. **License**: None
5. ⚠️ **Initialize this repository with a README**: **체크 해제**

**"Create Repository"** 버튼 클릭!

#### STEP 4: 파일 목록 확인
이제 왼쪽에 **모든 파일**이 보입니다! ✅
- App.tsx
- package.json
- vercel.json
- components/
- public/
- ... (모든 파일)

---

### 방법 2: 터미널에서 Git 초기화 후 GitHub Desktop 사용

#### STEP 1: 터미널 열기
프로젝트 폴더에서 터미널 열기

#### STEP 2: Git 초기화
```bash
git init
git add .
git commit -m "Initial commit"
```

#### STEP 3: GitHub Desktop에서 다시 추가
1. **File** → **Add Local Repository**
2. 프로젝트 폴더 선택
3. 이제 파일이 보임! ✅

---

## 📱 다음 단계: Publish Repository

파일이 보이면:

### STEP 1: 상단 확인
상단 중앙에 **"Publish repository"** 버튼이 보여야 합니다.

### STEP 2: Publish
1. **"Publish repository"** 버튼 클릭
2. Name: `travel-app`
3. Description: `AI 기반 맞춤형 여행 추천 PWA`
4. ⚠️ **Keep this code private**: **체크 해제** (Public!)
5. **"Publish repository"** 클릭

### STEP 3: 업로드 완료
- "Publishing repository..." 진행바
- "Published successfully!" 완료 메시지
- GitHub에 업로드 완료! 🎉

---

## 🎯 현재 상황별 해결책

### 상황 1: "Add Local Repository" 후 아무것도 안 보임
→ **"create a repository"** 링크 클릭

### 상황 2: "No local changes" 메시지
→ 이미 커밋되어 있음. 바로 "Publish repository" 진행

### 상황 3: "Cannot find repository" 에러
→ 올바른 폴더를 선택했는지 확인

### 상황 4: 파일은 보이는데 "Publish" 버튼 없음
→ 먼저 Commit 생성:
  1. 하단 Summary: "Initial commit"
  2. "Commit to main" 클릭
  3. 상단 "Push origin" 버튼 클릭

---

## 📸 스크린샷 참고

### 정상적인 화면:
```
┌─────────────────────────────────────────┐
│  GitHub Desktop                         │
│  Current Repository: travel-app         │
│  [Publish repository] 버튼              │
├─────────────────────────────────────────┤
│ Changes (90)                           │
│ ☑ App.tsx                              │
│ ☑ package.json                         │
│ ☑ vercel.json                          │
│ ☑ components/                          │
│ ☑ public/                              │
│   ... (더 많은 파일)                    │
└─────────────────────────────────────────┘
```

---

## ✅ 체크리스트

- [ ] GitHub Desktop 열기
- [ ] File → Add Local Repository
- [ ] 프로젝트 폴더 선택
- [ ] "create a repository" 클릭
- [ ] Create Repository 완료
- [ ] 왼쪽에 파일 90+ 개 보임
- [ ] "Publish repository" 버튼 보임

---

**지금 어떤 상황인가요?**
1. "This directory does not appear..." 메시지가 보이나요?
2. 파일 목록이 보이나요?
3. "Publish repository" 버튼이 보이나요?

현재 상황을 알려주시면 정확하게 도와드리겠습니다! 💪
