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
  onRetakeSurvey?: () => void;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export function RecommendationPage({ travelStyle, location, accessToken, onBack, onShowMap, onShowRoutes, onShowSmartRoute, onSaveItinerary, onRetakeSurvey }: RecommendationPageProps) {
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

      console.log(`[RecommendationPage] Fetching weather and recommendations for ${location} (${travelStyle})`);

      // Fetch weather
      let weatherData = null;
      try {
        // First check if the API is available
        if (!projectId || !publicAnonKey) {
          console.error("[RecommendationPage] ❌ Supabase configuration missing");
          throw new Error("Supabase configuration missing");
        }

        const weatherUrl = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/${encodeURIComponent(location)}`;
        console.log(`[RecommendationPage] Weather API URL:`, weatherUrl);
        console.log(`[RecommendationPage] Location:`, location);
        
        const weatherResponse = await fetch(weatherUrl, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`[RecommendationPage] Weather API response status: ${weatherResponse.status}`);

        if (weatherResponse.status === 404) {
          console.error(`[RecommendationPage] ❌ 404 ERROR: Edge Function not found!`);
          console.error(`[RecommendationPage] Please ensure the Supabase Edge Function is deployed.`);
          console.error(`[RecommendationPage] Expected URL: ${weatherUrl}`);
          throw new Error("Edge Function not deployed (404)");
        }

        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
          console.log(`[RecommendationPage] Weather data received:`, weatherData);
          
          // Set weather data if valid
          if (weatherData && !weatherData.error) {
            setWeather(weatherData);
            
            if (weatherData.isMock) {
              if (weatherData.error === 'invalid_api_key') {
                console.error("[RecommendationPage] ❌ Invalid OPENWEATHER_API_KEY - using mock data");
              } else {
                console.warn("[RecommendationPage] ⚠️ Using mock weather data (OPENWEATHER_API_KEY may not be set)");
              }
            } else {
              console.log("[RecommendationPage] ✅ Real weather data loaded");
            }
          }
        } else {
          const errorText = await weatherResponse.text();
          console.error(`[RecommendationPage] Weather API error: ${weatherResponse.status} - ${errorText}`);
          
          if (weatherResponse.status === 401) {
            console.error("[RecommendationPage] 🔑 401 Unauthorized - Invalid API key");
          }
          
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
      } catch (weatherError) {
        console.error("[RecommendationPage] Weather fetch failed:", weatherError);
        console.error("[RecommendationPage] Falling back to mock weather data");
      }
      
      // Use fallback weather if none was retrieved
      if (!weatherData) {
        console.log("[RecommendationPage] Using fallback weather data");
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
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "관광":
        return "bg-gray-200 text-gray-900 border-gray-400";
      case "액티비티":
        return "bg-gray-300 text-gray-900 border-gray-500";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
      <div className="w-full max-w-[412px] bg-white/80 backdrop-blur-xl min-h-screen shadow-2xl pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8">
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={onBack} 
              whileTap={{ scale: 0.9 }}
              className="p-2.5 -ml-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <div>
              <h1 className="text-2xl text-white font-semibold">맞춤형 여행 추천</h1>
              <p className="text-gray-300 text-sm mt-1">{location} 여행</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Travel Style Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-5 shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{getTravelStyleIcon(travelStyle)}</div>
                  <div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">당신의 여행 성향</p>
                    <div className={`inline-block px-6 py-2.5 rounded-xl border-2 ${getTravelStyleColor(travelStyle)} font-semibold text-lg`}>
                      {travelStyle}형
                    </div>
                  </div>
                </div>
                {onRetakeSurvey && (
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetakeSurvey}
                      className="text-sm font-medium border-2 hover:bg-indigo-50"
                    >
                      재분석
                    </Button>
                  </motion.div>
                )}
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
                <MapPin className="w-6 h-6 text-gray-700" />
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
                <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
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
            <Card className="p-6 mb-4 shadow-sm border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white">
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
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          {/* Attractions List */}
          <div className="mb-6">
            <AttractionsList 
              location={location} 
              accessToken={accessToken}
              weather={weather}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => onShowSmartRoute(weather)} 
              className="w-full py-7 rounded-2xl text-base shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700"
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
