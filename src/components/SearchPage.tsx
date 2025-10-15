import { useState } from "react";
import { Search, MapPin, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface SearchPageProps {
  onSearch: (location: string) => void;
  onBack: () => void;
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

export function SearchPage({ onSearch, onBack }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);

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
    onSearch(location);
  };

  return (
    <div className="bg-white min-h-screen pb-20 px-6">
      <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <h1 className="text-2xl mb-6">여행지 검색</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="지역명을 입력하세요 (예: 서울, 부산, 제주)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-6 rounded-xl"
          />
        </div>

        {/* Search Results */}
        {filteredRegions.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3">검색 결과</h3>
            <div className="space-y-2">
              {filteredRegions.map((region) => (
                <button
                  key={region}
                  onClick={() => handleSelectLocation(region)}
                  className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span>{region}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Destinations */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3>인기 여행지</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularDestinations.map((destination) => (
              <button
                key={destination.name}
                onClick={() => handleSelectLocation(destination.name)}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-3xl mb-2">{destination.emoji}</div>
                <div className="mb-1">{destination.name}</div>
                <div className="text-xs text-gray-500">{destination.region}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Categories */}
        <div>
          <h3 className="mb-4">지역별 탐색</h3>
          <div className="grid grid-cols-3 gap-2">
            {regions.slice(0, 17).map((region) => (
              <button
                key={region}
                onClick={() => handleSelectLocation(region)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-center"
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 지역을 선택하면 여행 성향 분석 설문이 시작됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
