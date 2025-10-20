import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, Loader2, MapPin, Star, RefreshCw, Lock, Unlock, Navigation, Clock, TrendingUp } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { WeatherWidget } from "./WeatherWidget";

interface SmartRoutePageProps {
  travelStyle: string;
  location: string;
  weather: any;
  onBack: () => void;
  onConfirmRoute: (places: Place[], routeInfo: any, transportMode: string) => void;
}

interface Place {
  id: string;
  name: string;
  category: string;
  reviewCount: number;
  rating: number;
  description: string;
  address: string;
  isIndoor: boolean;
  isOutdoor: boolean;
  keywords: string[];
  lat: number;
  lng: number;
  locked?: boolean;
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

export function SmartRoutePage({ travelStyle, location, weather, onBack, onConfirmRoute }: SmartRoutePageProps) {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [offset, setOffset] = useState(0);
  const [transportMode, setTransportMode] = useState("TRANSIT");
  const [calculating, setCalculating] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch places on mount and when offset changes
  useEffect(() => {
    let mounted = true;
    
    const loadPlaces = async () => {
      if (location && travelStyle && mounted) {
        console.log("Fetching places with offset:", offset);
        await fetchPlaces();
      }
    };
    
    loadPlaces();
    
    return () => {
      mounted = false;
    };
  }, [offset]);

  // Calculate route when places or transport mode changes
  useEffect(() => {
    let mounted = true;
    
    const loadRoute = async () => {
      if (places.length >= 2 && initialLoadDone && mounted) {
        console.log("Calculating route for", places.length, "places");
        await calculateRoute();
      }
    };
    
    loadRoute();
    
    return () => {
      mounted = false;
    };
  }, [places.length, transportMode, initialLoadDone]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch places...");
      
      // Define categories based on travel style
      const categories = getCategoriesByStyle(travelStyle);
      console.log("Categories:", categories);
      
      const requestBody = {
        location,
        travelStyle,
        weather,
        categories,
        excludeIds: places.filter(p => p.locked).map(p => p.id),
        offset
      };
      console.log("Request body:", requestBody);
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/select-places`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Server error:", errorText);
        throw new Error("Failed to fetch places");
      }

      const data = await response.json();
      
      if (data.error) {
        console.error("API error:", data.error);
        throw new Error(data.error);
      }
      
      if (!data.places || data.places.length === 0) {
        console.warn("No places returned from server", data);
        toast.error("추천할 장소를 찾을 수 없습니다. 다시 시도해주세요.");
        
        // Set empty array to avoid errors
        setPlaces([]);
        return;
      }
      
      console.log(`Received ${data.places.length} places from server`);
      
      // Merge with locked places
      const lockedPlaces = places.filter(p => p.locked);
      const newPlaces = data.places.filter((p: Place) => 
        !lockedPlaces.some(lp => lp.id === p.id)
      );
      
      const finalPlaces = [...lockedPlaces, ...newPlaces.slice(0, 4 - lockedPlaces.length)];
      console.log(`Setting ${finalPlaces.length} places`);
      setPlaces(finalPlaces);
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Error fetching places:", error);
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      } else {
        const errorMessage = error instanceof Error ? error.message : "장소를 불러오는데 실패했습니다";
        toast.error(errorMessage);
      }
      
      // Create mock places as fallback
      const mockPlaces: Place[] = getCategoriesByStyle(travelStyle).map((category, index) => ({
        id: `mock_${index}`,
        name: `${location} ${category} 추천`,
        category,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        rating: 4.5,
        description: "추천 장소",
        address: `${location}`,
        isIndoor: ["카페", "레스토랑"].includes(category),
        isOutdoor: ["공원", "액티비티"].includes(category),
        keywords: ["추천"],
        lat: 37.5 + Math.random() * 0.1,
        lng: 127.0 + Math.random() * 0.1
      }));
      
      setPlaces(mockPlaces);
      setInitialLoadDone(true);
    } finally {
      console.log("Fetch places completed");
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    try {
      setCalculating(true);
      
      if (!places || places.length < 2) {
        console.log("Not enough places to calculate route");
        setRouteInfo(null);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/calculate-route`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            places,
            transportMode,
            travelStyle
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Server error:", errorText);
        throw new Error("Failed to calculate route");
      }

      const data = await response.json();
      
      if (data.error) {
        console.error("API error:", data.error);
        throw new Error(data.error);
      }
      
      setRouteInfo(data);
    } catch (error) {
      console.error("Error calculating route:", error);
      // Don't show toast for route calculation errors (non-critical)
    } finally {
      setCalculating(false);
    }
  };

  const getCategoriesByStyle = (style: string): string[] => {
    if (style === "힐링") {
      return ["카페", "공원", "숙박", "레스토랑"];
    } else if (style === "관광") {
      return ["관광명소", "박물관", "레스토랑", "숙박"];
    } else {
      return ["액티비티", "레스토랑", "공원", "숙박"];
    }
  };

  const toggleLock = (placeId: string) => {
    setPlaces(places.map(p => 
      p.id === placeId ? { ...p, locked: !p.locked } : p
    ));
    toast.success(
      places.find(p => p.id === placeId)?.locked 
        ? "장소 고정이 해제되었습니다" 
        : "장소가 고정되었습니다"
    );
  };

  const refreshPlaces = () => {
    const lockedCount = places.filter(p => p.locked).length;
    if (lockedCount === places.length) {
      toast.error("모든 장소가 고정되어 있습니다");
      return;
    }
    
    setOffset(prev => prev + 1);
    toast.success("새로운 장소를 불러옵니다");
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

  const getPopularityBadge = (place: Place) => {
    if (place.reviewCount < 100 && place.rating >= 4.5) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700">숨은명소</Badge>;
    }
    if (place.reviewCount > 1000 && place.rating >= 4.0) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700">인기장소</Badge>;
    }
    if (place.rating >= 4.5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">고평점</Badge>;
    }
    return null;
  };

  return (
    <div className="bg-white min-h-screen pb-32">
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

      <div className="pt-8 px-6">
        <button onClick={onBack} className="mb-6 flex items-center text-gray-600">
          <ChevronLeft className="w-5 h-5" />
          <span>뒤로</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl mb-2">스마트 경로 추천</h1>
          <p className="text-gray-500 mb-4">
            {travelStyle}형 · {location}
          </p>
          
          {/* Weather Widget */}
          <div className="mb-4">
            <WeatherWidget city={location} compact />
          </div>
          
          {weather && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>현재 날씨: {weather.description}</span>
              <span>·</span>
              <span>{weather.temperature}°C</span>
            </div>
          )}

          {/* Transport Mode Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={transportMode === "WALK" ? "default" : "outline"}
              onClick={() => setTransportMode("WALK")}
            >
              도보
            </Button>
            <Button
              size="sm"
              variant={transportMode === "TRANSIT" ? "default" : "outline"}
              onClick={() => setTransportMode("TRANSIT")}
            >
              대중교통
            </Button>
            <Button
              size="sm"
              variant={transportMode === "DRIVE" ? "default" : "outline"}
              onClick={() => setTransportMode("DRIVE")}
            >
              자동차
            </Button>
          </div>
        </div>

        {/* Route Summary */}
        {routeInfo && !calculating && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm mb-2">경로 정보</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">총 거리:</span>
                    <span className="ml-2">{routeInfo.totalDistanceText}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">이동 시간:</span>
                    <span className="ml-2">{routeInfo.totalTimeText}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">추천 일정:</span>
                    <span className="ml-2">{routeInfo.recommendedDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Refresh Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg">추천 장소</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshPlaces}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">장소를 불러오는 중...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-gray-600">장소를 찾을 수 없습니다</p>
            <Button onClick={() => setOffset(0)} variant="outline">
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {places.map((place, index) => (
                <div key={place.id}>
                  <Card className={`p-4 ${place.locked ? 'border-blue-500 border-2' : ''}`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 overflow-hidden">
                          <ImageWithFallback
                            src={getPlaceImage(place.category)}
                            alt={place.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div className="absolute -top-2 -left-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm shadow-md">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-sm mb-1">{place.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">{place.description}</p>
                          </div>
                          <button
                            onClick={() => toggleLock(place.id)}
                            className="ml-2 p-1 hover:bg-gray-100 rounded"
                          >
                            {place.locked ? (
                              <Lock className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Unlock className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{place.category}</Badge>
                          {getPopularityBadge(place)}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{place.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>리뷰 {place.reviewCount.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {place.keywords.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {place.keywords.map((keyword, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Route segment info */}
                  {routeInfo && routeInfo.routes[index] && !calculating && (
                    <div className="flex items-center gap-2 py-2 pl-4">
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Navigation className="w-3 h-3" />
                        <span>{routeInfo.routes[index].distanceText}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{routeInfo.routes[index].timeText}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Confirm Route Button */}
            {places.length >= 2 && routeInfo && (
              <div className="mt-6 mb-8">
                <Button 
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    onConfirmRoute(places, routeInfo, transportMode);
                    toast.success("경로가 확정되었습니다!");
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  경로 확정 및 지도 보기
                </Button>
              </div>
            )}
          </>
        )}


      </div>
    </div>
  );
}
