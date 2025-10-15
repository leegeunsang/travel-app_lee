import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronLeft, Loader2, MapPin } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RoutesPageProps {
  travelStyle: string;
  location: string;
  onBack: () => void;
}

interface RouteSpot {
  name: string;
  description: string;
  order: number;
  image: string;
}

interface TravelRoute {
  routeName: string;
  spots: RouteSpot[];
}

export function RoutesPage({ travelStyle, location, onBack }: RoutesPageProps) {
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      
      // First, try to get real places from Kakao
      const placesPromises = [];
      const searchQueries = getSearchQueriesByStyle(travelStyle);
      
      for (const query of searchQueries) {
        const promise = fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/search-places`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              query,
              location
            })
          }
        ).then(res => res.json());
        
        placesPromises.push(promise);
      }

      const placesResults = await Promise.all(placesPromises);
      const hasRealPlaces = placesResults.some(result => result.places && result.places.length > 0);

      if (hasRealPlaces) {
        // Create routes from real places
        const routesFromPlaces = createRoutesFromPlaces(placesResults, travelStyle);
        setRoutes(routesFromPlaces);
      } else {
        // Fallback to generated routes
        setRoutes(generateFallbackRoutes());
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setRoutes(generateFallbackRoutes());
    } finally {
      setLoading(false);
    }
  };

  const getSearchQueriesByStyle = (style: string): string[] => {
    if (style === "힐링") {
      return ["카페", "공원", "스파", "호텔"];
    } else if (style === "관광") {
      return ["박물관", "관광명소", "맛집", "호텔"];
    } else {
      return ["트레킹", "수상스포츠", "체험", "캠핑"];
    }
  };

  const createRoutesFromPlaces = (placesResults: any[], style: string): TravelRoute[] => {
    const routes: TravelRoute[] = [];
    
    // Route A
    const routeASpots: RouteSpot[] = [];
    placesResults.forEach((result, index) => {
      if (result.places && result.places.length > 0) {
        const place = result.places[0]; // Take first result
        routeASpots.push({
          name: place.name,
          description: place.category.split('>').pop()?.trim() || "추천 장소",
          order: index + 1,
          image: getImageForCategory(index)
        });
      }
    });

    if (routeASpots.length === 4) {
      routes.push({
        routeName: `${style} 코스 A`,
        spots: routeASpots
      });
    }

    // Route B
    const routeBSpots: RouteSpot[] = [];
    placesResults.forEach((result, index) => {
      if (result.places && result.places.length > 1) {
        const place = result.places[1]; // Take second result
        routeBSpots.push({
          name: place.name,
          description: place.category.split('>').pop()?.trim() || "추천 장소",
          order: index + 1,
          image: getImageForCategory(index)
        });
      }
    });

    if (routeBSpots.length === 4) {
      routes.push({
        routeName: `${style} 코스 B`,
        spots: routeBSpots
      });
    }

    return routes.length > 0 ? routes : generateFallbackRoutes();
  };

  const getImageForCategory = (index: number): string => {
    const images = [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ];
    return images[index] || images[0];
  };

  const generateFallbackRoutes = (): TravelRoute[] => {
    if (travelStyle === "힐링") {
      return [
        {
          routeName: "힐링 코스 A",
          spots: [
            { name: `${location} 카페`, description: "여유로운 브런치", order: 1, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" },
            { name: `${location} 공원`, description: "산책과 휴식", order: 2, image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f" },
            { name: `${location} 스파`, description: "온천과 마사지", order: 3, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef" },
            { name: `${location} 호텔`, description: "편안한 숙소", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ]
        },
        {
          routeName: "힐링 코스 B",
          spots: [
            { name: `${location} 해변`, description: "바다 감상", order: 1, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
            { name: `${location} 요가 센터`, description: "명상과 요가", order: 2, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b" },
            { name: `${location} 티하우스`, description: "전통 차 체험", order: 3, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc" },
            { name: `${location} 펜션`, description: "자연 속 숙소", order: 4, image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562" }
          ]
        }
      ];
    } else if (travelStyle === "관광") {
      return [
        {
          routeName: "관광 코스 A",
          spots: [
            { name: `${location} 박물관`, description: "역사 탐방", order: 1, image: "https://images.unsplash.com/photo-1565173877742-a47d02b5f9b2" },
            { name: `${location} 궁궐`, description: "문화재 관람", order: 2, image: "https://images.unsplash.com/photo-1548013146-72479768bada" },
            { name: `${location} 전통시장`, description: "로컬 맛집", order: 3, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
            { name: `${location} 호텔`, description: "도심 숙소", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ]
        },
        {
          routeName: "관광 코스 B",
          spots: [
            { name: `${location} 타워`, description: "전망대 관람", order: 1, image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8" },
            { name: `${location} 미술관`, description: "예술 감상", order: 2, image: "https://images.unsplash.com/photo-1578301978018-3005759f48f7" },
            { name: `${location} 쇼핑몰`, description: "쇼핑과 맛집", order: 3, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8" },
            { name: `${location} 게스트하우스`, description: "편안한 숙소", order: 4, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" }
          ]
        }
      ];
    } else {
      return [
        {
          routeName: "액티비티 코스 A",
          spots: [
            { name: `${location} 트레킹`, description: "산 등반", order: 1, image: "https://images.unsplash.com/photo-1551632811-561732d1e306" },
            { name: `${location} 수상스포츠`, description: "카약, 패들보드", order: 2, image: "https://images.unsplash.com/photo-1530870110042-98b2cb110834" },
            { name: `${location} 짚라인`, description: "스릴 체험", order: 3, image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3" },
            { name: `${location} 캠핑장`, description: "야외 숙박", order: 4, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4" }
          ]
        },
        {
          routeName: "액티비티 코스 B",
          spots: [
            { name: `${location} 자전거`, description: "사이클링 투어", order: 1, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64" },
            { name: `${location} 클라이밍`, description: "암벽 등반", order: 2, image: "https://images.unsplash.com/photo-1522163182402-834f871fd851" },
            { name: `${location} ATV`, description: "사륜 오토바이", order: 3, image: "https://images.unsplash.com/photo-1558980394-4c7c9f088ae6" },
            { name: `${location} 글램핑`, description: "럭셔리 캠핑", order: 4, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d" }
          ]
        }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-xl">
        <div className="pt-8 px-6">
          <button onClick={onBack} className="mb-6 flex items-center text-gray-600">
            <ChevronLeft className="w-5 h-5" />
            <span>추천 정보</span>
          </button>

          <h1 className="text-2xl mb-2">추천 여행 경로</h1>
          <p className="text-gray-500 mb-6">{travelStyle}형 맞춤 코스</p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {routes.map((route, routeIndex) => (
                <Card key={routeIndex} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg">{route.routeName}</h2>
                    <Badge variant="secondary">{travelStyle}</Badge>
                  </div>

                  <div className="space-y-4 mb-4">
                    {route.spots.map((spot, spotIndex) => (
                      <div key={spotIndex} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          {spot.order}
                        </div>
                        <div className="flex-shrink-0">
                          <ImageWithFallback
                            src={spot.image}
                            alt={spot.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm mb-1">{spot.name}</h3>
                          <p className="text-xs text-gray-500">{spot.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedRoute(selectedRoute === routeIndex ? null : routeIndex)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {selectedRoute === routeIndex ? "닫기" : "Details"}
                  </Button>

                  {selectedRoute === routeIndex && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm mb-2">
                              <strong>예상 소요시간:</strong> 1일 코스
                            </p>
                            <p className="text-sm mb-2">
                              <strong>추천 이동수단:</strong> {travelStyle === "액티비티" ? "렌터카" : "대중교통"}
                            </p>
                            <p className="text-sm text-gray-600">
                              이 코스는 {travelStyle} 여행 스타일에 최적화된 경로입니다. 
                              각 장소에서 충분한 시간을 가지고 즐기실 수 있도록 구성했습니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> 카카오 REST API 키를 설정하면 {location}의 실제 장소가 추천됩니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
