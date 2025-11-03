import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, MapPin, Navigation, Clock, Star, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { WeatherWidget } from "./WeatherWidget";
import { loadKakaoMaps } from "../utils/kakao-loader";
import { getPlaceImage } from "../utils/naver-api";

interface Place {
  id: string;
  name: string;
  category: string;
  reviewCount: number;
  rating: number;
  description: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}

interface RouteSegment {
  from: string;
  to: string;
  distance: number;
  distanceText: string;
  time: number;
  timeText: string;
  transportMode: string;
}

interface RouteMapPageProps {
  places: Place[];
  routeInfo: {
    routes: RouteSegment[];
    totalDistance: number;
    totalDistanceText: string;
    totalTime: number;
    totalTimeText: string;
    recommendedDuration: string;
  };
  transportMode: string;
  onBack: () => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function RouteMapPage({ places, routeInfo, transportMode, onBack }: RouteMapPageProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [placeImages, setPlaceImages] = useState<Map<string, string>>(new Map());

  // Use existing imageUrl from places data (Google Places API)
  useEffect(() => {
    const imageMap = new Map<string, string>();
    
    // Use imageUrl from place data if available
    for (const place of places) {
      if (place.imageUrl) {
        imageMap.set(place.id, place.imageUrl);
      }
    }
    
    setPlaceImages(imageMap);
  }, [places]);

  useEffect(() => {
    const initMap = async () => {
      try {
        setMapError(false);
        
        // Load Kakao Maps SDK
        await loadKakaoMaps();
        
        // Initialize map
        initializeMap();
      } catch (error: any) {
        // Silently fail - will show route details instead
        setMapError(true);
      }
    };

    initMap();

    return () => {
      // Cleanup markers and polyline
      markersRef.current.forEach(marker => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  // Update map when places change
  useEffect(() => {
    if (mapRef.current && mapLoaded && places.length > 0) {
      drawRouteOnMap();
    }
  }, [places, mapLoaded]);

  const initializeMap = () => {
    if (!mapContainer.current || !window.kakao) return;

    try {
      // Calculate center point
      const centerLat = places.length > 0 
        ? places.reduce((sum, p) => sum + p.lat, 0) / places.length
        : 37.5665;
      const centerLng = places.length > 0
        ? places.reduce((sum, p) => sum + p.lng, 0) / places.length
        : 126.9780;

      const options = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 8
      };

      mapRef.current = new window.kakao.maps.Map(mapContainer.current, options);
      setMapLoaded(true);
      
      console.log("✅ Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(true);
    }
  };

  const drawRouteOnMap = () => {
    if (!mapRef.current || !window.kakao) return;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create path coordinates for polyline
    const pathCoords: any[] = [];

    // Add markers for each place
    places.forEach((place, index) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      pathCoords.push(position);

      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.style.cssText = `
        position: relative;
        width: 40px;
        height: 40px;
        cursor: pointer;
      `;

      // Number badge
      const badge = document.createElement('div');
      badge.style.cssText = `
        width: 40px;
        height: 40px;
        background: ${index === 0 ? '#10B981' : index === places.length - 1 ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      badge.textContent = (index + 1).toString();
      markerContent.appendChild(badge);

      // Label (출발/도착)
      if (index === 0 || index === places.length - 1) {
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: ${index === 0 ? '#10B981' : '#EF4444'};
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
        `;
        label.textContent = index === 0 ? '출발' : '도착';
        markerContent.appendChild(label);
      }

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        zIndex: 100 + index
      });

      customOverlay.setMap(mapRef.current);
      markersRef.current.push(customOverlay);

      // Add click event
      markerContent.addEventListener('click', () => {
        setSelectedPlace(place);
        
        // Show info window
        const infoContent = document.createElement('div');
        infoContent.style.cssText = `
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          min-width: 200px;
        `;
        infoContent.innerHTML = `
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${place.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${place.category}</div>
          <div style="font-size: 11px; color: #999;">${place.address}</div>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
            <span style="color: #F59E0B;">⭐</span>
            <span style="font-size: 12px; font-weight: bold;">${place.rating}</span>
            <span style="font-size: 11px; color: #999;">(${place.reviewCount})</span>
          </div>
        `;

        const infoOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: infoContent,
          yAnchor: 2.5,
          zIndex: 200
        });

        infoOverlay.setMap(mapRef.current);

        // Remove after 3 seconds
        setTimeout(() => {
          infoOverlay.setMap(null);
        }, 3000);
      });
    });

    // Draw polyline connecting places
    if (pathCoords.length > 1) {
      const polyline = new window.kakao.maps.Polyline({
        path: pathCoords,
        strokeWeight: 4,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed'
      });

      polyline.setMap(mapRef.current);
      polylineRef.current = polyline;
    }

