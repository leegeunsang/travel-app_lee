# 카카오 REST API 활용 가이드

## 📌 핵심 개념

카카오는 두 가지 다른 API를 제공합니다:

### 1. JavaScript SDK (지도 표시용)
- **용도**: 웹 페이지에서 지도를 시각적으로 표시
- **키 타입**: JavaScript 키 (94e86b9b6ddf71039ab09c9902d2d79f)
- **제약사항**: **도메인 등록 필수** (보안 때문에 우회 불가)
- **등록 방법**: [DOMAIN_REGISTRATION_GUIDE.md](./DOMAIN_REGISTRATION_GUIDE.md) 참고

### 2. REST API (데이터 조회용)
- **용도**: 장소 검색, 주소-좌표 변환, 길찾기 등
- **키 타입**: REST API 키 (d8bc8a87cc33c1ab4d97eb09f57b8da7)
- **장점**: **도메인 등록 불필요** ✅
- **위치**: 서버 환경변수 `KAKAO_REST_API_KEY`에 저장됨

---

## ✅ 해결책: REST API로 할 수 있는 것

### 현재 구현된 기능

#### 1. **장소 검색** (이미 구현됨)
```typescript
// 서버 엔드포인트: /make-server-80cc3277/search-places
// 사용 예시는 SearchPage.tsx 참고
```

#### 2. **주소 → 좌표 변환** (새로 추가됨)
```typescript
import { addressToCoordinates } from '../utils/kakao-rest-api';

const result = await addressToCoordinates('서울특별시 종로구 세종대로 209');
if (result.success) {
  console.log(result.data); // { lat, lng, address, roadAddress }
}
```

#### 3. **길찾기 / 경로 계산** (새로 추가됨)
```typescript
import { getDirections, formatDistance, formatDuration } from '../utils/kakao-rest-api';

const result = await getDirections(
  { lat: 37.5665, lng: 126.9780 }, // 출발지 (서울)
  { lat: 37.5512, lng: 126.9882 }, // 도착지 (N서울타워)
  'RECOMMEND' // 'TIME' | 'DISTANCE' | 'RECOMMEND'
);

if (result.success && result.data) {
  console.log(formatDistance(result.data.distance)); // "3.2km"
  console.log(formatDuration(result.data.duration)); // "15분"
}
```

#### 4. **장소 상세 정보** (새로 추가됨)
```typescript
import { getPlaceDetails } from '../utils/kakao-rest-api';

const result = await getPlaceDetails('경복궁', '서울');
if (result.success && result.data) {
  console.log(result.data);
  // { name, address, roadAddress, phone, category, lat, lng, placeUrl, id }
}
```

#### 5. **경로 전체 통계 계산** (새로 추가됨)
```typescript
import { calculateRouteStats } from '../utils/kakao-rest-api';

const waypoints = [
  { lat: 37.5665, lng: 126.9780 }, // 서울역
  { lat: 37.5796, lng: 126.9770 }, // 경복궁
  { lat: 37.5825, lng: 126.9850 }, // 북촌한옥마을
];

const stats = await calculateRouteStats(waypoints);
console.log(`총 ${formatDistance(stats.totalDistance)}, ${formatDuration(stats.totalDuration)}`);
```

---

## 🚫 REST API로는 할 수 없는 것

### 지도 시각화
- 지도 위에 마커 표시
- 지도 위에 경로 그리기
- 지도 확대/축소/이동 인터랙션

**→ 이런 기능은 JavaScript SDK가 필요하며, 도메인 등록이 필수입니다.**

---

## 🎯 권장 사용 전략

### 시나리오 1: 도메인 등록 전 (개발 중)
```typescript
// ✅ REST API 사용: 데이터만 가져오기
const places = await searchPlaces('카페', '강남');
const coords = await addressToCoordinates('서울 강남구 테헤란로 123');

// ❌ 지도 표시 없이 리스트/카드 형태로 표시
// 예: SearchPage.tsx, AttractionsList.tsx
```

