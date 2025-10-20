import { useState, useEffect } from "react";
import { Search, Sparkles, User as UserIcon, MapPin, Star, TrendingUp, Compass, Heart } from "lucide-react";
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
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { getSupabaseClient } from "./utils/supabase/client";
import { registerServiceWorker } from "./utils/pwa";
import { motion } from "motion/react";

type Page = "home" | "search" | "survey" | "recommendation" | "routes" | "smartroute" | "routemap" | "map" | "community" | "menu" | "auth" | "profile" | "itineraries" | "bookmarks" | "attractions" | "attraction-detail";

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
            onExploreAttractions={() => setCurrentPage("attractions")}
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
            onShowSmartRoute={(weather) => {
              setCurrentWeather(weather);
              setCurrentPage("smartroute");
            }}
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

  if (currentPage === "smartroute") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl">
          <SmartRoutePage
            travelStyle={travelStyle}
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
      <div className="min-h-screen bg-gray-100 flex justify-center">
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

  if (currentPage === "attractions") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
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
      <div className="min-h-screen bg-gray-100 flex justify-center">
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

  if (currentPage === "community") {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-xl">
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

          <div className="pt-8 px-6">
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
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 shadow-xl relative">
        {/* Status Bar - iPhone Style */}
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

        {/* Hero Section */}
        <div className="px-8 pt-4">
          <div className="relative h-48 overflow-hidden rounded-3xl">
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
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 via-transparent to-black/50"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-4 left-4 right-4"
            >
              <Badge className="mb-3 bg-blue-500/90 text-white border-0 px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI 기반 추천 시스템
              </Badge>
              <h1 className="text-white mb-2 drop-shadow-2xl leading-tight text-3xl">
                Escape the<br />Ordinary!!!
              </h1>
              <p className="text-white/95 drop-shadow text-sm">
                Plan Less, Travel More.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <button 
                onClick={() => setCurrentPage("search")}
                className="w-full bg-white rounded-full px-5 py-3 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-left text-gray-400 text-sm">어느 곳이든지 검색해 보세요.</span>
                <Compass className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* AI Algorithm Section */}
        <div className="px-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg mb-1">AI 맞춤 추천</h2>
              <p className="text-sm text-gray-500">당신만을 위한 여행 코스</p>
            </div>
            <Sparkles className="w-6 h-6 text-blue-500 flex-shrink-0" />
          </div>
          <motion.div 
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => setCurrentPage("survey")}
            className="relative h-48 rounded-3xl overflow-hidden shadow-lg cursor-pointer"
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
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-800/40 to-transparent"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-500/90 text-white border-0 px-3 py-1.5 text-xs">
                GPT 기반
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI 성향 분석</span>
              </div>
              <p className="text-base mb-4">
                최적의 여행 코스를 제공합니다
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-white/95 h-11 rounded-xl text-sm">
                성향 분석 시작하기
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Popular Destinations */}
        <div className="px-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg mb-1">인기 여행지</h2>
              <p className="text-sm text-gray-500">많은 사람들이 찾는 장소</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-500 flex-shrink-0" />
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
                className="relative h-44 rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    crossOrigin="anonymous"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                    <span className="text-white text-lg">{dest.title}</span>
                  </div>
                  <p className="text-white/90 text-sm mb-3">{dest.subtitle}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm">{dest.rating}</span>
                    </div>
                    <span className="text-white/80 text-sm">
                      {dest.reviews.toLocaleString()}개 리뷰
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Public Data Tourism Info */}
        <div className="px-8 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg mb-1">전국 관광지 탐색</h2>
              <p className="text-sm text-gray-500">공공데이터 실시간 정보</p>
            </div>
            <MapPin className="w-6 h-6 text-green-500 flex-shrink-0" />
          </div>
          <motion.div
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => setCurrentPage("attractions")}
            className="relative h-40 rounded-3xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-green-500 to-blue-500"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/90 text-white border-0 px-3 py-1.5 text-xs">
                한국관광공사
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">지역별 관광정보</span>
              </div>
              <p className="text-base mb-4">
                전국 관광지, 축제, 행사 정보를 확인하세요
              </p>
              <Button className="w-full bg-white text-green-600 hover:bg-white/95 h-11 rounded-xl text-sm">
                관광지 둘러보기
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Travel Categories */}
        <div className="px-8 mt-6">
          <h2 className="text-lg mb-4">여행 테마</h2>
          <div className="grid grid-cols-3 gap-3">
            {travelCategories.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage("search")}
                className={`${category.color} p-4 rounded-2xl hover:shadow-lg transition-all shadow-sm`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-xs text-gray-700">{category.title}</div>
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
              className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
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
              className="p-5 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
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

        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </div>
  );
}
