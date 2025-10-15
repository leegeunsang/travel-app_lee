# 📱 여행 추천 앱 - PWA 가이드

이 앱은 이제 **Progressive Web App (PWA)**로 작동합니다!

## ✅ PWA 기능

### 1. 홈 화면에 설치
- **Android/Windows**: 브라우저 메뉴에서 "홈 화면에 추가" 또는 "설치" 선택
- **iOS (Safari)**: 공유 버튼 → "홈 화면에 추가"
- 앱처럼 아이콘이 생성되며 전체 화면으로 실행됩니다

### 2. 오프라인 작동
- 인터넷 연결이 없어도 앱 실행 가능
- 이전에 방문한 페이지는 오프라인에서도 표시

### 3. 빠른 로딩
- Service Worker가 파일을 캐싱하여 빠른 로딩 속도

### 4. 푸시 알림 (추후 추가 가능)
- 여행 추천, 일정 알림 등을 받을 수 있습니다

## 🚀 배포 방법

### Vercel로 배포 (추천)
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

### Netlify로 배포
```bash
# 1. Netlify CLI 설치
npm i -g netlify-cli

# 2. 배포
netlify deploy

# 3. 프로덕션 배포
netlify deploy --prod
```

## 📱 테스트 방법

### 로컬에서 PWA 테스트
1. HTTPS가 필요하므로 로컬에서는 `localhost`만 작동
2. Chrome DevTools → Application → Service Workers에서 확인
3. Lighthouse로 PWA 점수 확인

### 모바일에서 테스트
1. 앱을 HTTPS로 배포 (Vercel/Netlify)
2. 모바일 브라우저로 접속
3. "홈 화면에 추가" 프롬프트 확인
4. 설치 후 앱처럼 실행되는지 확인

## 🎨 커스터마이징

### 앱 아이콘 변경
1. `/public/icon-192.png` (192x192px)
2. `/public/icon-512.png` (512x512px)
실제 PNG 이미지로 교체하세요

### 앱 이름 및 색상
`/public/manifest.json` 파일에서 수정:
- `name`: 앱 전체 이름
- `short_name`: 홈 화면에 표시될 짧은 이름
- `theme_color`: 앱 테마 색상
- `background_color`: 스플래시 화면 배경색

## 🔧 Service Worker 업데이트

코드를 수정한 후:
1. `/public/sw.js`의 `CACHE_NAME` 버전 업데이트
2. 사용자가 앱을 새로고침하면 자동 업데이트

## 📊 PWA 체크리스트

✅ HTTPS 배포 (Vercel/Netlify)
✅ manifest.json 추가
✅ Service Worker 등록
✅ 앱 아이콘 (192x192, 512x512)
✅ 반응형 디자인 (갤럭시 S25 울트라 최적화)
✅ 오프라인 지원
⚠️ 푸시 알림 (선택사항)
⚠️ 백그라운드 동기화 (선택사항)

## 🎯 다음 단계

1. **배포**: Vercel이나 Netlify에 배포
2. **테스트**: 모바일에서 설치 및 테스트
3. **공유**: URL을 사람들과 공유
4. **개선**: 사용자 피드백 수집

## 💡 팁

- iOS Safari는 PWA 기능이 제한적입니다
- Android Chrome이 PWA 지원이 가장 좋습니다
- 실제 앱스토어 등록이 필요하면 Capacitor 사용을 고려하세요

---

**문제가 있나요?**
- Chrome DevTools → Application → Manifest 확인
- Service Worker 등록 확인
- HTTPS 배포 확인
