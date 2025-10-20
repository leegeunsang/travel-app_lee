import { useState } from "react";
import { Search, MapPin, TrendingUp, ArrowLeft, Compass } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { WeatherWidget } from "./WeatherWidget";

interface SearchPageProps {
  onSearch: (location: string) => void;
  onBack: () => void;
  onExploreAttractions?: () => void;
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

export function SearchPage({ onSearch, onBack, onExploreAttractions }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("서울");

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

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl pb-20">
        {/* Status Bar */}
        <div className="sticky top-0 z-50 bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
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
            <h1 className="text-xl">여행지 검색</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Weather Widget */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-gray-700">현재 날씨</h3>
              <span className="text-sm text-gray-500">({selectedCity})</span>
            </div>
            <WeatherWidget city={selectedCity} />
          </div>

          {/* Search Input */}
          <div className="relative mb-10">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="지역명을 입력하세요 (예: 서울, 부산, 제주)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 pr-4 py-7 rounded-2xl border-2 border-gray-200 focus:border-blue-500 text-base"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

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
                    className="w-full p-5 text-left border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">{region}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Popular Destinations */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-gray-700">인기 여행지</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {popularDestinations.map((destination, index) => (
                <motion.button
                  key={destination.name}
                  onClick={() => handleDestinationClick(destination.name)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center min-h-[140px]"
                >
                  <div className="text-5xl mb-3">{destination.emoji}</div>
                  <div className="mb-1 text-gray-800">{destination.name}</div>
                  <div className="text-xs text-gray-500">{destination.region}</div>
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

          {/* Explore Attractions Button */}
          {onExploreAttractions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Button
                onClick={onExploreAttractions}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                <Compass className="w-5 h-5 mr-2" />
                전국 관광지 둘러보기
              </Button>
            </motion.div>
          )}

          <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 지역을 선택하면 여행 성향 분석 설문이 시작됩니다.
              전국 관광지 버튼을 누르면 공공데이터 기반 실시간 관광 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
