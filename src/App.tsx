import { useState, useEffect } from "react";
import { Search, Sparkles, User as UserIcon, MapPin, Star, TrendingUp, Compass, Heart, Users } from "lucide-react";
import { TripCard } from "./components/TripCard";
import { BottomNav } from "./components/BottomNav";
import { SearchPage } from "./components/SearchPage";
import { SurveyPage } from "./components/SurveyPage";
import { RecommendationPage } from "./components/RecommendationPage";
import { RoutesPage } from "./components/RoutesPage";
import { SmartRoutePage } from "./components/SmartRoutePage";
import { MapPage } from "./components/MapPage";
import { RouteMapPage } from "./components/RouteMapPage";
import { AuthPage } from "./components/AuthPage";
import { ProfilePage } from "./components/ProfilePage";
import { ItineraryPage } from "./components/ItineraryPage";
import { BookmarkPage } from "./components/BookmarkPage";
import { AttractionsExplore } from "./components/AttractionsExplore";
import { AttractionDetail } from "./components/AttractionDetail";
import { PopularHiddenPlacesPage } from "./components/PopularHiddenPlacesPage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { IOSInstallPrompt } from "./components/IOSInstallPrompt";
import { PWAStatus } from "./components/PWAStatus";
import { EnvWarning } from "./components/EnvWarning";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { getSupabaseClient } from "./utils/supabase/client";
import { motion } from "motion/react";
import { WeatherTestPage } from "./components/WeatherTestPage";
import { KakaoDebugPage } from "./components/KakaoDebugPage";
import { KakaoRestApiTest } from "./components/KakaoRestApiTest";
import { loadKakaoMapScript } from "./utils/kakao-script-loader";