### 시나리오 2: 도메인 등록 후 (배포 완료)
```typescript
// ✅ JavaScript SDK 사용: 지도에 시각화
<KakaoMap markers={markers} center={center} />

// ✅ REST API 사용: 추가 데이터 조회
const directions = await getDirections(origin, destination);
```

### 시나리오 3: 하이브리드 접근 (최적)
```typescript
// 1. REST API로 데이터 가져오기
const places = await searchPlaces('관광지', '부산');
const coords = await addressToCoordinates(places[0].address);

// 2. 데이터가 있으면 지도에 표시 (도메인 등록 필요)
if (window.kakao) {
  <KakaoMap markers={markers} />
} else {
  // 3. 지도 없이 리스트로 표시 (폴백)
  <PlacesList places={places} />
}
```

---

## 🔧 서버 엔드포인트 목록

모든 엔드포인트는 `KAKAO_REST_API_KEY` 환경변수를 사용합니다.

| 엔드포인트 | 메서드 | 설명 | 도메인 필요 |
|-----------|--------|------|------------|
| `/kakao/address-to-coord` | POST | 주소 → 좌표 변환 | ❌ |
| `/kakao/directions` | POST | 길찾기 (거리/시간) | ❌ |
| `/kakao/place-details` | POST | 장소 상세 정보 | ❌ |
| `/search-places` | POST | 장소 검색 | ❌ |

---

## 📝 예시: 스마트 경로 페이지에서 사용

```typescript
// SmartRoutePage.tsx 에서 사용 예시
import { calculateRouteStats, formatDistance, formatDuration } from '../utils/kakao-rest-api';

function SmartRoutePage() {
  const [routeStats, setRouteStats] = useState(null);
  
  async function calculateRoute() {
    const waypoints = selectedPlaces.map(p => ({ lat: p.lat, lng: p.lng }));
    const stats = await calculateRouteStats(waypoints);
    
    setRouteStats({
      distance: formatDistance(stats.totalDistance),
      duration: formatDuration(stats.totalDuration),
      isFallback: stats.isFallback
    });
  }
  
  return (
    <div>
      <h2>예상 경로</h2>
      {routeStats && (
        <div>
          <p>총 거리: {routeStats.distance}</p>
          <p>소요 시간: {routeStats.duration}</p>
          {routeStats.isFallback && (
            <p className="text-xs text-gray-500">
              ℹ️ 직선 거리 기준 (실제 경로는 다를 수 있습니다)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ 주의사항

### 1. API 호출 제한
- 무료 플랜: 하루 30만 건
- 초과 시 요금 발생 가능
- **캐싱 권장**: 같은 요청은 결과를 저장해서 재사용

### 2. Fallback 처리
- REST API가 실패하면 직선 거리로 fallback
- `isFallback: true` 플래그로 구분 가능
- 사용자에게 "추정치" 명시 권장

### 3. JavaScript SDK와의 차이
```typescript
// REST API (좌표만)
const { lat, lng } = await addressToCoordinates('서울역');

// JavaScript SDK (지도 객체)
const map = new kakao.maps.Map(container, { center });
const marker = new kakao.maps.Marker({ position, map });
```

---

## 🎉 요약

### ✅ 할 수 있는 것 (REST API)
- 장소 검색
- 주소-좌표 변환
- 길찾기 (거리, 시간 계산)
- 장소 상세 정보
- **도메인 등록 불필요**

### ❌ 할 수 없는 것 (JavaScript SDK 필요)
- 지도 표시
- 마커 표시
- 경로 시각화
- **도메인 등록 필수**

### 💡 최선의 전략
1. 개발 중: REST API만 사용 (리스트/카드 UI)
2. 배포 후: JavaScript SDK + REST API 병행
3. 에러 처리: 지도 로드 실패 시 리스트 표시로 폴백

---

## 📚 관련 문서

- [도메인 등록 가이드](./DOMAIN_REGISTRATION_GUIDE.md)
- [카카오 API 설정](./KAKAO_API_SETUP.md)
- [환경변수 설정](./ENV_SETUP_GUIDE.md)
- [스마트 경로 가이드](./SMART_ROUTE_GUIDE.md)
