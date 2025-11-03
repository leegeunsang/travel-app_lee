import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { MapPin, Star, Loader2, Bookmark, Cloud, Sun, CloudRain, ArrowUpDown } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  isMock?: boolean;
}

interface AttractionsListProps {
  location: string;
  accessToken?: string;
  weather?: WeatherData | null;
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
  isIndoor?: boolean;
  weatherScore?: number;
}

// Area codes mapping for major cities and regions
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
  "제주": "39",
  // Major cities mapped to their provinces
  "경주": "35", // 경북
  "포항": "35", // 경북
  "안동": "35", // 경북
  "구미": "35", // 경북
  "전주": "37", // 전북
  "군산": "37", // 전북
  "익산": "37", // 전북
  "여수": "38", // 전남
  "순천": "38", // 전남
  "목포": "38", // 전남
  "창원": "36", // 경남
  "진주": "36", // 경남
  "김해": "36", // 경남
  "통영": "36", // 경남
  "거제": "36", // 경남
  "춘천": "32", // 강원
  "원주": "32", // 강원
  "강릉": "32", // 강원
  "속초": "32", // 강원
  "동해": "32", // 강원
  "수원": "31", // 경기
  "성남": "31", // 경기
  "고양": "31", // 경기
  "용인": "31", // 경기
  "부천": "31", // 경기
  "안산": "31", // 경기
  "안양": "31", // 경기
  "남양주": "31", // 경기
  "화성": "31", // 경기
  "평택": "31", // 경기
  "의정부": "31", // 경기
  "시흥": "31", // 경기
  "파주": "31", // 경기
  "청주": "33", // 충북
  "충주": "33", // 충북
  "제천": "33", // 충북
  "천안": "34", // 충남
  "아산": "34", // 충남
  "서산": "34", // 충남
  "논산": "34" // 충남
};

type SortOption = 'weather' | 'name' | 'indoor' | 'outdoor';

