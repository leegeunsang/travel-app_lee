import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Bookmark, Trash2, Loader2, MapPin } from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface BookmarkPageProps {
  userId: string;
  accessToken: string;
  onBack: () => void;
}

interface BookmarkItem {
  key: string;
  value: {
    location: string;
    name: string;
    category: string;
    timestamp: string;
  };
}

export function BookmarkPage({ userId, accessToken, onBack }: BookmarkPageProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/bookmarks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (key: string) => {
    if (!confirm("이 북마크를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/bookmark/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchBookmarks();
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 px-6 shadow-xl">
        <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl">북마크</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">저장된 북마크가 없습니다</p>
            <p className="text-sm text-gray-400">관심있는 장소를 북마크해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((item) => (
              <Card key={item.key} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <h3>{item.value.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.value.location}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {item.value.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(item.key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
