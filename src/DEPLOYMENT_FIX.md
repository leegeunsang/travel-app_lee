# 배포 문제 해결 가이드 🔧

## 문제 상황
PWA 변환 작업 후 배포된 사이트가 이전과 다르게 표시되는 문제

## 해결된 문제들

### 1. ✅ 빌드 디렉토리 설정 복구
- `vite.config.ts`의 `outDir`을 'dist'에서 'build'로 복구
- `netlify.toml`의 publish 디렉토리도 'build'로 복구

### 2. ✅ Service Worker 중복 등록 제거
- `App.tsx`에서 `registerServiceWorker` 호출 제거
- `main.tsx`에서만 Service Worker 등록하도록 단일화

### 3. ✅ Service Worker 캐시 버전 업데이트
- 캐시 이름을 'travel-app-v3'로 업데이트하여 이전 캐시 무효화

## 📋 재배포 체크리스트

### 1단계: 로컬에서 빌드 테스트
```bash
# 빌드 테스트
npm run build

# 빌드된 파일 확인
ls -la build/

# 로컬에서 프리뷰
npm run preview
```

### 2단계: 배포
```bash
# Vercel 배포
vercel --prod

# 또는 Netlify 배포
netlify deploy --prod
```

### 3단계: 배포 후 확인
1. 배포된 URL 접속
2. **중요: 브라우저 캐시 완전 삭제**

## 🔄 브라우저 캐시 삭제 방법

### Chrome (Desktop)
1. `Ctrl + Shift + Delete` (Windows) 또는 `Cmd + Shift + Delete` (Mac)
2. "캐시된 이미지 및 파일" 선택
3. "데이터 삭제" 클릭

### Chrome (Mobile)
1. 설정 → 개인정보 보호 및 보안
2. 인터넷 사용 기록 삭제
3. "캐시된 이미지 및 파일" 선택
4. "데이터 삭제" 탭

### Safari (iPhone)
1. 설정 → Safari
2. "방문 기록 및 웹사이트 데이터 지우기" 탭

### 개발자 도구로 강력 새로고침
1. F12 (개발자 도구 열기)
2. 네트워크 탭 열기
3. "캐시 비활성화" 체크박스 선택
4. `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)

## 🚨 Service Worker 완전 제거 방법

만약 캐시 문제가 계속되면:

### Chrome DevTools에서 Service Worker 제거
1. F12 (개발자 도구)
2. **Application** 탭
3. 왼쪽 메뉴에서 **Service Workers** 선택
4. "Unregister" 버튼 클릭
5. **Storage** → **Clear site data** 클릭
6. 페이지 새로고침

### 브라우저 콘솔에서 직접 제거
```javascript
// 콘솔에 붙여넣기
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  console.log('All service workers unregistered');
  location.reload();
});
```

## 🔍 문제 진단

### 현재 Service Worker 상태 확인
F12 → Application → Service Workers에서 확인:
- 🟢 **Activated and running**: 정상
- 🟡 **Installing**: 새 버전 설치 중
- 🔴 **Redundant**: 이전 버전 (삭제 필요)

### 캐시 확인
F12 → Application → Cache Storage:
- `travel-app-v3`가 최신 버전입니다
- `travel-app-v1`, `travel-app-v2`는 자동으로 삭제됩니다

## ✅ 정상 작동 확인

배포 후 다음을 확인하세요:

1. **홈 페이지**
   - ✅ 히어로 이미지가 보임
   - ✅ "Escape the Ordinary!!!" 제목 표시
   - ✅ 검색 바가 하단에 표시
   - ✅ 인기 여행지 카드가 보임

2. **검색 페이지**
   - ✅ 검색 아이콘과 입력창이 정렬됨
   - ✅ 전국 관광지 목록이 표시됨

3. **PWA 기능**
   - ✅ 설치 프롬프트가 표시됨 (Android)
   - ✅ iOS 설치 가이드가 표시됨 (iPhone)
   - ✅ 앱으로 설치 가능

4. **하단 네비게이션**
   - ✅ 5개 메뉴가 정렬되어 표시됨
   - ✅ 현재 페이지가 하이라이트됨

## 🎨 디자인 확인 포인트

### 색상 테마
- Primary: 인디고 (#6366F1)
- Secondary: 앰버/오렌지
- Background: 밝은 그라데이션

### 레이아웃
- 최대 너비: 412px (Galaxy S25 Ultra)
- 모바일 최적화
- 카드 라운드: rounded-3xl
- 그림자: shadow-2xl

## 💡 추가 팁

### PWA 설치 테스트
1. Android Chrome에서 접속
2. 주소창에 설치 아이콘 확인
3. 또는 자동 팝업 확인
4. 설치 후 홈 화면에서 앱 실행

### 오프라인 모드 테스트
1. 앱 접속
2. 개발자 도구 → Network → Offline 체크
3. 페이지 새로고침
4. 기본 페이지가 로드되는지 확인

## 📞 여전히 문제가 있다면

1. **완전 새로고침**: `Ctrl + Shift + R`
2. **시크릿 모드**: 새 시크릿 창에서 테스트
3. **다른 브라우저**: Firefox, Safari 등에서 테스트
4. **모바일 실제 기기**: 데스크톱과 다를 수 있음

---

**중요**: 배포 후 반드시 브라우저 캐시를 삭제하고 강력 새로고침을 해야 변경사항이 반영됩니다! 🔄
