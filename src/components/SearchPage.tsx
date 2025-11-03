import { useState } from "react";
import { Search, MapPin, TrendingUp, ArrowLeft, Compass, Navigation, Loader2, Info, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { WeatherWidget } from "./WeatherWidget";
import { getCurrentLocationRegion, LocationPermissionError } from "../utils/geolocation";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getLocationPermissionInstructions, isMobileBrowser } from "../utils/browser-detector";
import { toast } from "sonner@2.0.3";

interface SearchPageProps {
  onSearch: (location: string) => void;
  onBack: () => void;
  onExploreAttractions?: () => void;
  onPopularHidden?: () => void;
}

const popularDestinations = [
  { name: "서울", region: "수도권", emoji: "🏙️" },
  { name: "부산", region: "경상남도", emoji: "🌊" },
  { name: "제주", region: "제주특별자치도", emoji: "🌴" },
  { name: "강릉", region: "강원도", emoji: "⛰️" },
  { name: "전주", region: "전라북도", emoji: "🏯" },
  { name: "경주", region: "경상북도", emoji: "🏛️" },
  { name: "여수", region: "전라남도", emoji: "🌅" },
  { name: "대구", region: "경상북도", emoji: "🌆" }
];

const regions = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

export function SearchPage({ onSearch, onBack, onExploreAttractions, onPopularHidden }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("서울");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showLocationHelp, setShowLocationHelp] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = regions.filter(region => 
        region.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRegions(filtered);
    } else {
      setFilteredRegions([]);
    }
  };

  const handleSelectLocation = (location: string) => {
    setSelectedCity(location);
    onSearch(location);
  };

  const handleDestinationClick = (destination: string) => {
    setSelectedCity(destination);
    onSearch(destination);
  };

  const handleCurrentLocation = async () => {
    setLoadingLocation(true);
    
    // Safely check if we're in development/preview mode
    let isDevelopment = false;
    try {
      isDevelopment = import.meta?.env?.VITE_USE_DEFAULT_LOCATION === 'true';
    } catch (e) {
      isDevelopment = false;
    }
    const isFigmaPreview = window.location.hostname.includes('figma') || 
                           window.location.hostname.includes('preview');
    
    try {
      if (isDevelopment || isFigmaPreview) {
        toast.info('개발 모드: 기본 위치(서울)를 사용합니다', {
          duration: 3000,
        });
      } else {
        toast.info('현재 위치를 확인하고 있습니다...', {
          duration: 2000,
        });
      }
      
      const locationData = await getCurrentLocationRegion(projectId, publicAnonKey);
      
      // Use region name for search
      const region = locationData.region;
      
      if (isDevelopment || isFigmaPreview) {
        toast.success(`개발 모드: 서울 지역으로 설정되었습니다`);
      } else {
        toast.success(`현재 위치: ${locationData.fullAddress}`);
      }
      
      setSelectedCity(region);
      onSearch(region);
      
    } catch (error) {
      // Handle LocationPermissionError specially
      if (error instanceof LocationPermissionError) {
        if (error.code === 'PERMISSION_DENIED') {
          // Show help dialog for permission denied
          setShowLocationHelp(true);
          toast.error('위치 권한이 필요합니다', {
            description: '아래 도움말을 확인하세요',
            duration: 4000,
          });
        } else if (error.code === 'TIMEOUT') {
          toast.error('위치 확인 시간 초과', {
            description: '다시 시도하거나 수동으로 지역을 선택하세요',
            duration: 4000,
          });
        } else if (error.code === 'POSITION_UNAVAILABLE') {
          toast.error('위치 정보를 사용할 수 없습니다', {
            description: 'GPS를 켜거나 수동으로 지역을 선택하세요',
            duration: 4000,
          });
        } else if (error.code === 'NOT_SUPPORTED') {
          toast.error('브라우저가 위치 기능을 지원하지 않습니다', {
            description: '수동으로 지역을 선택하세요',
            duration: 4000,
          });
        }
      } else if (error instanceof Error) {
        // Other errors
        console.warn('Location error:', error.message);
        toast.error('위치 확인 실패', {
          description: '수동으로 지역을 선택하세요',
          duration: 4000,
        });
      } else {
        toast.error('위치 정보를 가져오는데 실패했습니다.', {
          description: '수동으로 지역을 선택하세요',
          duration: 4000,
        });
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
      <div className="w-full max-w-[412px] bg-white/80 backdrop-blur-xl min-h-screen shadow-2xl pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.button 
              onClick={onBack} 
              whileTap={{ scale: 0.9 }}
              className="p-2.5 -ml-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <h1 className="text-2xl text-white font-semibold">여행지 검색</h1>
          </div>
          
          {/* Search Input - Moved to header */}
          <div className="relative flex items-center gap-3 bg-white rounded-2xl shadow-lg px-5 py-4">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <Input
              type="text"
              placeholder="지역명을 입력하세요 (예: 서울, 부산, 제주)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Development Mode Banner */}
          {(() => {
            let isDevelopment = false;
            try {
              isDevelopment = import.meta?.env?.VITE_USE_DEFAULT_LOCATION === 'true';
            } catch (e) {
              isDevelopment = false;
            }
            const isFigmaPreview = window.location.hostname.includes('figma') || 
                                   window.location.hostname.includes('preview');
            
            if (isDevelopment || isFigmaPreview) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🛠️</div>
                    <div className="flex-1">
                      <h3 className="text-yellow-900 mb-2">개발 모드 활성화</h3>
                      <p className="text-sm text-yellow-800 leading-relaxed">
                        현재 Figma Make 또는 개발 환경에서 실행 중입니다. 
                        GPS 위치 대신 기본 위치(서울)가 사용됩니다.
                        실제 배포 시에는 사용자의 실제 위치를 사용합니다.
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}

          {/* Weather Widget */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-gray-700">현재 날씨</h3>
              <span className="text-sm text-gray-500">({selectedCity})</span>
            </div>
            <WeatherWidget city={selectedCity} />
          </div>

          {/* Current Location Button */}
          <div className="mb-6">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleCurrentLocation}
                disabled={loadingLocation}
                className="w-full py-7 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all"
                size="lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">위치 확인 중...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-lg">현재 위치에서 찾기</span>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Location Permission Help Dialog */}
          <AnimatePresence>
            {showLocationHelp && (() => {
              const browserInfo = getLocationPermissionInstructions();
              const isMobile = isMobileBrowser();
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative"
                >
                  <button
                    onClick={() => setShowLocationHelp(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-blue-600" />
                  </button>

                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-blue-900 mb-3">위치 권한 설정 방법</h3>
                      
                      <div className="mb-4">
                        <p className="text-sm text-blue-800 mb-2">
                          {browserInfo.emoji} <strong>{browserInfo.browser}{isMobile ? ' (모바일)' : ''}</strong>
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 ml-2">
                          {browserInfo.steps.map((step, index) => (
                            <li key={index} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900 mb-2">
                          💡 <strong>권한 허용이 어려우신가요?</strong>
                        </p>
                        <p className="text-sm text-blue-700">
                          아래의 "인기 여행지" 또는 "지역별 탐색"에서 직접 선택하실 수 있습니다!
                        </p>
                      </div>

                      <button
                        onClick={() => setShowLocationHelp(false)}
                        className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        확인했습니다
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Search Results */}
          {filteredRegions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="mb-4 text-gray-700">검색 결과</h3>
              <div className="space-y-3">
                {filteredRegions.map((region) => (
                  <motion.button
                    key={region}
                    onClick={() => handleSelectLocation(region)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-5 text-left border-2 border-indigo-100 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-800">{region}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Popular Destinations */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-800 text-lg font-semibold">인기 여행지</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {popularDestinations.map((destination, index) => (
                <motion.button
                  key={destination.name}
                  onClick={() => handleDestinationClick(destination.name)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all flex flex-col items-center justify-center min-h-[150px] shadow-lg"
                >
                  <div className="text-5xl mb-4">{destination.emoji}</div>
                  <div className="mb-1.5 text-gray-900 font-semibold">{destination.name}</div>
                  <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{destination.region}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Region Categories */}
          <div className="mb-10">
            <h3 className="mb-5 text-gray-700">지역별 탐색</h3>
            <div className="grid grid-cols-3 gap-3">
              {regions.map((region, index) => (
                <motion.button
                  key={region}
                  onClick={() => {
                    setSelectedCity(region);
                    handleSelectLocation(region);
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="py-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center text-gray-700"
                >
                  {region}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Popular & Hidden Places Button */}
          {onPopularHidden && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onPopularHidden}
                className="w-full py-7 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 hover:from-indigo-500 hover:via-purple-500 hover:to-violet-600 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg">인기 & 숨은 명소 찾기</span>
                </div>
              </Button>
            </motion.div>
          )}

          {/* Explore Attractions Button */}
          {onExploreAttractions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onExploreAttractions}
                className="w-full py-7 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg">전국 관광지 둘러보기</span>
                </div>
              </Button>
            </motion.div>
          )}

          <div className="mb-6 space-y-4">
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-sm text-indigo-900 leading-relaxed">
                💡 지역을 선택하면 여행 성향 분석 설문이 시작됩니다.
                전국 관광지 버튼을 누르면 공공데이터 기반 실시간 관광 정보를 확인할 수 있습니다.
              </p>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-sm text-amber-900 leading-relaxed">
                📍 <strong>현재 위치 기능</strong>을 사용하면 주변 여행지를 자동으로 찾아드립니다.
                위치 권한이 필요하며, 거부하신 경우 위의 지역 선택 옵션을 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
