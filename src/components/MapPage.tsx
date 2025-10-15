import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MapPin, List } from "lucide-react";
import { AttractionsList } from "./AttractionsList";

interface MapPageProps {
  location: string;
  accessToken?: string;
  onBack: () => void;
}

// Kakao Map types
declare global {
  interface Window {
    kakao: any;
  }
}

export function MapPage({ location, accessToken, onBack }: MapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showAttractions, setShowAttractions] = useState(true);

  useEffect(() => {
    // Load Kakao Map script
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          initMap();
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [location]);

  const initMap = () => {
    if (!mapRef.current || !window.kakao) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Default: Seoul
      level: 5
    };

    const map = new window.kakao.maps.Map(container, options);

    // Search for location
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(location, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        
        // Add marker
        const marker = new window.kakao.maps.Marker({
          position: coords,
          map: map
        });

        // Move map to location
        map.setCenter(coords);

        // Add info window
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${location}</div>`
        });
        infowindow.open(map, marker);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-xl">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-gray-600">
            ← 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{location}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-[500px]"
        style={{ backgroundColor: "#f0f0f0" }}
      >
        {/* Fallback for map loading */}
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4" />
            <p>지도를 불러오는 중...</p>
            <p className="text-sm mt-2">
              카카오맵 API 키가 필요합니다
            </p>
          </div>
        </div>
      </div>

      {/* Attractions Section */}
      <div className="px-6 py-6">
        <Button
          onClick={() => setShowAttractions(!showAttractions)}
          variant="outline"
          className="w-full mb-4"
        >
          <List className="w-4 h-4 mr-2" />
          {showAttractions ? "목록 숨기기" : "주변 관광지 보기"}
        </Button>

        {showAttractions && (
          <AttractionsList 
            location={location} 
            accessToken={accessToken}
          />
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>지도 기능 안내:</strong> 카카오맵 API 키를 설정하면 실제 지도가 표시되며, 
            마커 클릭 시 상세 정보와 경로 안내를 제공합니다.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
