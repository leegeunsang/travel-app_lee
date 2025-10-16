import { useState, useEffect } from "react";
import { Search, Sparkles, User as UserIcon, MapPin, Star, TrendingUp, Compass } from "lucide-react";
import { TripCard } from "./components/TripCard";
import { BottomNav } from "./components/BottomNav";
import { SearchPage } from "./components/SearchPage";
import { SurveyPage } from "./components/SurveyPage";
import { RecommendationPage } from "./components/RecommendationPage";
import { RoutesPage } from "./components/RoutesPage";
import { MapPage } from "./components/MapPage";
import { AuthPage } from "./components/AuthPage";
import { ProfilePage } from "./components/ProfilePage";
import { ItineraryPage } from "./components/ItineraryPage";
import { BookmarkPage } from "./components/BookmarkPage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { getSupabaseClient } from "./utils/supabase/client";
import { registerServiceWorker } from "./utils/pwa";
import { motion } from "motion/react";

type Page = "home" | "search" | "survey" | "recommendation" | "routes" | "map" | "community" | "menu" | "auth" | "profile" | "itineraries" | "bookmarks";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const supabase = getSupabaseClient();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
    
    // Register Service Worker for PWA (gracefully fails in preview)
    registerServiceWorker().catch(err => {
      console.log('PWA setup skipped:', err.message);
    });
    
    // Add PWA meta tags
    try {
      // Manifest link
      if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        document.head.appendChild(link);
      }
      
      // Theme color meta tag - matching icon theme
      if (!document.querySelector('meta[name="theme-color"]')) {
        const themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        themeColor.content = '#7BA5D6';
        document.head.appendChild(themeColor);
      }
      
      // Apple touch icon
      if (!document.querySelector('link[rel="apple-touch-icon"]')) {
        const appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        appleIcon.href = '/icon-192.png';
        document.head.appendChild(appleIcon);
      }
    } catch (error) {
      console.log('PWA meta tags setup skipped in preview');
    }
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.user?.id) {
        setIsAuthenticated(true);
        setAccessToken(session.access_token);
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  const handleAuthSuccess = (token: string, uid: string) => {
    setIsAuthenticated(true);
    setAccessToken(token);
    setUserId(uid);
    
    // Get user email
    supabase.auth.getUser(token).then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
    
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken("");
    setUserId("");
    setUserEmail("");
    setCurrentPage("home");
  };

  const recommendedTrips = [
    {
      image: "https://images.unsplash.com/photo-1712651069440-3d75e39a2775?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjA0MzI1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 667,
      views: 0,
      comments: 134
    },
    {
      image: "https://images.unsplash.com/photo-1599033769063-fcd3ef816810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjBwYWxhY2UlMjB0ZW1wbGV8ZW58MXx8fHwxNzYwNDMyNTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 381,
      views: 0,
      comments: 210
    },
    {
      image: "https://images.unsplash.com/photo-1648085689183-4eeaacdaa710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMG5pZ2h0JTIwY2l0eXxlbnwxfHx8fDE3NjA0MzI1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 407,
      views: 0,
      comments: 1
    }
  ];

  const popularDestinations = [
    {
      title: "제주도",
      subtitle: "바다와 힐링의 섬",
      image: "https://images.unsplash.com/photo-1696335105620-c00aec47521f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwaXNsYW5kJTIwYmVhY2h8ZW58MXx8fHwxNzYwNDg4MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.8,
      reviews: 2847
    },
    {
      title: "부산",
      subtitle: "해운대 & 광안리",
      image: "https://images.unsplash.com/photo-1717179225021-3c3642d2a8e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMG9jZWFuJTIwY2l0eXxlbnwxfHx8fDE3NjA0ODgzNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.7,
      reviews: 1923
    },
    {
      title: "전주",
      subtitle: "한옥마을 & 먹거리",
      image: "https://images.unsplash.com/photo-1650476524542-c5cc53306700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0cmFkaXRpb25hbCUyMGhhbm9rfGVufDF8fHx8MTc2MDQ4ODM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.6,
      reviews: 1456
    }
  ];

  const travelCategories = [
    { icon: "🌸", title: "봄 여행", color: "bg-pink-50" },
    { icon: "🏖️", title: "해변", color: "bg-blue-50" },
    { icon: "⛰️", title: "산악", color: "bg-green-50" },
    { icon: "🍜", title: "맛집 탐방", color: "bg-orange-50" },
    { icon: "🏛️", title: "역사 문화", color: "bg-purple-50" },
    { icon: "🎨", title: "예술", color: "bg-yellow-50" }
  ];

  const handleSearch = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage("survey");
  };

  const handleSurveyComplete = (style: string, answers: number[]) => {
    setTravelStyle(style);
    setSurveyAnswers(answers);
    setCurrentPage("recommendation");
  };

  const handleNavigate = (page: string) => {
    // If navigating to menu and authenticated, go to profile instead
    if (page === "menu" && isAuthenticated) {
      setCurrentPage("profile");
    } else if (page === "menu" && !isAuthenticated) {
      setCurrentPage("auth");
    } else {
      setCurrentPage(page as Page);
    }
  };

  // Render current page
  if (currentPage === "auth") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onBack={() => setCurrentPage("home")}
          />
        </div>
      </div>
    );
  }

  if (currentPage === "profile") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <ProfilePage
            userId={userId}
            userEmail={userEmail}
            onBack={() => setCurrentPage("home")}
            onNavigateToItineraries={() => setCurrentPage("itineraries")}
            onNavigateToBookmarks={() => setCurrentPage("bookmarks")}
            onLogout={handleLogout}
          />
          <BottomNav currentPage="menu" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "itineraries") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <ItineraryPage
            userId={userId}
            accessToken={accessToken}
            onBack={() => setCurrentPage("profile")}
          />
          <BottomNav currentPage="menu" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "bookmarks") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <BookmarkPage
            userId={userId}
            accessToken={accessToken}
            onBack={() => setCurrentPage("profile")}
          />
          <BottomNav currentPage="menu" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "search") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SearchPage 
            onSearch={handleSearch}
            onBack={() => setCurrentPage("home")}
          />
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "survey") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SurveyPage
            onComplete={handleSurveyComplete}
            onBack={() => setCurrentPage("search")}
          />
        </div>
      </div>
    );
  }

  if (currentPage === "recommendation") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <RecommendationPage
            travelStyle={travelStyle}
            location={selectedLocation}
            accessToken={accessToken}
            onBack={() => setCurrentPage("survey")}
            onShowMap={() => setCurrentPage("map")}
            onShowRoutes={() => setCurrentPage("routes")}
            onSaveItinerary={isAuthenticated ? () => setCurrentPage("itineraries") : undefined}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "routes") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <RoutesPage
            travelStyle={travelStyle}
            location={selectedLocation}
            onBack={() => setCurrentPage("recommendation")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "map") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <MapPage
            location={selectedLocation}
            accessToken={accessToken}
            onBack={() => setCurrentPage("recommendation")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "community") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 px-6 shadow-xl">
          <div className="pt-8">
            <h1 className="text-2xl mb-6">커뮤니티</h1>
            <div className="text-center py-20 text-gray-400">
              <p>커뮤니티 기능은 곧 제공될 예정입니다.</p>
              <p className="text-sm mt-2">다른 여행자들의 후기와 일정을 공유하세요!</p>
            </div>
          </div>
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-xl">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm">9:41</span>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => setCurrentPage("profile")}
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage("auth")}
              className="text-xs text-blue-600"
            >
              로그인
            </button>
          )}
          <div className="w-4 h-3 border border-black rounded-sm"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1651836169465-74022b940638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMHNreWxpbmUlMjBzdW5zZXR8ZW58MXx8fHwxNzYwNDMyNTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="서울 스카이라인"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 via-transparent to-black/50 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-4 left-6 right-6"
        >
          <Badge className="mb-2 bg-white/20 text-white border-white/40 backdrop-blur-sm text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI 기반 추천 시스템
          </Badge>
          <h1 className="text-white text-2xl mb-2 drop-shadow-lg">
            Escape the<br />Ordinary!!!
          </h1>
          <p className="text-white/90 text-sm drop-shadow">
            Plan Less, Travel More.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <button 
            onClick={() => setCurrentPage("search")}
            className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl hover:shadow-xl transition-shadow"
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span className="flex-1 text-left text-gray-400 text-sm">어느 곳이든지 검색해 보세요.</span>
            <Compass className="w-4 h-4 text-gray-300" />
          </button>
        </motion.div>
      </div>

      {/* AI Algorithm Section */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-1">AI 맞춤 추천</h2>
            <p className="text-sm text-gray-500">당신만을 위한 여행 코스</p>
          </div>
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage("survey")}
          className="relative h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1694702817149-daf817247693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBjaXR5JTIwYnJpZGdlfGVufDF8fHx8MTc2MDQzMjU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="AI 추천"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-600/30 to-transparent pointer-events-none"></div>
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-white/20 text-white border-white/40 backdrop-blur-sm text-xs">
              GPT 기반
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs">AI 성향 분석</span>
            </div>
            <div className="text-base mb-3">
              최적의 여행 코스를 제공합니다
            </div>
            <Button className="w-full bg-white text-blue-600 hover:bg-white/90 h-9 text-sm">
              성향 분석 시작하기
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Popular Destinations */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="mb-1">인기 여행지</h2>
            <p className="text-sm text-gray-500">많은 사람들이 찾는 장소</p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {popularDestinations.map((dest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => {
                setSelectedLocation(dest.title);
                setCurrentPage("survey");
              }}
              className="relative h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
            >
              <ImageWithFallback
                src={dest.image}
                alt={dest.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-sm">{dest.title}</span>
                </div>
                <p className="text-white/80 text-xs mb-2">{dest.subtitle}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-xs">{dest.rating}</span>
                  </div>
                  <span className="text-white/60 text-xs">
                    {dest.reviews.toLocaleString()}개 리뷰
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Travel Categories */}
      <div className="px-6 mt-8">
        <h2 className="mb-4">여행 테마</h2>
        <div className="grid grid-cols-3 gap-3">
          {travelCategories.map((category, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setCurrentPage("search")}
              className={`${category.color} p-4 rounded-xl hover:shadow-md transition-shadow`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm text-gray-700">{category.title}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recommended Trip Section */}
      <div className="px-6 mt-8">
        <h2 className="mb-3 text-base">Recommended Trip</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {recommendedTrips.map((trip, index) => (
            <TripCard key={index} {...trip} />
          ))}
        </div>
      </div>

      {/* User Reviews Section */}
      <div className="px-6 mt-8 mb-6">
        <h2 className="mb-3 text-base">여행자 후기</h2>
        <div className="space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-3.5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <div className="text-xs">김민지</div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-700">
              AI 추천으로 제주도 여행 계획을 세웠는데, 정말 만족스러웠어요! 
              숨은 맛집까지 추천해주셔서 감사합니다 ✨
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-3.5 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 bg-green-200 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <div className="text-xs">박준호</div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-700">
              날씨 정보까지 실시간으로 확인할 수 있어서 
              여행 계획 세우기가 훨씬 편했습니다! 👍
            </p>
          </motion.div>
        </div>
      </div>



      {/* Bottom Navigation */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      </div>
    </div>
  );
}