type Page = "home" | "search" | "survey" | "recommendation" | "routes" | "smartroute" | "routemap" | "map" | "community" | "menu" | "auth" | "profile" | "itineraries" | "bookmarks" | "attractions" | "attraction-detail" | "popular-hidden" | "weather-test" | "kakao-debug" | "kakao-rest-test";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [confirmedPlaces, setConfirmedPlaces] = useState<any[]>([]);
  const [confirmedRouteInfo, setConfirmedRouteInfo] = useState<any>(null);
  const [confirmedTransportMode, setConfirmedTransportMode] = useState("");
  const [selectedAttractionId, setSelectedAttractionId] = useState("");
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const supabase = getSupabaseClient();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
    
    // Check URL hash for direct navigation
    if (window.location.hash === '#kakao-debug') {
      setCurrentPage('kakao-debug');
    }
    
    // Load Kakao Maps SDK dynamically (silently fails if domain not registered)
    loadKakaoMapScript().catch(() => {
      // Silently fail - app will use REST API fallback automatically
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
        themeColor.content = '#6366F1';
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
      // Continue without authentication - app works without login
      console.log("Continuing without authentication");
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
      image: "https://images.unsplash.com/photo-1593575997212-cb98886e8653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHRyYXZlbHxlbnwxfHx8fDE3NjA5NjI4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 667,
      views: 0,
      comments: 134
    },
    {
      image: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYSUyMHBhbGFjZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjA5NzExOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 381,
      views: 0,
      comments: 210
    },
    {
      image: "https://images.unsplash.com/photo-1530469525856-cf37954301f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGV4cGxvcmV8ZW58MXx8fHwxNzYwOTcxMTk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      likes: 407,
      views: 0,
      comments: 1
    }
  ];

  // Image rotation state
  const [currentImageIndices, setCurrentImageIndices] = useState<{[key: number]: number}>({});

  // 여행지별 다양한 이미지 배열
  const destinationImages = {
    jeju: [
      "https://images.unsplash.com/photo-1661488883456-2093b6f5bf0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwYmVhY2glMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYwOTcxMTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1696335105620-c00aec47521f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwaXNsYW5kJTIwYmVhY2h8ZW58MXx8fHwxNzYwOTgyNjIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1664627298444-6947d2e907e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwbmF0dXJlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MDk4MjYyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1672565091943-2d4502c671f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwd2F0ZXJmYWxsJTIwc2NlbmVyeXxlbnwxfHx8fDE3NjA5ODI2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    busan: [
      "https://images.unsplash.com/photo-1679054142611-5f0580dab94f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMGNpdHklMjBiZWFjaHxlbnwxfHx8fDE3NjA5NzExOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1641730146205-f6e594f7a619?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMG5pZ2h0JTIwY2l0eXxlbnwxfHx8fDE3NjA5ODI2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1748877638517-7044700ae3a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMGJlYWNoJTIwc2t5bGluZXxlbnwxfHx8fDE3NjA5ODI2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1752688635956-c217ade51bf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMGhhcmJvciUyMHZpZXd8ZW58MXx8fHwxNzYwOTgyNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    jeonju: [
      "https://images.unsplash.com/photo-1655645894221-948b9d2c7ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0ZW1wbGUlMjB0cmFkaXRpb25hbHxlbnwxfHx8fDE3NjA5NzExOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1698881065188-1cef8476f33e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0cmFkaXRpb25hbCUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjA5ODI2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1701134715217-e4080930fe75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0ZW1wbGUlMjBnYXJkZW58ZW58MXx8fHwxNzYwOTgyNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1610349633888-c6058d7393e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYSUyMHBhbGFjZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjA5NzExOTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    ]
  };

  const popularDestinations = [
    {
      title: "제주도",
      subtitle: "바다와 힐링의 섬",
      images: destinationImages.jeju,
      rating: 4.8,
      reviews: 2847
    },
    {
      title: "부산",
      subtitle: "해운대 & 광안리",
      images: destinationImages.busan,
      rating: 4.7,
      reviews: 1923
    },
    {
      title: "전주",
      subtitle: "한옥마을 & 먹거리",
      images: destinationImages.jeonju,
      rating: 4.6,
      reviews: 1456
    }
  ];

  // 히어로 섹션 이미지 배열
  const heroImages = [
    "https://images.unsplash.com/photo-1637070875173-1ecab5fff748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMGNpdHklMjB0cmF2ZWx8ZW58MXx8fHwxNzYwOTcxMTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1678649361912-c73aa0be18a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMGNpdHlzY2FwZSUyMG5pZ2h0fGVufDF8fHx8MTc2MDk4MjYyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1651836170569-8458c314a841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMHRvd2VyJTIwY2l0eXxlbnwxfHx8fDE3NjA5ODI2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1623622863859-2931a6c3bc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHRyYWlsfGVufDF8fHx8MTc2MDk3ODY2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  // AI 추천 섹션 이미지 배열
  const aiRecommendationImages = [
    "https://images.unsplash.com/photo-1724795612879-a8942152b22d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjB0cmF2ZWwlMjBpbnNwaXJhdGlvbnxlbnwxfHx8fDE3NjA5NzExOTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjB0cmF2ZWwlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYwOTgyNjI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1661488883456-2093b6f5bf0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKZWp1JTIwYmVhY2glMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYwOTcxMTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1679054142611-5f0580dab94f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdXNhbiUyMGNpdHklMjBiZWFjaHxlbnwxfHx8fDE3NjA5NzExOTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  ];

  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [aiImageIndex, setAiImageIndex] = useState(0);

  // 이미지 자동 회전 Effect
  useEffect(() => {
    const destinationInterval = setInterval(() => {
      setCurrentImageIndices(prev => {
        const newIndices: {[key: number]: number} = {};
        popularDestinations.forEach((_, index) => {
          const currentIndex = prev[index] || 0;
          const destination = popularDestinations[index];
          newIndices[index] = (currentIndex + 1) % destination.images.length;
        });
        return newIndices;
      });
    }, 3500); // 3.5초마다 이미지 변경

    const heroInterval = setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % heroImages.length);
    }, 4000); // 4초마다 변경

    const aiInterval = setInterval(() => {
      setAiImageIndex(prev => (prev + 1) % aiRecommendationImages.length);
    }, 4500); // 4.5초마다 변경

    return () => {
      clearInterval(destinationInterval);
      clearInterval(heroInterval);
      clearInterval(aiInterval);
    };
  }, []);

  const travelCategories = [
    { icon: "🌸", title: "봄 여행", color: "bg-gradient-to-br from-pink-50 to-rose-100" },
    { icon: "🏖️", title: "해변", color: "bg-gradient-to-br from-cyan-50 to-blue-100" },
    { icon: "⛰️", title: "산악", color: "bg-gradient-to-br from-green-50 to-emerald-100" },
    { icon: "🍜", title: "맛집 탐방", color: "bg-gradient-to-br from-amber-50 to-orange-100" },
    { icon: "🏛️", title: "역사 문화", color: "bg-gradient-to-br from-indigo-50 to-purple-100" },
    { icon: "🎨", title: "예술", color: "bg-gradient-to-br from-violet-50 to-fuchsia-100" }
  ];

  const handleSearch = (location: string) => {
    setSelectedLocation(location);
    // If travel style is already determined, go to recommendation
    // Otherwise, need to do survey first
    if (travelStyle) {
      setCurrentPage("recommendation");
    } else {
      // If no travel style yet, go to survey first
      setCurrentPage("survey");
    }
  };

  const handleSurveyComplete = (style: string, answers: number[]) => {
    setTravelStyle(style);
    setSurveyAnswers(answers);
    // After survey, go to search page to select location
    setCurrentPage("search");
  };

  const handleNavigate = (page: string) => {
    console.log("Navigating to:", page);
    // If navigating to menu and authenticated, go to profile instead
    if (page === "menu" && isAuthenticated) {
      setCurrentPage("profile");
    } else if (page === "menu" && !isAuthenticated) {
      setCurrentPage("auth");
    } else {
      setCurrentPage(page as Page);
    }
  };

  // Debug: Log current page
  console.log("Current page:", currentPage);
  console.log("Is authenticated:", isAuthenticated);

  // Render current page
  if (currentPage === "auth") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SearchPage 
            onSearch={handleSearch}
            onBack={() => setCurrentPage("home")}
            onExploreAttractions={() => setCurrentPage("attractions")}
            onPopularHidden={() => setCurrentPage("popular-hidden")}
          />
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "survey") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SurveyPage
            onComplete={handleSurveyComplete}
            onBack={() => setCurrentPage("home")}
          />
        </div>
      </div>
    );
  }

  if (currentPage === "recommendation") {
    // Redirect to search if no location selected
    if (!selectedLocation || selectedLocation.trim() === "") {
      setTimeout(() => setCurrentPage("search"), 0);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <RecommendationPage
            travelStyle={travelStyle || "모험가"}
            location={selectedLocation}
            accessToken={accessToken}
            onBack={() => setCurrentPage("search")}
            onShowMap={() => setCurrentPage("map")}
            onShowRoutes={() => setCurrentPage("routes")}
            onShowSmartRoute={(weather) => {
              setCurrentWeather(weather);
              setCurrentPage("smartroute");
            }}
            onSaveItinerary={isAuthenticated ? () => setCurrentPage("itineraries") : undefined}
            onRetakeSurvey={() => setCurrentPage("survey")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "routes") {
    // Redirect to search if no location selected
    if (!selectedLocation || selectedLocation.trim() === "") {
      setTimeout(() => setCurrentPage("search"), 0);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <RoutesPage
            travelStyle={travelStyle || "모험가"}
            location={selectedLocation}
            onBack={() => setCurrentPage("recommendation")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "smartroute") {
    // Redirect to search if no location selected
    if (!selectedLocation || selectedLocation.trim() === "") {
      setTimeout(() => setCurrentPage("search"), 0);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SmartRoutePage
            travelStyle={travelStyle || "모험가"}
            location={selectedLocation}
            weather={currentWeather}
            onBack={() => setCurrentPage("recommendation")}
            onConfirmRoute={(places, routeInfo, transportMode) => {
              setConfirmedPlaces(places);
              setConfirmedRouteInfo(routeInfo);
              setConfirmedTransportMode(transportMode);
              setCurrentPage("routemap");
            }}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "routemap") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <RouteMapPage
            places={confirmedPlaces}
            routeInfo={confirmedRouteInfo}
            transportMode={confirmedTransportMode}
            onBack={() => setCurrentPage("smartroute")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "map") {
    // Redirect to search if no location selected
    if (!selectedLocation || selectedLocation.trim() === "") {
      setTimeout(() => setCurrentPage("search"), 0);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
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

  if (currentPage === "attractions") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <AttractionsExplore
            onBack={() => setCurrentPage("home")}
            onSelectAttraction={(attraction) => {
              setSelectedAttractionId(attraction.contentid);
              setCurrentPage("attraction-detail");
            }}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "attraction-detail") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <AttractionDetail
            contentId={selectedAttractionId}
            onBack={() => setCurrentPage("attractions")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "popular-hidden") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <PopularHiddenPlacesPage
            location={selectedLocation || "서울"}
            onBack={() => setCurrentPage("home")}
          />
          <BottomNav currentPage="search" onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  if (currentPage === "weather-test") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <WeatherTestPage />
        </div>
      </div>
    );
  }

  if (currentPage === "kakao-debug") {
    return <KakaoDebugPage />;
  }

  if (currentPage === "kakao-rest-test") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <KakaoRestApiTest onBack={() => setCurrentPage("home")} />
        </div>
      </div>
    );
  }

  if (currentPage === "community") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
        <div className="w-full max-w-[412px] bg-white/80 backdrop-blur-xl min-h-screen shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8 mb-6">
            <h1 className="text-2xl text-white font-semibold">커뮤니티</h1>
            <p className="text-gray-300 text-sm mt-2">여행 후기와 일정을 공유하세요</p>
          </div>
          <div className="px-6 flex-1 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl flex items-center justify-center">
                <Users className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">곧 만나요!</h3>
              <p className="text-gray-600 mb-2">커뮤니티 기능은 곧 제공될 예정입니다.</p>
              <p className="text-sm text-gray-500">다른 여행자들과 소통하고 정보를 나눠보세요</p>
            </motion.div>
          </div>
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-amber-50/30 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-2xl relative">
        {/* Hero Section */}
        <div className="px-6 pt-6">
          <div className="relative h-64 overflow-hidden rounded-3xl shadow-2xl">
            <motion.div
              key={heroImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={heroImages[heroImageIndex]}
                alt="여행"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-6 left-6 right-6"
            >
              <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-0 px-4 py-2 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                AI 기반 추천 시스템
              </Badge>
              <h1 className="text-white mb-3 drop-shadow-2xl leading-tight text-4xl tracking-tight">
                Escape the<br />Ordinary!!!
              </h1>
              <p className="text-white/95 drop-shadow-lg text-base">
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
                className="w-full bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="flex-1 text-left text-indigo-900 font-medium">어디로 떠나시나요?</span>
                <Compass className="w-5 h-5 text-amber-500" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* AI Algorithm Section */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl mb-1.5">AI 맞춤 추천</h2>
              <p className="text-sm text-gray-500">당신만을 위한 여행 코스</p>
            </div>
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage("survey")}
            className="relative h-56 rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
          >
            <motion.div
              key={aiImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={aiRecommendationImages[aiImageIndex]}
                alt="AI 추천"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/95 via-indigo-700/50 to-transparent"></div>
            <div className="absolute top-5 right-5">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-2 shadow-xl">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                GPT 기반
              </Badge>
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-medium">AI 성향 분석</span>
              </div>
              <p className="text-base mb-5 leading-relaxed">
                최적의 여행 코스를 제공합니다
              </p>
              <Button className="w-full bg-white text-indigo-600 hover:bg-white/95 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                성향 분석 시작하기 →
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Popular Destinations */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl mb-1.5">인기 여행지</h2>
              <p className="text-sm text-gray-500">많은 사람들이 찾는 장소</p>
            </div>
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-5">
            {popularDestinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => {
                  setSelectedLocation(dest.title);
                  setCurrentPage("survey");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-52 rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
              >
                <motion.div
                  key={currentImageIndices[index] || 0}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <ImageWithFallback
                    src={dest.images[(currentImageIndices[index] || 0)]}
                    alt={dest.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-xl font-semibold">{dest.title}</span>
                  </div>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">{dest.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">{dest.rating}</span>
                    </div>
                    <span className="text-white/90 text-sm">
                      {dest.reviews.toLocaleString()}개 리뷰
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Public Data Tourism Info */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl mb-1.5">전국 관광지 탐색</h2>
              <p className="text-sm text-gray-500">공공데이터 실시간 정보</p>
            </div>
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage("attractions")}
            className="relative h-48 rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute top-5 right-5">
              <Badge className="bg-white/90 text-green-700 border-0 px-4 py-2 shadow-lg font-medium">
                한국관광공사
              </Badge>
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium">지역별 관광정보</span>
              </div>
              <p className="text-base mb-5 leading-relaxed">
                전국 관광지, 축제, 행사 정보를 확인하세요
              </p>
              <Button className="w-full bg-white text-green-600 hover:bg-white/95 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                관광지 둘러보기 →
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Popular & Hidden Places Section */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl mb-1.5">인기 & 숨은 명소</h2>
              <p className="text-sm text-gray-500">AI 기반 장소 분석</p>
            </div>
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage("popular-hidden")}
            className="relative h-48 rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute top-5 right-5">
              <Badge className="bg-white/90 text-indigo-700 border-0 px-4 py-2 shadow-lg font-medium">
                리뷰 기반 분석
              </Badge>
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-medium">스마트 장소 추천</span>
              </div>
              <p className="text-base mb-5 leading-relaxed">
                인기 명소와 숨겨진 보석 같은 장소를 찾아보세요
              </p>
              <Button className="w-full bg-white text-indigo-700 hover:bg-white/95 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                장소 탐색하기 →
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Travel Categories */}
        <div className="px-6 mt-8 pb-24">
          <h2 className="text-xl mb-5">여행 테마</h2>
          <div className="grid grid-cols-3 gap-4">
            {travelCategories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage("search")}
                className={`${category.color} p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50`}
              >
                <div className="text-3xl mb-2.5">{category.icon}</div>
                <div className="text-xs text-gray-800 font-medium">{category.title}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recommended Trip Section */}
        <div className="px-8 mt-6">
          <h2 className="text-lg mb-4">Recommended Trip</h2>
          <div className="grid grid-cols-3 gap-3">
            {recommendedTrips.map((trip, index) => (
              <TripCard key={index} {...trip} />
            ))}
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="px-8 mt-6 mb-10">
          <h2 className="text-lg mb-4">여행자 후기</h2>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-indigo-200 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                  👤
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">김민지</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                AI 추천으로 제주도 여행 계획을 세웠는데, 정말 만족스러웠어요! 
                숨은 맛집까지 추천해주셔서 감사합니다 ✨
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                  👤
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">박준호</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                날씨 정보까지 실시간으로 확인할 수 있어서 
                여행 계획 세우기가 훨씬 편했습니다! 👍
              </p>
            </motion.div>
          </div>
        </div>

        {/* Developer Tools - Hidden Buttons */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={() => setCurrentPage("kakao-debug")}
            className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center text-xs opacity-30 hover:opacity-100 transition"
            title="카카오맵 진단 도구"
          >
            🔧
          </button>
          <button
            onClick={() => setCurrentPage("kakao-rest-test")}
            className="w-10 h-10 bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center text-xs opacity-30 hover:opacity-100 transition"
            title="REST API 테스트"
          >
            🧪
          </button>
        </div>

        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        <PWAInstallPrompt />
        <IOSInstallPrompt />
        <PWAStatus />
        <EnvWarning />
        <Toaster />
      </div>
    </div>
  );
}
