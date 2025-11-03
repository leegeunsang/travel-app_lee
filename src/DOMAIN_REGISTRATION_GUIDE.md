# 🔧 카카오맵 도메인 등록 가이드

## 문제 증상

- `window.kakao is undefined` 에러
- 지도가 표시되지 않음
- 콘솔에 "SDK failed to load" 메시지

## 원인

**카카오맵 API는 보안을 위해 등록된 도메인에서만 작동합니다.**

스크립트 태그가 있고 네트워크 요청이 성공해도, 도메인이 등록되지 않으면 `window.kakao` 객체가 생성되지 않습니다.

## 해결 방법 (5분 소요)

### 1단계: 현재 도메인 확인

앱을 실행한 후 브라우저 주소창을 확인하거나, 진단 도구(🔧 버튼)에서 도메인을 복사하세요.

예시:
- `https://your-app.vercel.app`
- `http://localhost:3000`
- `https://figma-make-preview.com`

### 2단계: 카카오 개발자 콘솔 접속

1. https://developers.kakao.com/ 접속
2. 카카오 계정으로 로그인

### 3단계: 애플리케이션 선택

1. "내 애플리케이션" 메뉴 클릭
2. 기존 앱 선택 또는 새로 만들기

### 4단계: Web 플랫폼 등록

1. 좌측 메뉴에서 **"플랫폼"** 클릭
2. **"Web 플랫폼 등록"** 버튼 클릭 (또는 기존 플랫폼 수정)
3. 사이트 도메인에 다음을 추가:

   ```
   http://localhost
   http://localhost:3000
   https://your-actual-domain.com
   ```

   **주의사항:**
   - `http://` 또는 `https://` 프로토콜 포함 필수
   - 포트 번호가 있으면 포함 (예: `:3000`)
   - 경로는 포함하지 않음 (예: `/path`는 제외)

### 5단계: 저장 및 확인

1. **"저장"** 버튼 클릭
2. 앱으로 돌아가서 **페이지 새로고침** (Ctrl+F5 또는 Cmd+Shift+R)
3. 진단 도구(🔧 버튼)로 다시 확인

## 체크리스트

- [ ] 카카오 개발자 콘솔에 로그인
- [ ] 내 애플리케이션 선택
- [ ] 플랫폼 → Web 플랫폼 등록
- [ ] 현재 도메인 추가
- [ ] `http://localhost` 추가
- [ ] 저장
- [ ] 페이지 새로고침 (캐시 삭제: Ctrl+Shift+R)
- [ ] 🔧 진단 도구로 확인

## 등록 예시

### 로컬 개발 환경
```
http://localhost
http://localhost:3000
http://localhost:5173
http://127.0.0.1
http://127.0.0.1:3000
```

### 배포 환경
```
https://my-app.vercel.app
https://my-app.netlify.app
https://example.com
https://www.example.com
```

## 여전히 작동하지 않는 경우

1. **브라우저 캐시 완전히 삭제**
   - Chrome: Ctrl+Shift+Delete → 전체 기간 → 캐시된 이미지 및 파일
   
2. **시크릿/프라이빗 모드에서 테스트**
   - 확장 프로그램/애드 블로커 영향 제거

3. **다른 브라우저에서 테스트**
   - Chrome, Firefox, Safari, Edge

4. **API 키 확인**
   - 카카오 개발자 콘솔 → 앱 설정 → 앱 키
   - JavaScript 키가 올바른지 확인
   - 키가 활성화되어 있는지 확인

5. **네트워크 탭 확인**
   - F12 → Network 탭
   - `dapi.kakao.com` 요청이 200 OK인지 확인
   - 실패하면 네트워크 문제

6. **진단 도구 실행**
   - 앱 우측 하단 🔧 버튼 클릭
   - 모든 진단 항목 확인
   - 에러 메시지 확인

## 추가 도움말

- [카카오맵 API 공식 문서](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 포럼](https://devtalk.kakao.com/)
- 프로젝트 내 `KAKAO_API_SETUP.md` 참고
