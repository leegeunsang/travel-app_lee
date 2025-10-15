import { useEffect, useRef } from "react";

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

  useEffect(() => {
    // Load Kakao Maps SDK
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

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
      });
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [markers, center, level]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-xl"
      style={{ minHeight: "400px" }}
    />
  );
}
