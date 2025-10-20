import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, MapPin, Navigation, Clock, Star, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { WeatherWidget } from "./WeatherWidget";

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
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Mock implementation - In production, use actual Kakao Maps API
    console.log("Loading map with places:", places);
    console.log("Route info:", routeInfo);
    
    // Simulate map loading
    setTimeout(() => {
      setMapLoaded(true);
      initMockMap();
    }, 1000);
  }, [places]);

  const initMockMap = () => {
    // This is a mock implementation
    // In production, initialize actual Kakao Maps SDK here
    console.log("Map initialized with", places.length, "places");
  };

  const getTransportIcon = (mode: string) => {
    switch(mode) {
      case "WALK": return "🚶";
      case "TRANSIT": return "🚇";
      case "DRIVE": return "🚗";
      default: return "🚶";
    }
  };

  const getPlaceImage = (category: string): string => {
    const images = {
      "카페": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      "레스토랑": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
      "관광명소": "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
      "박물관": "https://images.unsplash.com/photo-1565173877742-a47d02b5f9b2",
      "공원": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
      "쇼핑": "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      "숙박": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "액티비티": "https://images.unsplash.com/photo-1527004013197-933c4bb611b3"
    };
    return images[category] || images["관광명소"];
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Status Bar */}
      <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
        <span className="text-lg font-semibold text-black ml-2">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
          <div className="w-6 h-3 border-2 border-gray-900 rounded-sm relative ml-0.5">
            <div className="absolute right-0 top-0.5 bottom-0.5 w-3 h-1.5 bg-gray-900 rounded-sm"></div>
          </div>
        </div>
      </div>

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

      {/* Map Container - Mock */}
      <div 
        ref={mapContainer}
        className="relative w-full h-80 bg-gradient-to-br from-blue-50 to-green-50"
      >
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 p-4">
            {/* Mock map visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Draw route path */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
                </marker>
              </defs>
              
              {/* Path line */}
              {places.map((place, index) => {
                if (index === places.length - 1) return null;
                const x1 = 50 + (index * 300 / (places.length - 1));
                const y1 = 150 + Math.sin(index * 0.5) * 50;
                const x2 = 50 + ((index + 1) * 300 / (places.length - 1));
                const y2 = 150 + Math.sin((index + 1) * 0.5) * 50;
                
                return (
                  <g key={index}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              
              {/* Place markers */}
              {places.map((place, index) => {
                const x = 50 + (index * 300 / (places.length - 1));
                const y = 150 + Math.sin(index * 0.5) * 50;
                
                return (
                  <g key={place.id} onClick={() => setSelectedPlace(place)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={selectedPlace?.id === place.id ? "#EF4444" : "#3B82F6"}
                      stroke="white"
                      strokeWidth="3"
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy=".3em"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </text>
                    {index === 0 && (
                      <text
                        x={x}
                        y={y - 35}
                        textAnchor="middle"
                        fill="#059669"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        출발
                      </text>
                    )}
                    {index === places.length - 1 && (
                      <text
                        x={x}
                        y={y - 35}
                        textAnchor="middle"
                        fill="#DC2626"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        도착
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Info badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2 text-xs">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">마커를 클릭하여 장소 정보 확인</span>
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
              className={`p-4 cursor-pointer transition-all ${
                selectedPlace?.id === place.id 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 overflow-hidden">
                    <ImageWithFallback
                      src={getPlaceImage(place.category)}
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
                      <Badge variant="outline" className="text-xs">
                        {getTransportIcon(transportMode)} {routeInfo.routes[index].transportMode === "WALK" ? "도보" : 
                         routeInfo.routes[index].transportMode === "TRANSIT" ? "대중교통" : "자동차"}
                      </Badge>
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
            <li>• 각 장소에서 충분한 시간을 확보하세요</li>
            <li>• 날씨를 확인하고 실내 장소를 포함하세요</li>
            <li>• 점심/저녁 시간에 맞춰 레스토랑을 배치하세요</li>
            <li>• 이동 시간이 너무 길지 않도록 순서를 조정하세요</li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white">
            <Navigation className="w-4 h-4 mr-2" />
            네비게이션 시작
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={onBack}
          >
            경로 수정
          </Button>
        </div>

        {/* API Notice */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            💡 <strong>실제 지도 표시:</strong> 카카오맵 API 키를 설정하면 실제 지도 위에 경로가 표시되며,
            실시간 교통 정보와 함께 최적 경로를 제공합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
