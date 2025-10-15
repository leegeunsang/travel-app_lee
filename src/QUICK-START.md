# ⚡ 빠른 배포 가이드 (5분)

## 🚀 가장 빠른 방법: Vercel

### 1단계: GitHub 준비 (1분)
```bash
git init
git add .
git commit -m "PWA ready"
git branch -M main
```

### 2단계: GitHub에 푸시 (1분)
1. GitHub.com에서 새 저장소 생성
2. 터미널에서:
```bash
git remote add origin https://github.com/YOUR-USERNAME/travel-app.git
git push -u origin main
```

### 3단계: Vercel 배포 (2분)
1. [vercel.com](https://vercel.com) 접속
2. GitHub로 로그인
3. "New Project" 클릭
4. 저장소 선택
5. 환경 변수 추가:
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENWEATHER_API_KEY
   TOUR_API_KEY
   ```
6. "Deploy" 클릭

### 4단계: 완료! (1분)
- 배포 완료 후 URL 확인
- 모바일에서 접속
- "홈 화면에 추가" 클릭

---

## 📱 모바일 테스트

### Android/Chrome
1. 배포된 URL 접속
2. 화면 하단 "앱으로 설치하기" 클릭
3. 홈 화면에서 앱 실행

### iOS/Safari
1. 배포된 URL 접속
2. 공유 버튼 (⬆️) → "홈 화면에 추가"
3. 홈 화면에서 앱 실행

---

## ✅ 체크리스트

- [ ] GitHub에 푸시
- [ ] Vercel에서 배포
- [ ] 환경 변수 설정
- [ ] 모바일에서 설치 테스트
- [ ] 오프라인 모드 확인

---

**더 자세한 가이드가 필요하면 `DEPLOYMENT-GUIDE.md`를 확인하세요!**
