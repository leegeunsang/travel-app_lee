import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MapPin, Cloud, ThermometerSun, Wind, Droplets, Loader2, Save } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { AttractionsList } from "./AttractionsList";

interface RecommendationPageProps {
  travelStyle: string;
  location: string;
  accessToken?: string;
  onBack: () => void;
  onShowMap: () => void;
  onShowRoutes: () => void;
  onSaveItinerary?: () => void;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export function RecommendationPage({ travelStyle, location, accessToken, onBack, onShowMap, onShowRoutes, onSaveItinerary }: RecommendationPageProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherAndRecommendation();
  }, []);

  const fetchWeatherAndRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch weather
      const weatherResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/${encodeURIComponent(location)}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json().catch(() => ({}));
        console.error("Weather API error:", errorData);
        throw new Error(errorData.error || "날씨 정보를 가져올 수 없습니다.");
      }

      const weatherData = await weatherResponse.json();
      
      // Check if weatherData has error
      if (weatherData.error) {
        console.error("Weather data error:", weatherData.error);
        throw new Error(weatherData.error);
      }
      
      // Set weather even if it's mock data
      setWeather(weatherData);
      
      // Show info if using mock data
      if (weatherData.isMock) {
        console.log("Using mock weather data");
      }

      // Fetch GPT recommendation
      const recommendResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            travelStyle,
            location,
            weather: weatherData ? `${weatherData.temperature}°C, ${weatherData.description}` : "정보 없음"
          })
        }
      );

      if (!recommendResponse.ok) {
        const errorData = await recommendResponse.json().catch(() => ({}));
        console.error("Recommendation API error:", errorData);
        // Don't throw error, just use fallback
      } else {
        const recommendData = await recommendResponse.json();
        if (recommendData.recommendation) {
          setRecommendation(recommendData.recommendation);
          return; // Success, exit early
        }
      }
      // Fallback if API call failed or no recommendation
      throw new Error("API 응답을 처리할 수 없습니다.");
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.";
      
      // Only show error if it's a critical error (not API key related)
      if (!errorMessage.includes("API key")) {
        setError(errorMessage);
      }
      
      // Fallback recommendation
      setRecommendation(
        `${travelStyle} 성향에 맞는 ${location}의 멋진 여행지를 추천드립니다! ` +
        `현지의 특색있는 명소들을 방문하며 즐거운 시간을 보내세요.`
      );
    } finally {
      setLoading(false);
    }
  };

  const getTravelStyleIcon = (style: string) => {
    switch (style) {
      case "힐링":
        return "🧘‍♀️";
      case "관광":
        return "🏛️";
      case "액티비티":
        return "🏃‍♂️";
      default:
        return "✈️";
    }
  };

  const getTravelStyleColor = (style: string) => {
    switch (style) {
      case "힐링":
        return "bg-green-100 text-green-700";
      case "관광":
        return "bg-blue-100 text-blue-700";
      case "액티비티":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen pb-20 px-6">
      <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <h1 className="text-2xl mb-6">맞춤형 여행 추천</h1>

        {/* Travel Style Result */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getTravelStyleIcon(travelStyle)}</div>
            <div>
              <p className="text-sm text-gray-500 mb-1">당신의 여행 성향</p>
              <div className={`inline-block px-4 py-1 rounded-full ${getTravelStyleColor(travelStyle)}`}>
                {travelStyle}형
              </div>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">여행 지역</p>
              <p className="font-medium">{location}</p>
            </div>
          </div>
        </Card>

        {/* Weather Info */}
        {loading ? (
          <Card className="p-6 mb-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </Card>
        ) : weather && (
          <Card className="p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-blue-500" />
                <h3>현재 날씨</h3>
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-500" />
                <span className="text-2xl">{weather.temperature}°C</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{weather.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                <span>습도 {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4" />
                <span>풍속 {weather.windSpeed}m/s</span>
              </div>
            </div>
          </Card>
        )}

        {/* AI Recommendation */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🤖</div>
            <h3>AI 추천</h3>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>맞춤 추천을 생성하고 있습니다...</span>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {recommendation}
            </p>
          )}
        </Card>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">⚠️ {error}</p>
          </div>
        )}

        {/* Attractions List */}
        <div className="mb-4">
          <AttractionsList 
            location={location} 
            accessToken={accessToken}
          />
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onShowRoutes} 
            className="w-full"
            size="lg"
          >
            🗺️ 추천 여행 경로 보기
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            {accessToken && onSaveItinerary && (
              <Button onClick={onSaveItinerary} variant="outline" size="lg">
                <Save className="w-4 h-4 mr-2" />
                일정 저장
              </Button>
            )}
            <Button 
              onClick={onShowMap} 
              variant="outline"
              className={accessToken && onSaveItinerary ? "" : "col-span-2"} 
              size="lg"
            >
              지도 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
