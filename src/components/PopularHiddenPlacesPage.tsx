import { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageCircle, MapPin, TrendingUp, Gem, Search, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  x: number;
  y: number;
  placeUrl: string;
  imageUrl?: string;
  reviewCount: number;
  rating: number;
  keywords: string[];
}

interface PopularHiddenPlacesPageProps {
  location?: string;
  onBack: () => void;
}

export function PopularHiddenPlacesPage({ location = "서울", onBack }: PopularHiddenPlacesPageProps) {
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLocation, setSearchLocation] = useState(location);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("popular");

  const categories = [
    { id: "", label: "전체", icon: "🌟" },
    { id: "카페", label: "카페", icon: "☕" },
    { id: "레스토랑", label: "레스토랑", icon: "🍽️" },
    { id: "관광명소", label: "관광명소", icon: "🏛️" },
    { id: "공원", label: "공원", icon: "🌳" },
    { id: "박물관", label: "박물관", icon: "🏛️" },
    { id: "미술관", label: "미술관", icon: "🎨" }
  ];

  useEffect(() => {
    analyzePlaces();
  }, [searchLocation, selectedCategory]);

  const analyzePlaces = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`[PopularHiddenPlaces] Analyzing: ${searchLocation}, category: ${selectedCategory}`);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/analyze-places`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          location: searchLocation,
          category: selectedCategory
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`[PopularHiddenPlaces] Popular: ${data.popularPlaces.length}, Hidden: ${data.hiddenGems.length}`);
      
      setPopularPlaces(data.popularPlaces);
      setHiddenGems(data.hiddenGems);
      
    } catch (err) {
      console.error("[PopularHiddenPlaces] Error:", err);
      setError("장소 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    analyzePlaces();
  };

  const getCategoryFallbackImage = (category: string, placeId: string) => {
    // Fallback 이미지 - 실제 이미지를 못 가져왔을 때만 사용
    const hashCode = placeId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const imageIndex = Math.abs(hashCode) % 5;

    const imagesByCategory: { [key: string]: string[] } = {
      "카페": [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=600&fit=crop"
      ],
      "레스토랑": [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop"
      ],
      "관광명소": [
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1610349633888-c6058d7393e9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&h=600&fit=crop"
      ],
      "공원": [
        "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop"
      ],
      "박물관": [
        "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1565532188831-10b210d85d80?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop"
      ],
      "미술관": [
        "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1577083552792-a0d461cb1dd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop"
      ]
    };

    const categoryImages = imagesByCategory[category] || [
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
    ];

    return categoryImages[imageIndex];
  };

  const getPlaceImage = (place: Place) => {
    // 실제 이미지가 있으면 우선 사용, 없으면 fallback
    return place.imageUrl || getCategoryFallbackImage(place.category, place.id);
  };

  const PlaceCard = ({ place, isHidden }: { place: Place; isHidden: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
        <div className="relative h-48">
          <ImageWithFallback
            src={getPlaceImage(place)}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-white/95 text-gray-900 border-0">
              {place.category}
            </Badge>
            {isHidden && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Gem className="w-3 h-3 mr-1" />
                숨은 명소
              </Badge>
            )}
            {!isHidden && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                인기
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg mb-2 drop-shadow-lg">
              {place.name}
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm font-medium">{place.rating}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{place.reviewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{place.address}</span>
          </div>

          {place.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {place.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {place.phone && (
            <p className="text-gray-500 text-sm mb-3">📞 {place.phone}</p>
          )}

          <a
            href={place.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            카카오맵에서 보기
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white hover:bg-white/20 mb-4 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로
        </Button>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-white font-semibold">인기 & 숨은 명소</h1>
            <p className="text-blue-100 text-sm">AI 기반 장소 분석</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Search Bar */}
        <Card className="p-4 mb-6 border-0 shadow-lg">
          <div className="flex gap-2 mb-4">
            <Input
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="지역명 입력 (예: 서울, 부산)"
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">장소를 분석하는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
            <Button onClick={analyzePlaces} className="mt-4" variant="outline">
              다시 시도
            </Button>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                인기 장소 ({popularPlaces.length})
              </TabsTrigger>
              <TabsTrigger value="hidden" className="flex items-center gap-2">
                <Gem className="w-4 h-4" />
                숨은 명소 ({hiddenGems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-4">
              {popularPlaces.length === 0 ? (
                <Card className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">인기 장소를 찾지 못했습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">다른 지역이나 카테고리를 시도해보세요.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {popularPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} isHidden={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hidden" className="space-y-4">
              {hiddenGems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Gem className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">숨은 명소를 찾지 못했습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">다른 지역이나 카테고리를 시도해보세요.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {hiddenGems.map((place) => (
                    <PlaceCard key={place.id} place={place} isHidden={true} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Info Card */}
        {!loading && !error && (
          <Card className="p-4 mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900 mb-1">AI 분석 기준</p>
                <p className="text-gray-600 mb-2">
                  <strong>인기 장소:</strong> 리뷰 수 상위 30% + 평점 4.0 이상
                </p>
                <p className="text-gray-600">
                  <strong>숨은 명소:</strong> 리뷰 수 하위 30% + 평점 4.5 이상 + 특별 키워드
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
