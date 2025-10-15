# 🚀 PWA 배포 가이드

여행 추천 앱을 실제 PWA로 배포하는 완전한 가이드입니다.

---

## 📋 배포 전 체크리스트

### 1. 아이콘 이미지 준비 ✅
현재 placeholder SVG를 사용 중입니다. 실제 PNG 이미지로 교체하세요:

**필요한 파일:**
- `/public/icon-192.png` (192x192px)
- `/public/icon-512.png` (512x512px)

**아이콘 생성 도구:**
- [Figma](https://figma.com) - 아이콘 디자인
- [Canva](https://canva.com) - 온라인 디자인
- [RealFaviconGenerator](https://realfavicongenerator.net) - 자동 생성

### 2. 환경 변수 설정 ✅
배포 플랫폼에서 다음 환경 변수를 설정하세요:

```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENWEATHER_API_KEY=your-openweather-key
TOUR_API_KEY=your-tour-api-key
KAKAO_REST_API_KEY=your-kakao-key (선택사항)
KAKAO_JAVASCRIPT_KEY=your-kakao-js-key (선택사항)
```

---

## 🎯 배포 방법 (3가지)

### 방법 1: Vercel (추천! ⭐)

#### A. GitHub 사용
1. **GitHub에 코드 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/travel-app.git
   git push -u origin main
   ```

2. **Vercel 연결**
   - [vercel.com](https://vercel.com) 접속
   - "New Project" 클릭
   - GitHub 저장소 연결
   - 환경 변수 설정
   - "Deploy" 클릭

3. **자동 배포 완료!** 🎉

#### B. CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 추가
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add OPENWEATHER_API_KEY

# 프로덕션 배포
vercel --prod
```

**배포 시간:** 약 2-3분
**URL 형식:** `https://your-app.vercel.app`

---

### 방법 2: Netlify

#### A. GitHub 사용
1. **GitHub에 코드 푸시** (위와 동일)

2. **Netlify 연결**
   - [netlify.com](https://netlify.com) 접속
   - "New site from Git" 클릭
   - GitHub 저장소 연결
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - 환경 변수 설정
   - "Deploy site" 클릭

#### B. CLI 사용
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

**배포 시간:** 약 2-3분
**URL 형식:** `https://your-app.netlify.app`

---

### 방법 3: GitHub Pages (무료)

1. **package.json 수정**
   ```json
   {
     "homepage": "https://your-username.github.io/travel-app"
   }
   ```

2. **배포**
   ```bash
   npm run build
   
   # gh-pages 브랜치에 배포
   npx gh-pages -d dist
   ```

3. **GitHub 설정**
   - 저장소 Settings → Pages
   - Source: gh-pages branch
   - Save

**배포 시간:** 약 5-10분
**URL 형식:** `https://your-username.github.io/travel-app`

---

## 📱 배포 후 PWA 테스트

### 1. 모바일에서 테스트 (Android)
1. **Chrome으로 접속**
   - 배포된 URL 열기
   
2. **설치 프롬프트 확인**
   - 하단에 "앱으로 설치하기" 배너 표시
   - 또는 메뉴 → "홈 화면에 추가"

3. **설치 후 확인**
   - 홈 화면에 아이콘 생성
   - 앱처럼 전체 화면으로 실행
   - 주소창 없음

### 2. 모바일에서 테스트 (iOS)
1. **Safari로 접속**
   - 배포된 URL 열기
   
2. **홈 화면에 추가**
   - 공유 버튼 (⬆️) 클릭
   - "홈 화면에 추가" 선택
   - "추가" 클릭

3. **설치 후 확인**
   - 홈 화면에 아이콘 생성
   - 앱처럼 실행

### 3. 데스크톱에서 테스트 (Chrome)
1. **Chrome으로 접속**
   
2. **설치**
   - 주소창 오른쪽 "설치" 아이콘 클릭
   - 또는 메뉴 → "앱 설치"

3. **실행**
   - 독립된 창으로 실행

---

## 🔧 PWA 점수 확인

### Chrome Lighthouse
1. **Chrome DevTools 열기** (F12)
2. **Lighthouse 탭** 클릭
3. **카테고리 선택**
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
4. **"Generate report"** 클릭

### 목표 점수
- 🎯 PWA: 90점 이상
- 🎯 Performance: 80점 이상
- 🎯 Accessibility: 90점 이상

---

## 🐛 문제 해결

### "Service Worker 등록 실패"
- ✅ HTTPS로 배포되었는지 확인
- ✅ `/public/sw.js` 파일이 있는지 확인
- ✅ 브라우저 캐시 삭제 후 재시도

### "설치 프롬프트가 안 뜸"
- ✅ HTTPS 필수
- ✅ manifest.json 유효성 확인
- ✅ Service Worker 등록 확인
- ✅ 아이콘 파일 존재 확인

### "오프라인 작동 안 함"
- ✅ Service Worker 활성화 확인
- ✅ 캐시 전략 확인
- ✅ Chrome DevTools → Application → Cache Storage 확인

---

## 📊 배포 플랫폼 비교

| 기능 | Vercel | Netlify | GitHub Pages |
|------|--------|---------|--------------|
| 배포 속도 | ⚡⚡⚡ | ⚡⚡⚡ | ⚡⚡ |
| 무료 플랜 | 무제한 | 무제한 | 무제한 |
| 자동 HTTPS | ✅ | ✅ | ✅ |
| 환경 변수 | ✅ | ✅ | ❌ |
| Edge Functions | ✅ | ✅ | ❌ |
| 커스텀 도메인 | ✅ | ✅ | ✅ |
| 분석 | ✅ | ✅ | ❌ |
| 추천 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 🎨 추가 개선 사항

### 1. 실제 앱 아이콘 만들기
```bash
# 아이콘 디자인 후
# Figma → Export → PNG
# 192x192, 512x512 사이즈로 내보내기
```

### 2. 스플래시 스크린 추가
`/public/manifest.json` 수정:
```json
{
  "icons": [
    {
      "src": "/splash-640x1136.png",
      "sizes": "640x1136",
      "type": "image/png"
    }
  ]
}
```

### 3. 푸시 알림 추가 (선택사항)
- Firebase Cloud Messaging 연동
- 여행 추천 알림
- 일정 리마인더

### 4. 커스텀 도메인 연결
- Vercel: Settings → Domains
- Netlify: Domain settings → Custom domains
- 예: `travel.myapp.com`

---

## 📱 최종 체크리스트

배포 전:
- [ ] 아이콘 이미지 교체 (PNG)
- [ ] 환경 변수 설정
- [ ] manifest.json 앱 이름 수정
- [ ] 테마 색상 확인

배포 후:
- [ ] HTTPS 접속 확인
- [ ] PWA 설치 테스트 (Android)
- [ ] PWA 설치 테스트 (iOS)
- [ ] Lighthouse 점수 확인
- [ ] 오프라인 작동 테스트
- [ ] 환경 변수 작동 확인

---

## 🎉 완료!

축하합니다! 이제 여행 추천 앱이 실제 PWA로 작동합니다!

**다음 단계:**
1. 친구들과 공유하기
2. 피드백 수집하기
3. 기능 개선하기
4. 앱스토어 등록 고려 (Capacitor 사용)

**문제가 있나요?**
- Chrome DevTools 확인
- 배포 로그 확인
- 환경 변수 확인

**성공하셨나요?** 🚀
- URL을 공유하세요!
- 사용자 피드백을 받으세요!