export function AttractionsList({ location, accessToken, weather, onBookmark }: AttractionsListProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('weather');

  useEffect(() => {
    fetchAttractions();
  }, [location]);

  // 실내 여행지 키워드
  const indoorKeywords = [
    '박물관', '미술관', '수족관', '전시관', '아쿠아리움', '갤러리',
    '공연장', '극장', '영화관', '쇼핑몰', '백화점', '마트',
    '문화센터', '과학관', '체험관', '전시장', '기념관', '역사관',
    '카페', '음식점', '식당', '레스토랑', '찜질방', '스파', '온천',
    '실내', '센터', '홀', '타워', '빌딩', '건물'
  ];

  // 실외 여행지 키워드
  const outdoorKeywords = [
    '공원', '해변', '해수욕장', '비치', '산', '등산', '산책로', '트레킹',
    '폭포', '계곡', '섬', '유원지', '동물원', '식물원', '정원',
    '호수', '강', '바다', '숲', '자연', '야외', '해안', '항구',
    '전망대', '광장', '거리', '길', '도로', '다리', '성', '사찰',
    '절', '마을', '민속촌', '테마파크', '랜드'
  ];

  // 관광지가 실내인지 판단
  const isIndoorAttraction = (attraction: Attraction): boolean => {
    const text = `${attraction.title} ${attraction.addr1}`.toLowerCase();
    
    const hasIndoorKeyword = indoorKeywords.some(keyword => text.includes(keyword));
    const hasOutdoorKeyword = outdoorKeywords.some(keyword => text.includes(keyword));
    
    // 실내 키워드만 있으면 실내
    if (hasIndoorKeyword && !hasOutdoorKeyword) return true;
    // 실외 키워드만 있으면 실외
    if (hasOutdoorKeyword && !hasIndoorKeyword) return false;
    // 둘 다 있거나 없으면 기본값 (실외로 간주)
    return false;
  };

  // 날씨에 따른 추천 점수 계산
  const getWeatherScore = (attraction: Attraction, weatherIcon?: string): number => {
    if (!weatherIcon) return 0;
    
    const isIndoor = isIndoorAttraction(attraction);
    const weatherCode = weatherIcon.substring(0, 2);
    
    // 비/눈이 오는 날씨 (09: 소나기, 10: 비, 11: 뇌우, 13: 눈)
    const isRainyOrSnowy = ['09', '10', '11', '13'].includes(weatherCode);
    // 맑은 날씨 (01: 맑음, 02: 약간 흐림)
    const isSunny = ['01', '02'].includes(weatherCode);
    
    if (isRainyOrSnowy) {
      // 비/눈 오는 날: 실내 관광지에 높은 점수
      return isIndoor ? 10 : 1;
    } else if (isSunny) {
      // 맑은 날: 실외 관광지에 높은 점수
      return isIndoor ? 1 : 10;
    } else {
      // 흐린 날: 둘 다 비슷하게, 약간 실내 우선
      return isIndoor ? 6 : 5;
    }
  };

  // 날씨 상태 메시지 가져오기
  const getWeatherRecommendationMessage = (): string | null => {
    if (!weather) return null;
    
    const weatherCode = weather.icon.substring(0, 2);
    const isRainyOrSnowy = ['09', '10', '11', '13'].includes(weatherCode);
    const isSunny = ['01', '02'].includes(weatherCode);
    
    if (isRainyOrSnowy) {
      return '☔ 비가 오는 날씨라 실내 관광지를 우선 추천합니다';
    } else if (isSunny) {
      return '☀️ 화창한 날씨라 야외 관광지를 우선 추천합니다';
    } else {
      return '☁️ 흐린 날씨지만 관광하기 좋은 날입니다';
    }
  };

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
      
      // Process attractions with weather-based scoring
      const processedAttractions = (data.attractions || []).map((attr: Attraction) => ({
        ...attr,
        isIndoor: isIndoorAttraction(attr),
        weatherScore: getWeatherScore(attr, weather?.icon)
      }));

      setAttractions(processedAttractions);
      
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

  // 정렬 함수
  const getSortedAttractions = (): Attraction[] => {
    const sorted = [...attractions];
    
    switch (sortOption) {
      case 'weather':
        // 날씨 점수 기준 정렬 (높은 순)
        return sorted.sort((a, b) => (b.weatherScore || 0) - (a.weatherScore || 0));
      
      case 'name':
        // 이름순 정렬 (가나다순)
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
      
      case 'indoor':
        // 실내 우선 정렬
        return sorted.sort((a, b) => {
          if (a.isIndoor === b.isIndoor) return 0;
          return a.isIndoor ? -1 : 1;
        });
      
      case 'outdoor':
        // 실외 우선 정렬
        return sorted.sort((a, b) => {
          if (a.isIndoor === b.isIndoor) return 0;
          return a.isIndoor ? 1 : -1;
        });
      
      default:
        return sorted;
    }
  };

  const weatherMessage = getWeatherRecommendationMessage();
  const sortedAttractions = getSortedAttractions();

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="flex-shrink-0">{location} 추천 관광지</h3>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-yellow-600">샘플</span>
            )}
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weather">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>날씨 맞춤형</span>
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>이름순</span>
                  </div>
                </SelectItem>
                <SelectItem value="indoor">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>실내 우선</span>
                  </div>
                </SelectItem>
                <SelectItem value="outdoor">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5" />
                    <span>실외 우선</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {weatherMessage && weather && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            {weather.icon.substring(0, 2) === '09' || weather.icon.substring(0, 2) === '10' || 
             weather.icon.substring(0, 2) === '11' || weather.icon.substring(0, 2) === '13' ? (
              <CloudRain className="w-5 h-5 text-blue-600" />
            ) : weather.icon.substring(0, 2) === '01' || weather.icon.substring(0, 2) === '02' ? (
              <Sun className="w-5 h-5 text-yellow-600" />
            ) : (
              <Cloud className="w-5 h-5 text-gray-600" />
            )}
            <p className="text-sm text-gray-700">{weatherMessage}</p>
          </div>
        )}
      </div>
      {sortedAttractions.map((attraction) => (
        <Card key={attraction.contentid} className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4>{attraction.title}</h4>
                {attraction.isIndoor !== undefined && weather && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    attraction.isIndoor 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {attraction.isIndoor ? '실내' : '실외'}
                  </span>
                )}
              </div>
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
