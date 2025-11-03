import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { waitForKakaoMaps, isKakaoMapsReady } from "../utils/kakao-script-loader";

interface KakaoMapProps {
  markers: Array<{
    position: { lat: number; lng: number };
    title: string;
    content?: string;
  }>;
  center?: { lat: number; lng: number };
  level?: number;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMap({ markers, center, level = 7 }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPlacesList, setShowPlacesList] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        // Wait for Kakao Maps SDK (with 15s timeout)
        await waitForKakaoMaps(15000);
        
        if (!mapContainer.current || !isKakaoMapsReady()) {
          // Silently fail - will show place list instead
          setError(true);
          setShowPlacesList(true);
          setIsLoading(false);
          return;
        }

        const defaultCenter = center || { lat: 37.5665, lng: 126.9780 }; // Seoul
        const mapOption = {
          center: new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
          level: level
        };

        // Create map
        const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
        mapRef.current = map;

        // Add markers
        markers.forEach((markerData, index) => {
          const markerPosition = new window.kakao.maps.LatLng(
            markerData.position.lat,
            markerData.position.lng
          );

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: markerData.title
          });

          marker.setMap(map);

          // Add info window if content exists
          if (markerData.content) {
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;font-size:12px;">${markerData.content}</div>`
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });
          }

          // Add number label
          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: `<div style="background:#4F46E5;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;margin-bottom:40px;">${index + 1}</div>`,
            yAnchor: 1
          });

          customOverlay.setMap(map);
        });

        // Adjust map to fit all markers
        if (markers.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          markers.forEach((markerData) => {
            bounds.extend(
              new window.kakao.maps.LatLng(
                markerData.position.lat,
                markerData.position.lng
              )
            );
          });
          map.setBounds(bounds);
        }
        
        setIsLoading(false);
      } catch (err) {
        // Silently fail - will show place list instead
        setError(true);
        setShowPlacesList(true);
        setIsLoading(false);
      }
    };

    initMap();
  }, [markers, center, level]);

  return (
    <div className="relative w-full h-full rounded-xl" style={{ minHeight: "400px" }}>
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {error && showPlacesList && (
        <div className="absolute inset-0 bg-white rounded-xl overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-800">여행지 목록</h3>
            </div>
            <p className="text-xs text-gray-600">
              지도 SDK를 불러올 수 없어 목록 형태로 표시합니다
            </p>
          </div>
          
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "350px" }}>
            <div className="space-y-3">
              {markers.map((marker, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {marker.title}
                    </h4>
                    {marker.content && (
                      <p className="text-xs text-gray-600">{marker.content}</p>
                    )}
                    <div className="mt-2 flex gap-2 text-xs text-gray-500">
                      <span>위도: {marker.position.lat.toFixed(4)}</span>
                      <span>•</span>
                      <span>경도: {marker.position.lng.toFixed(4)}</span>
                    </div>
                    <a
                      href={`https://map.kakao.com/link/map/${encodeURIComponent(marker.title)},${marker.position.lat},${marker.position.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      카카오맵에서 보기 →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-xs text-center text-gray-600 mb-2">
              지도 표시 문제가 지속되나요?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
              >
                새로고침
              </button>
              <a
                href="/#kakao-debug"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = 'kakao-debug';
                  window.location.reload();
                }}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition text-center"
              >
                🔧 진단
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
