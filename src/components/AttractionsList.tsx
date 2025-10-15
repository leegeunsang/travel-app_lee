import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { MapPin, Star, Loader2, Bookmark } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Button } from "./ui/button";

interface AttractionsListProps {
  location: string;
  accessToken?: string;
  onBookmark?: (name: string, category: string) => void;
}

interface Attraction {
  title: string;
  addr1: string;
  contentid: string;
  firstimage?: string;
  tel?: string;
  mapx?: string;
  mapy?: string;
}

// Area codes mapping for major cities
const areaCodes: { [key: string]: string } = {
  "서울": "1",
  "인천": "2",
  "대전": "3",
  "대구": "4",
  "광주": "5",
  "부산": "6",
  "울산": "7",
  "세종": "8",
  "경기": "31",
  "강원": "32",
  "충북": "33",
  "충남": "34",
  "경북": "35",
  "경남": "36",
  "전북": "37",
  "전남": "38",
  "제주": "39"
};

export function AttractionsList({ location, accessToken, onBookmark }: AttractionsListProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttractions();
  }, [location]);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get area code from location
      const areaCode = areaCodes[location] || "1"; // Default to Seoul

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/attractions/${areaCode}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Attractions API error:", errorData);
        throw new Error(errorData.error || "관광지 정보를 불러올 수 없습니다.");
      }

      const data = await response.json();
      
      // Check if data has error
      if (data.error) {
        console.error("Attractions data error:", data.error);
        throw new Error(data.error);
      }
      
      // Set attractions even if it's mock data
      setAttractions(data.attractions || []);
      
      // Show info if using mock data
      if (data.isMock) {
        console.log("Using mock attractions data");
        setError(null); // Clear error since we have mock data
      }
    } catch (err) {
      console.error("Error fetching attractions:", err);
      const errorMessage = err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.";
      
      // Only show error if it's not API key related
      if (!errorMessage.includes("API key")) {
        setError(errorMessage);
      } else {
        setError("관광 API 키가 설정되지 않았습니다. 일부 기능이 제한됩니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = async (attraction: Attraction) => {
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            location,
            name: attraction.title,
            category: "관광지"
          })
        }
      );

      if (response.ok) {
        alert("북마크에 추가되었습니다!");
        if (onBookmark) {
          onBookmark(attraction.title, "관광지");
        }
      } else {
        alert("북마크 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error bookmarking:", error);
      alert("북마크 추가에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && attractions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">⚠️ {error}</p>
        <p className="text-xs text-yellow-700 mt-2">
          공공데이터 API 키를 확인하거나, 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <MapPin className="w-12 h-12 mx-auto mb-3" />
        <p>해당 지역의 관광지 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3>{location} 추천 관광지</h3>
        {error && (
          <span className="text-xs text-yellow-600">샘플 데이터</span>
        )}
      </div>
      {attractions.map((attraction) => (
        <Card key={attraction.contentid} className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h4 className="mb-2">{attraction.title}</h4>
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{attraction.addr1}</span>
              </div>
              {attraction.tel && (
                <p className="text-xs text-gray-500">📞 {attraction.tel}</p>
              )}
            </div>
            {accessToken && (
              <button
                onClick={() => handleBookmarkClick(attraction)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
