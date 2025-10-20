import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Loader2, Search, Calendar, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Attraction {
  contentid: string;
  title: string;
  addr1: string;
  tel?: string;
  firstimage?: string;
  mapx?: string;
  mapy?: string;
  contenttypeid?: string;
  eventstartdate?: string;
  eventenddate?: string;
}

interface AttractionsExploreProps {
  onBack: () => void;
  onSelectAttraction?: (attraction: Attraction) => void;
}

const areaData = [
  { code: "1", name: "서울", emoji: "🏙️" },
  { code: "6", name: "부산", emoji: "🌊" },
  { code: "39", name: "제주", emoji: "🌴" },
  { code: "32", name: "강원", emoji: "⛰️" },
  { code: "35", name: "전북", emoji: "🏯" },
  { code: "37", name: "경북", emoji: "🏛️" },
  { code: "36", name: "전남", emoji: "🌅" },
  { code: "4", name: "대구", emoji: "🌆" },
  { code: "31", name: "경기", emoji: "🏘️" },
  { code: "3", name: "대전", emoji: "🏫" },
  { code: "5", name: "광주", emoji: "🎨" },
  { code: "2", name: "인천", emoji: "✈️" }
];

export function AttractionsExplore({ onBack, onSelectAttraction }: AttractionsExploreProps) {
  const [selectedArea, setSelectedArea] = useState("1");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [festivals, setFestivals] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Attraction[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("area");

  useEffect(() => {
    if (activeTab === "area") {
      fetchAttractions(selectedArea);
    } else if (activeTab === "festival") {
      fetchFestivals();
    }
  }, [selectedArea, activeTab]);

  const fetchAttractions = async (areaCode: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/attractions/${areaCode}?numOfRows=20`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttractions(data.attractions || []);
      }
    } catch (error) {
      console.error("Error fetching attractions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFestivals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/festivals`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFestivals(data.festivals || []);
      }
    } catch (error) {
      console.error("Error fetching festivals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/attractions/search/${encodeURIComponent(searchKeyword)}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.attractions || []);
      }
    } catch (error) {
      console.error("Error searching attractions:", error);
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}.${month}.${day}`;
  };

  const AttractionCard = ({ attraction }: { attraction: Attraction }) => (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelectAttraction?.(attraction)}
      className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 transition-all cursor-pointer"
    >
      <div className="h-48 bg-gray-100 overflow-hidden relative">
        {attraction.firstimage ? (
          <img
            src={attraction.firstimage}
            alt={attraction.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=600";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <MapPin className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 min-h-[140px] flex flex-col">
        <h3 className="mb-2 text-gray-900 line-clamp-1">{attraction.title}</h3>
        <div className="flex-1 space-y-2">
          {attraction.addr1 && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{attraction.addr1}</span>
            </div>
          )}
          {attraction.tel && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{attraction.tel}</span>
            </div>
          )}
          {attraction.eventstartdate && attraction.eventenddate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm text-orange-600 line-clamp-1">
                {formatDate(attraction.eventstartdate)} ~ {formatDate(attraction.eventenddate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

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
            <h1 className="text-xl">전국 관광지</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="area">지역별</TabsTrigger>
              <TabsTrigger value="search">검색</TabsTrigger>
              <TabsTrigger value="festival">축제</TabsTrigger>
            </TabsList>

            {/* Area-based Search */}
            <TabsContent value="area" className="mt-6 space-y-6">
              {/* Area Selection */}
              <div>
                <h3 className="mb-4 text-gray-700">지역 선택</h3>
                <div className="grid grid-cols-3 gap-3">
                  {areaData.map((area) => (
                    <motion.button
                      key={area.code}
                      onClick={() => setSelectedArea(area.code)}
                      whileTap={{ scale: 0.95 }}
                      className={`py-5 px-3 border-2 rounded-xl transition-all ${
                        selectedArea === area.code
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{area.emoji}</div>
                      <div className="text-sm text-gray-700">{area.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Attractions List */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="text-gray-700">
                      {areaData.find((a) => a.code === selectedArea)?.name} 추천 관광지
                    </h3>
                    <Badge variant="secondary" className="ml-auto">
                      {attractions.length}개
                    </Badge>
                  </div>
                  {attractions.map((attraction) => (
                    <AttractionCard key={attraction.contentid} attraction={attraction} />
                  ))}
                  {attractions.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                      관광지 정보가 없습니다
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Keyword Search */}
            <TabsContent value="search" className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-gray-700">관광지 검색</h3>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="예: 경복궁, 해운대, 성산일출봉"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 py-6 rounded-xl border-2"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={searching || !searchKeyword.trim()}
                    className="px-6 py-6 rounded-xl"
                  >
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "검색"
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-700">검색 결과</h3>
                    <Badge variant="secondary">{searchResults.length}개</Badge>
                  </div>
                  {searchResults.map((attraction) => (
                    <AttractionCard key={attraction.contentid} attraction={attraction} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Festivals */}
            <TabsContent value="festival" className="mt-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <h3 className="text-gray-700">진행 중인 축제 & 행사</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {festivals.length}개
                    </Badge>
                  </div>
                  {festivals.map((festival) => (
                    <AttractionCard key={festival.contentid} attraction={festival} />
                  ))}
                  {festivals.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                      진행 중인 축제가 없습니다
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Info Box */}
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 한국관광공사에서 제공하는 전국 관광지 및 축제 정보입니다. 
              관광지를 클릭하면 상세 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
