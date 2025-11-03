# 개발 모드 가이드

## 개요

Figma Make 또는 개발 환경에서 GPS 위치 접근이 불가능한 경우를 위한 개발 모드가 구현되어 있습니다.

## 작동 방식

### 자동 감지

다음 조건 중 하나라도 충족되면 개발 모드가 자동으로 활성화됩니다:

1. 환경 변수 `VITE_USE_DEFAULT_LOCATION`이 `'true'`로 설정된 경우
2. 호스트명에 'figma' 또는 'preview'가 포함된 경우 (Figma Make 환경)

```typescript
const isDevelopment = import.meta.env.VITE_USE_DEFAULT_LOCATION === 'true';
const isFigmaPreview = window.location.hostname.includes('figma') || 
                       window.location.hostname.includes('preview');
```

### 기본 위치

개발 모드에서는 다음의 기본 위치가 사용됩니다:
- **위치**: 서울시청 (Seoul City Hall)
- **좌표**: 위도 37.5665, 경도 126.9780
- **지역**: 서울

## 사용자 경험

### 1. SearchPage
- 개발 모드 활성화 시 상단에 노란색 배너 표시
- "현재 위치에서 찾기" 버튼 클릭 시 서울로 자동 설정
- Toast 알림으로 개발 모드 상태 표시

### 2. 위치 기능
- `getCurrentPosition()`: 실제 GPS 대신 서울 좌표 반환
- `coordsToAddress()`: 서버를 통해 서울 주소 정보 반환
- 에러 없이 정상 작동

## 실제 배포

실제 서비스 배포 시에는 다음 사항을 확인하세요:

### 1. 환경 변수 제거
`.env` 파일에서 `VITE_USE_DEFAULT_LOCATION` 제거 또는 false로 설정:
```
# 개발 시
VITE_USE_DEFAULT_LOCATION=true

# 배포 시
# VITE_USE_DEFAULT_LOCATION=true  <- 주석 처리 또는 삭제
```

### 2. 도메인 확인
- 배포된 도메인이 'figma' 또는 'preview'를 포함하지 않는지 확인
- 커스텀 도메인 사용 권장 (예: myapp.com)

### 3. 위치 권한
- HTTPS 환경에서만 GPS 위치 기능 작동
- 브라우저 위치 권한 요청 UI 테스트
- 위치 거부 시 대체 UI(지역 선택) 제공

## 테스트

### 개발 모드 테스트
1. Figma Make에서 앱 실행
2. SearchPage에서 개발 모드 배너 확인
3. "현재 위치에서 찾기" 버튼 클릭
4. 서울로 자동 설정되는지 확인

### 실제 위치 기능 테스트
1. 로컬 개발 서버 실행 (HTTPS)
2. `VITE_USE_DEFAULT_LOCATION` 제거 또는 false 설정
3. 브라우저에서 위치 권한 허용
4. 실제 GPS 위치가 잘 반영되는지 확인

## 트러블슈팅

### 개발 모드가 작동하지 않는 경우
1. 브라우저 콘솔 확인: `[Geolocation] Using default location...` 로그 확인
2. 환경 변수 확인: `console.log(import.meta.env.VITE_USE_DEFAULT_LOCATION)`
3. 호스트명 확인: `console.log(window.location.hostname)`

### 실제 배포에서 개발 모드가 활성화되는 경우
1. `.env` 파일 확인 후 `VITE_USE_DEFAULT_LOCATION` 제거
2. 빌드 재실행: `npm run build`
3. 캐시 삭제 후 재배포

## 파일 위치

- 위치 로직: `/utils/geolocation.ts`
- 개발 모드 UI: `/components/SearchPage.tsx`
- 가이드 문서: `/DEV_MODE_GUIDE.md`
