import { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, Trash2, Loader2, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { projectId } from "../utils/supabase/info";
import { motion } from "motion/react";

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
        setBookmarks(bookmarks.filter((b) => b.key !== key));
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
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
        <div className="sticky top-[57px] z-40 bg-white px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl">북마크</h1>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : bookmarks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">저장된 북마크가 없습니다</p>
              <p className="text-sm text-gray-400">관심있는 장소를 북마크하세요</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 shadow-sm border-2 border-gray-200 hover:border-purple-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-500">{bookmark.value.location}</span>
                        </div>
                        <h3 className="mb-2 text-gray-800">{bookmark.value.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                            {bookmark.value.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(bookmark.value.timestamp)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBookmark(bookmark.key)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="mt-6 p-5 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-sm text-purple-800 leading-relaxed">
                💡 총 <strong>{bookmarks.length}개</strong>의 장소를 북마크했습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