    // Adjust map bounds to show all markers
    if (places.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      pathCoords.forEach(coord => bounds.extend(coord));
      mapRef.current.setBounds(bounds);
      
      // Add padding
      setTimeout(() => {
        const level = mapRef.current.getLevel();
        mapRef.current.setLevel(level + 1);
      }, 100);
    }
  };

  const getTransportIcon = (mode: string) => {
    switch(mode) {
      case "WALK": return "🚶";
      case "TRANSIT": return "🚇";
      case "DRIVE": return "🚗";
      default: return "🚶";
    }
  };

  const getPlaceImage = (placeId: string, category: string): string => {
    // First try to get Naver API image
    const naverImage = placeImages.get(placeId);
    if (naverImage) {
      return naverImage;
    }
    
    // Fallback to category images
    const images = {
      "카페": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      "레스토랑": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
      "관광명소": "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
      "박물관": "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "공원": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
      "쇼핑": "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      "숙박": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "액티비티": "https://images.unsplash.com/photo-1527004013197-933c4bb611b3"
    };
    return images[category] || images["관광명소"];
  };

  const scrollToPlace = (index: number) => {
    const element = document.getElementById(`place-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="pt-6 px-6 pb-4 border-b border-gray-100">
        <button onClick={onBack} className="mb-4 flex items-center text-gray-600">
          <ChevronLeft className="w-5 h-5" />
          <span>뒤로</span>
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1">경로 안내</h1>
            <p className="text-sm text-gray-500">
              {getTransportIcon(transportMode)} {transportMode === "WALK" ? "도보" : transportMode === "TRANSIT" ? "대중교통" : "자동차"}
            </p>
          </div>
          <Badge className="bg-blue-500 text-white">{places.length}개 장소</Badge>
        </div>

        {/* Weather Info */}
        {places.length > 0 && (
          <WeatherWidget city={places[0].address.split(' ')[0]} compact />
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer}
        className="relative w-full h-96 bg-gray-100"
      >
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-sm">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="mb-2">지도 로딩 실패</h3>
              <p className="text-xs text-gray-600 mb-4">
                카카오맵 SDK를 불러올 수 없습니다.<br/>
                도메인이 등록되지 않았을 수 있습니다.
              </p>
              <div className="text-xs text-left bg-gray-50 p-3 rounded mb-4">
                <p className="mb-2">해결 방법:</p>
                <ol className="space-y-1 text-gray-700">
                  <li>1. <a href="https://developers.kakao.com" target="_blank" rel="noopener" className="text-blue-600 underline">developers.kakao.com</a> 방문</li>
                  <li>2. 앱 선택 → 플랫폼 → Web 설정</li>
                  <li>3. 도메인 등록: <code className="bg-white px-1 rounded text-xs">{window.location.origin}</code></li>
                </ol>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  페이지 새로고침
                </Button>
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  className="w-full"
                  size="sm"
                >
                  뒤로 가기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Summary */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">총 거리</div>
              <div className="text-sm">{routeInfo.totalDistanceText}</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">이동 시간</div>
              <div className="text-sm">{routeInfo.totalTimeText}</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">추천 일정</div>
              <div className="text-sm">{routeInfo.recommendedDuration}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Places List */}
      <div className="px-6 py-6">
        <h2 className="text-lg mb-4">경유지 목록</h2>
        <div className="space-y-3">
          {places.map((place, index) => (
            <Card 
              key={place.id}
              id={`place-${index}`}
              className={`p-4 cursor-pointer transition-all ${
                selectedPlace?.id === place.id 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedPlace(place);
                if (mapRef.current && mapLoaded) {
                  const position = new window.kakao.maps.LatLng(place.lat, place.lng);
                  mapRef.current.setCenter(position);
                  mapRef.current.setLevel(3);
                }
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 overflow-hidden">
                    <ImageWithFallback
                      src={getPlaceImage(place.id, place.category)}
                      alt={place.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className={`absolute -top-2 -left-2 w-7 h-7 ${
                      index === 0 ? 'bg-green-500' : 
                      index === places.length - 1 ? 'bg-red-500' : 
                      'bg-blue-500'
                    } text-white rounded-full flex items-center justify-center text-sm shadow-md`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="text-sm mb-0.5">{place.name}</h3>
                      <p className="text-xs text-gray-500">{place.category}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{place.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-1">{place.description}</p>
                  
                  {/* Route segment info */}
                  {index < places.length - 1 && routeInfo.routes[index] && (
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Navigation className="w-3 h-3" />
                        <span>{routeInfo.routes[index].distanceText}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{routeInfo.routes[index].timeText}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation Tips */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            여행 팁
          </h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• 지도의 마커를 클릭하면 상세 정보를 볼 수 있습니다</li>
            <li>• 각 장소에서 충분한 시간을 확보하세요</li>
            <li>• 날씨를 확인하고 실내 장소를 포함하세요</li>
            <li>• 점심/저녁 시간에 맞춰 레스토랑을 배치하세요</li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white">
            <Navigation className="w-4 h-4 mr-2" />
            카카오맵으로 경로 보기
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={onBack}
          >
            경로 수정
          </Button>
        </div>
      </div>
    </div>
  );
}
