import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Cloud, ThermometerSun, Wind, Droplets, Loader2, Save, Map as MapIcon, Route, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { AttractionsList } from "./AttractionsList";
import { motion } from "motion/react";
import { WeatherWidget } from "./WeatherWidget";

interface RecommendationPageProps {
  travelStyle: string;
  location: string;
  accessToken?: string;
  onBack: () => void;
  onShowMap: () => void;
  onShowRoutes: () => void;
  onShowSmartRoute: (weather: any) => void;
  onSaveItinerary?: () => void;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export function RecommendationPage({ travelStyle, location, accessToken, onBack, onShowMap, onShowRoutes, onShowSmartRoute, onSaveItinerary }: RecommendationPageProps) {
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
      let weatherData = null;
      try {
        const weatherResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/${encodeURIComponent(location)}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`
            }
          }
        );

        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
          
          // Set weather data if valid
          if (weatherData && !weatherData.error) {
            setWeather(weatherData);
            
            if (weatherData.isMock) {
              console.log("Using mock weather data");
            }
          }
        } else {
          console.log("Weather API returned error, using fallback");
        }
      } catch (weatherError) {
        console.log("Weather fetch failed, continuing without weather:", weatherError);
      }
      
      // Use fallback weather if none was retrieved
      if (!weatherData) {
        weatherData = {
          temperature: 20,
          description: "맑음",
          icon: "01d",
          humidity: 60,
          windSpeed: 2.5,
          isMock: true
        };
        setWeather(weatherData);
      }

      // Fetch GPT recommendation
      try {
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

        if (recommendResponse.ok) {
          const recommendData = await recommendResponse.json();
          if (recommendData.recommendation) {
            setRecommendation(recommendData.recommendation);
            return; // Success, exit early
          }
        } else {
          console.log("Recommendation API returned error, using fallback");
        }
      } catch (recommendError) {
        console.log("Recommendation fetch failed, using fallback:", recommendError);
      }

      // Fallback recommendation
      setRecommendation(
        `${travelStyle} 성향에 맞는 ${location}의 멋진 여행지를 추천드립니다! ` +
        `현지의 특색있는 명소들을 방문하며 즐거운 시간을 보내세요.`
      );
    } catch (err) {
      console.error("Critical error in fetchWeatherAndRecommendation:", err);
      
      // Set fallback data
      setWeather({
        temperature: 20,
        description: "맑음",
        icon: "01d",
        humidity: 60,
        windSpeed: 2.5,
        isMock: true
      });
      
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
        return "bg-green-100 text-green-700 border-green-200";
      case "관광":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "액티비티":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl pb-20">
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
        <div className="bg-white px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl">맞춤형 여행 추천</h1>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Travel Style Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-4 shadow-sm border-2">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{getTravelStyleIcon(travelStyle)}</div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">당신의 여행 성향</p>
                  <div className={`inline-block px-5 py-2 rounded-xl border-2 ${getTravelStyleColor(travelStyle)}`}>
                    {travelStyle}형
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-4 shadow-sm border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">여행 지역</p>
                  <p className="text-lg text-gray-800">{location}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Weather Info */}
          {loading ? (
            <Card className="p-6 mb-4 shadow-sm border-2 border-gray-200">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            </Card>
          ) : weather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-4">
                <WeatherWidget city={location} />
              </div>
            </motion.div>
          )}

          {/* AI Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 mb-4 shadow-sm border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🤖</div>
                <h3 className="text-lg text-gray-800">AI 맞춤 추천</h3>
              </div>
              {loading ? (
                <div className="flex items-center gap-3 text-gray-600 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>맞춤 추천을 생성하고 있습니다...</span>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-base">
                  {recommendation}
                </p>
              )}
            </Card>
          </motion.div>

          {error && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800">⚠️ {error}</p>
            </div>
          )}

          {/* Attractions List */}
          <div className="mb-6">
            <AttractionsList 
              location={location} 
              accessToken={accessToken}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => onShowSmartRoute(weather)} 
              className="w-full py-7 rounded-2xl text-base shadow-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              스마트 경로 추천
            </Button>

            <Button 
              onClick={onShowRoutes} 
              className="w-full py-7 rounded-2xl text-base shadow-sm"
              size="lg"
              variant="outline"
            >
              <Route className="w-5 h-5 mr-2" />
              기본 여행 경로 보기
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              {accessToken && onSaveItinerary && (
                <Button 
                  onClick={onSaveItinerary} 
                  variant="outline" 
                  className="py-7 rounded-2xl border-2"
                  size="lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  일정 저장
                </Button>
              )}
              <Button 
                onClick={onShowMap} 
                variant="outline"
                className={`py-7 rounded-2xl border-2 ${accessToken && onSaveItinerary ? "" : "col-span-2"}`}
                size="lg"
              >
                <MapIcon className="w-5 h-5 mr-2" />
                지도 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
