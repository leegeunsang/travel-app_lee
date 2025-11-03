# 🌤️ OpenWeather API 키 설정 가이드

## 🚨 현재 문제

다음 에러가 발생하고 있습니다:

```
[Weather API] Status: 401 Unauthorized
{"cod":401, "message": "Invalid API key"}
```

이는 **OPENWEATHER_API_KEY가 유효하지 않거나 설정되지 않았음**을 의미합니다.

---

## ✅ 빠른 해결 방법 (5분)

### 1단계: OpenWeather API 키 발급 (2분)

1. **OpenWeather 웹사이트 방문**
   - https://openweathermap.org/ 접속

2. **무료 계정 생성**
   - 우측 상단 "Sign In" → "Create an Account" 클릭
   - 이메일, 비밀번호 입력
   - 이메일 인증 완료

3. **API 키 발급**
   - 로그인 후 "My API keys" 페이지로 이동
   - 또는 직접 접속: https://home.openweathermap.org/api_keys
   - 기본 API 키가 자동 생성되어 있음
   - 또는 "Create Key" 버튼으로 새 키 생성

4. **API 키 복사**
   ```
   예시: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### 2단계: API 키 설정 (1분)

**방법 A: 앱 모달에서 설정 (권장)**

1. 이 문서를 읽기 전에 나타난 모달에 API 키 입력
2. "Save Secret" 버튼 클릭
3. Edge Function 재배포 (아래 3단계 참고)

**방법 B: Supabase CLI로 설정**

```bash
# API 키 설정
supabase secrets set OPENWEATHER_API_KEY=your_api_key_here

# 예시
supabase secrets set OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**방법 C: Supabase 대시보드에서 설정**

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `fyrmbzodedjkwtlkyymp`
3. Settings → Edge Functions → Secrets
4. "Add new secret" 클릭
5. Name: `OPENWEATHER_API_KEY`
6. Value: 복사한 API 키 붙여넣기
7. "Save" 클릭

### 3단계: Edge Function 재배포 (1분)

환경 변수를 설정한 후에는 **반드시 Edge Function을 재배포**해야 합니다!

```bash
# Edge Function 재배포
supabase functions deploy server
```

또는 Supabase 대시보드에서:
1. Edge Functions → server
2. "Redeploy" 버튼 클릭

### 4단계: 키 활성화 대기 (10분~2시간)

⚠️ **중요**: 새로 발급받은 API 키는 **즉시 작동하지 않습니다!**

- **일반적**: 10-30분 후 활성화
- **최대**: 최대 2시간 소요
- **확인**: https://home.openweathermap.org/api_keys 에서 상태 확인

활성화 전까지는 Mock 데이터가 표시됩니다.

### 5단계: 테스트 (30초)

1. 앱 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. 홈 → "🌤️ 날씨 연동 테스트" 클릭
3. "진단 시작" 버튼 클릭
4. "API 키 유효성" 항목 확인:
   - ✅ = 성공! 실제 날씨 데이터 사용 중
   - ⚠️ = 키가 아직 활성화 중 (10분 후 재시도)
   - ❌ = 키가 유효하지 않음 (1단계부터 다시)

---

## 🔍 문제 해결

### Q1: "Invalid API key" 에러가 계속 발생해요

**원인**:
1. API 키를 잘못 복사했을 수 있습니다
2. API 키가 아직 활성화되지 않았습니다
3. Edge Function을 재배포하지 않았습니다

**해결**:
```bash
# 1. API 키가 제대로 설정되었는지 확인
supabase secrets list

# 2. API 키 재설정 (공백 없이!)
supabase secrets set OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# 3. Edge Function 재배포
supabase functions deploy server

# 4. 10-30분 대기 후 테스트
```

### Q2: Mock 데이터에서 실제 데이터로 바뀌지 않아요

**확인 사항**:
1. ✅ API 키 발급 완료
2. ✅ API 키 Supabase에 설정
3. ✅ Edge Function 재배포
4. ⏰ **10-30분 대기** ← 가장 흔한 원인!
5. ✅ 브라우저 새로고침

**즉시 확인**:
```bash
# API 키 상태 직접 테스트
curl "https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=YOUR_API_KEY_HERE&units=metric"
```

정상 응답:
```json
{"coord":{"lon":126.9778,"lat":37.5683},"weather":[...],"main":{"temp":15.5,...},...}
```

에러 응답:
```json
{"cod":401,"message":"Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."}
```

### Q3: 무료 API 키에 제한이 있나요?

**OpenWeather 무료 플랜**:
- ✅ 분당 60회 호출 가능
- ✅ 하루 100만 회 호출 가능
- ✅ 현재 날씨 데이터 제공
- ✅ 3시간 단위 예보 (5일)
- ✅ 상업적 사용 가능

이 앱의 사용량은 무료 플랜으로 충분합니다!

### Q4: 다른 날씨 API를 사용할 수 있나요?

현재 이 앱은 OpenWeather API만 지원합니다. 다른 API 사용을 원하시면 `/supabase/functions/server/index.tsx` 파일의 `/weather/:city` 엔드포인트를 수정해야 합니다.

---

## 📊 API 키 활성화 타임라인

```
0분     → API 키 발급
        ↓
5분     → Supabase 환경 변수 설정
        ↓
6분     → Edge Function 재배포
        ↓
10분    → 대부분의 키 활성화 완료 ✅
        ↓
30분    → 거의 모든 키 활성화 완료 ✅
        ↓
2시간   → 최악의 경우에도 활성화 완료 ✅
```

---

## 🎯 체크리스트

배포 전 확인:

- [ ] OpenWeather 계정 생성
- [ ] API 키 발급
- [ ] API 키 복사 (공백 없이!)
- [ ] Supabase에 환경 변수 설정
- [ ] Edge Function 재배포
- [ ] 10-30분 대기
- [ ] 브라우저 새로고침
- [ ] 테스트 페이지에서 확인
- [ ] "💡" 아이콘 사라짐 확인
- [ ] 실제 날씨 데이터 표시 확인

---

## 🔗 유용한 링크

- **OpenWeather 홈페이지**: https://openweathermap.org/
- **API 키 관리**: https://home.openweathermap.org/api_keys
- **API 문서**: https://openweathermap.org/current
- **FAQ**: https://openweathermap.org/faq
- **요금제**: https://openweathermap.org/price (무료 플랜 선택)

---

## 💬 자주 묻는 질문

**Q: Mock 데이터로도 앱이 작동하나요?**  
A: 네! Mock 데이터는 앱이 정상 작동하는지 테스트하기 위한 것입니다. 하지만 실제 날씨 데이터를 원하시면 API 키가 필요합니다.

**Q: API 키 설정이 어려워요.**  
A: 위 모달에 API 키만 입력하면 자동으로 설정됩니다. 또는 Supabase 대시보드에서 설정할 수 있습니다.

**Q: 돈이 드나요?**  
A: 아니요! OpenWeather 무료 플랜은 영구 무료이며, 이 앱의 사용량은 무료 플랜으로 충분합니다.

**Q: 개인정보가 수집되나요?**  
A: OpenWeather에 계정을 만들 때만 이메일을 제공합니다. API 키 사용 시 개인정보는 수집되지 않습니다.

---

**마지막 업데이트**: 2025-10-21  
**예상 소요 시간**: 5분 + 10-30분 대기  
**난이도**: ⭐☆☆☆☆ (매우 쉬움)

🎉 설정 후 실제 날씨 데이터를 즐기세요!
