/**
 * Kakao REST API Test Component
 * Demonstrates how to use REST API features without domain registration
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ChevronLeft, MapPin, Navigation, Clock, Search, Loader2 } from 'lucide-react';
import { 
  addressToCoordinates, 
  getDirections, 
  getPlaceDetails,
  formatDistance,
  formatDuration
} from '../utils/kakao-rest-api';

interface KakaoRestApiTestProps {
  onBack?: () => void;
}

export function KakaoRestApiTest({ onBack }: KakaoRestApiTestProps) {
  const [addressInput, setAddressInput] = useState('서울특별시 종로구 세종대로 209');
  const [addressResult, setAddressResult] = useState<any>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const [placeInput, setPlaceInput] = useState('경복궁');
  const [locationInput, setLocationInput] = useState('서울');
  const [placeResult, setPlaceResult] = useState<any>(null);
  const [placeLoading, setPlaceLoading] = useState(false);

  const [directionsResult, setDirectionsResult] = useState<any>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);

  const handleAddressSearch = async () => {
    setAddressLoading(true);
    setAddressResult(null);
    
    const result = await addressToCoordinates(addressInput);
    setAddressResult(result);
    setAddressLoading(false);
  };

  const handlePlaceSearch = async () => {
    setPlaceLoading(true);
    setPlaceResult(null);
    
    const result = await getPlaceDetails(placeInput, locationInput);
    setPlaceResult(result);
    setPlaceLoading(false);
  };

  const handleDirectionsTest = async () => {
    setDirectionsLoading(true);
    setDirectionsResult(null);
    
    // Test: Seoul to N Seoul Tower
    const result = await getDirections(
      { lat: 37.5665, lng: 126.9780 }, // Seoul City Hall
      { lat: 37.5512, lng: 126.9882 }  // N Seoul Tower
    );
    setDirectionsResult(result);
    setDirectionsLoading(false);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-8">
        {onBack && (
          <button onClick={onBack} className="mb-4 flex items-center text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>뒤로</span>
          </button>
        )}
        <h1 className="text-2xl mb-2">카카오 REST API 테스트</h1>
        <p className="text-sm text-blue-100">
          도메인 등록 없이 사용 가능한 기능들
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
              ℹ️
            </div>
            <div className="flex-1 text-sm">
              <p className="text-blue-900 mb-1">
                <strong>REST API는 도메인 등록이 필요하지 않습니다!</strong>
              </p>
              <p className="text-blue-700 text-xs">
                장소 검색, 좌표 변환, 거리 계산 등의 기능을 바로 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* Test 1: Address to Coordinates */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg">주소 → 좌표 변환</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="address">주소 입력</Label>
              <Input
                id="address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="예: 서울특별시 종로구 세종대로 209"
              />
            </div>
            
            <Button 
              onClick={handleAddressSearch} 
              disabled={addressLoading || !addressInput}
              className="w-full"
            >
              {addressLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  검색
                </>
              )}
            </Button>

            {addressResult && (
              <div className={`p-3 rounded-lg ${addressResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {addressResult.success ? (
                  <div className="space-y-1 text-sm">
                    <p className="text-green-900">
                      <strong>✅ 변환 성공</strong>
                    </p>
                    <p className="text-green-700">
                      좌표: {addressResult.data.lat.toFixed(4)}, {addressResult.data.lng.toFixed(4)}
                    </p>
                    <p className="text-green-700">
                      주소: {addressResult.data.address}
                    </p>
                    {addressResult.data.roadAddress && (
                      <p className="text-green-700">
                        도로명: {addressResult.data.roadAddress}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 text-sm">
                    ❌ {addressResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Test 2: Place Details */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg">장소 상세 정보</h2>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="place">장소명</Label>
                <Input
                  id="place"
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                  placeholder="예: 경복궁"
                />
              </div>
              <div>
                <Label htmlFor="location">지역</Label>
                <Input
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="예: 서울"
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePlaceSearch} 
              disabled={placeLoading || !placeInput}
              className="w-full"
              variant="secondary"
            >
              {placeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  장소 검색
                </>
              )}
            </Button>

            {placeResult && (
              <div className={`p-3 rounded-lg ${placeResult.success ? 'bg-purple-50 border border-purple-200' : 'bg-red-50 border border-red-200'}`}>
                {placeResult.success ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-900">
                      <strong>✅ {placeResult.data.name}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {placeResult.data.category.split('>').map((cat: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cat.trim()}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-purple-700">
                      📍 {placeResult.data.address}
                    </p>
                    {placeResult.data.phone && (
                      <p className="text-purple-700">
                        📞 {placeResult.data.phone}
                      </p>
                    )}
                    <p className="text-purple-700">
                      🗺️ 좌표: {placeResult.data.lat.toFixed(4)}, {placeResult.data.lng.toFixed(4)}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-700 text-sm">
                    ❌ {placeResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Test 3: Directions */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-green-500" />
            <h2 className="text-lg">길찾기 (거리/시간)</h2>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>테스트 경로:</strong></p>
              <p>• 출발: 서울시청 (37.5665, 126.9780)</p>
              <p>• 도착: N서울타워 (37.5512, 126.9882)</p>
            </div>
            
            <Button 
              onClick={handleDirectionsTest} 
              disabled={directionsLoading}
              className="w-full"
              variant="default"
            >
              {directionsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  계산 중...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  경로 계산
                </>
              )}
            </Button>

            {directionsResult && (
              <div className={`p-3 rounded-lg ${directionsResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {directionsResult.success ? (
                  <div className="space-y-2">
                    <p className="text-green-900 text-sm">
                      <strong>✅ 경로 계산 완료</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Navigation className="w-3 h-3" />
                          <span>거리</span>
                        </div>
                        <p className="text-lg text-green-700">
                          {formatDistance(directionsResult.data.distance)}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>시간</span>
                        </div>
                        <p className="text-lg text-green-700">
                          {formatDuration(directionsResult.data.duration)}
                        </p>
                      </div>
                    </div>
                    {directionsResult.data.isFallback && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs text-amber-700">
                        ℹ️ 직선 거리 기준 추정치입니다
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 text-sm">
                    ❌ {directionsResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Documentation Link */}
        <Card className="p-4 bg-gray-50">
          <h3 className="text-sm mb-2">📚 개발자 가이드</h3>
          <p className="text-xs text-gray-600 mb-3">
            자세한 사용법은 다음 문서를 참고하세요:
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href="/KAKAO_REST_API_GUIDE.md" 
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              → KAKAO_REST_API_GUIDE.md
            </a>
            <a 
              href="/utils/kakao-rest-api.ts" 
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              → /utils/kakao-rest-api.ts (소스 코드)
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
