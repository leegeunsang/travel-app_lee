import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { User, Calendar, Bookmark, Settings, LogOut } from "lucide-react";
import { getSupabaseClient } from "../utils/supabase/client";

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

  return (
    <div className="bg-white min-h-screen pb-20 px-6">
      <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl mb-1">내 프로필</h1>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <Card 
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={onNavigateToItineraries}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <h3 className="text-sm mb-1">내 여행 일정</h3>
                <p className="text-xs text-gray-500">저장된 여행 계획 보기</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={onNavigateToBookmarks}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <h3 className="text-sm mb-1">북마크</h3>
                <p className="text-xs text-gray-500">저장한 장소 보기</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <h3 className="text-sm mb-1">설정</h3>
                <p className="text-xs text-gray-500">앱 설정 및 환경설정</p>
              </div>
            </div>
          </Card>
        </div>

        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>기능 안내:</strong> 여행 일정을 저장하고 관리하며, 
            마음에 드는 장소를 북마크하여 나만의 여행 리스트를 만들어보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
