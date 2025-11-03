import { ArrowLeft, User, Calendar, Bookmark, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { getSupabaseClient } from "../utils/supabase/client";
import { motion } from "motion/react";

interface ProfilePageProps {
  userId: string;
  userEmail: string;
  onBack: () => void;
  onNavigateToItineraries: () => void;
  onNavigateToBookmarks: () => void;
  onLogout: () => void;
}

export function ProfilePage({
  userId,
  userEmail,
  onBack,
  onNavigateToItineraries,
  onNavigateToBookmarks,
  onLogout
}: ProfilePageProps) {
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      icon: Calendar,
      title: "내 여행 일정",
      description: "저장된 여행 계획 보기",
      onClick: onNavigateToItineraries,
      color: "text-blue-600"
    },
    {
      icon: Bookmark,
      title: "북마크",
      description: "저장한 장소 보기",
      onClick: onNavigateToBookmarks,
      color: "text-purple-600"
    },
    {
      icon: Settings,
      title: "설정",
      description: "앱 설정 및 환경설정",
      onClick: () => {},
      color: "text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl">내 프로필</h1>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-6 shadow-sm border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl mb-2 text-gray-800">환영합니다!</h2>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Menu Items */}
          <div className="space-y-3 mb-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-5 hover:shadow-md cursor-pointer transition-all border-2 border-gray-200 hover:border-blue-300"
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="mb-3 text-gray-700">앱 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>버전</span>
                  <span className="text-gray-800">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>사용자 ID</span>
                  <span className="text-gray-800 text-xs">{userId.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Logout Button */}
          <Button 
            onClick={handleLogout} 
            variant="destructive"
            className="w-full py-7 rounded-2xl text-base"
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
