# PWA 설정 가이드 ✨

## 🎉 PWA 변환 완료!

여행 앱이 이제 **Progressive Web App (PWA)**로 작동합니다! 실제 휴대폰에서 앱처럼 사용할 수 있습니다.

## 📱 설치 방법

### Android (Chrome, Samsung Internet)
1. 웹사이트 접속
2. 주소창에 **"홈 화면에 추가"** 팝업이 나타남
3. 또는 브라우저 메뉴 → "홈 화면에 추가" 선택
4. 설치 완료! 앱 아이콘이 홈 화면에 추가됨

### iPhone (Safari)
1. Safari에서 웹사이트 접속
2. 하단의 **공유 버튼 (□↑)** 탭
3. **"홈 화면에 추가"** 선택
4. "추가" 탭
5. 설치 완료! 앱 아이콘이 홈 화면에 추가됨

## ✨ PWA 기능

### 현재 구현된 기능
- ✅ **홈 화면 설치**: 앱 아이콘으로 바로 실행
- ✅ **전체 화면 모드**: 브라우저 주소창 없이 실행
- ✅ **오프라인 지원**: 네트워크 없이도 기본 기능 사용 가능
- ✅ **캐싱 전략**: 
  - API 호출: Network First (최신 데이터 우선)
  - 정적 파일: Cache First (빠른 로딩)
- ✅ **자동 업데이트**: 새 버전 자동 감지 및 업데이트
- ✅ **푸시 알림 준비**: 알림 기능 기본 설정 완료
- ✅ **Android 설치 프롬프트**: 자동으로 설치 안내 표시
- ✅ **iOS 설치 가이드**: iPhone 사용자를 위한 설치 안내

### 테마 및 디자인
- 테마 컬러: **인디고 (#6366F1)**
- 앱 이름: "Escape the Ordinary - 여행 추천 앱"
- 짧은 이름: "여행앱"
- 화면 방향: 세로 모드 (Portrait)

## 🚀 배포 방법

### Vercel로 배포 (추천)
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

### Netlify로 배포
```bash
# 1. Netlify CLI 설치
npm i -g netlify-cli

# 2. 로그인
netlify login

# 3. 배포
netlify deploy

# 4. 프로덕션 배포
netlify deploy --prod
```

## 🎨 아이콘 커스터마이징

현재 기본 아이콘이 설정되어 있습니다. 실제 앱 아이콘으로 교체하려면:

1. **192x192px** 크기의 PNG 파일을 `/public/icon-192.png`로 저장
2. **512x512px** 크기의 PNG 파일을 `/public/icon-512.png`로 저장

### 아이콘 디자인 팁
- 배경색: 투명 또는 흰색
- 여백: 10-15% 권장
- 심플한 디자인 (작은 화면에서도 선명하게)
- PNG 형식, 정사각형

## 📊 PWA 기능 테스트

### Chrome DevTools에서 확인
1. F12 (개발자 도구 열기)
2. **Application** 탭
3. **Service Workers** 확인
4. **Manifest** 확인
5. **Cache Storage** 확인

### Lighthouse 점수 확인
1. F12 → **Lighthouse** 탭
2. "Progressive Web App" 선택
3. "Generate report" 클릭
4. PWA 점수 확인

## 🔧 문제 해결

### Service Worker가 등록되지 않을 때
- HTTPS 필수 (localhost는 예외)
- 브라우저 캐시 삭제
- 시크릿 모드로 테스트

### 앱이 업데이트되지 않을 때
```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

### iOS에서 설치가 안 될 때
- Safari 브라우저 사용 필수
- Chrome/Firefox는 iOS에서 홈 화면 추가 불가
- Private 모드 해제 필요

## 📝 향후 추가 가능한 기능

### 1. 푸시 알림
```javascript
// utils/pwa.ts에 이미 기본 코드 포함
requestNotificationPermission();
```

### 2. 백그라운드 동기화
- 오프라인에서 저장한 데이터를 온라인 시 자동 동기화

### 3. 앱 스토어 등록
- PWABuilder 사용하여 Microsoft Store, Google Play 등록 가능
- https://www.pwabuilder.com/

### 4. Web Share API
- 여행 코스를 다른 사람에게 공유

## 🎯 성능 최적화

현재 적용된 최적화:
- ✅ Service Worker 캐싱
- ✅ Lazy Loading (React.lazy)
- ✅ 이미지 최적화 (ImageWithFallback)
- ✅ 코드 스플리팅
- ✅ 압축된 에셋

## 📱 테스트 체크리스트

배포 후 확인할 사항:
- [ ] 홈 화면에 앱 추가 가능
- [ ] 전체 화면 모드로 실행
- [ ] 오프라인에서 기본 페이지 로딩
- [ ] 아이콘이 제대로 표시됨
- [ ] 스플래시 스크린이 보임 (Android)
- [ ] 테마 컬러가 상태바에 적용됨

## 💡 참고 자료

- [PWA 체크리스트](https://web.dev/pwa-checklist/)
- [Service Worker 가이드](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Web App Manifest](https://web.dev/add-manifest/)

---

**축하합니다! 🎉**
이제 여행 앱을 실제 모바일 앱처럼 사용할 수 있습니다!
