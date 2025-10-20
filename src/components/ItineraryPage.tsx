import { useState, useEffect } from "react";
import { ArrowLeft, CalendarDays, MapPin, Trash2, Plus, Loader2, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { motion } from "motion/react";

interface ItineraryPageProps {
  userId: string;
  accessToken: string;
  onBack: () => void;
}

interface Itinerary {
  key: string;
  value: {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    notes: string;
    timestamp: string;
  };
}

export function ItineraryPage({ userId, accessToken, onBack }: ItineraryPageProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/itineraries/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setItineraries(data.itineraries || []);
      }
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/save-itinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            itinerary: {
              title,
              location,
              startDate,
              endDate,
              notes
            }
          })
        }
      );

      if (response.ok) {
        // Reset form
        setTitle("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setNotes("");
        setDialogOpen(false);
        
        // Refresh list
        fetchItineraries();
      }
    } catch (error) {
      console.error("Error saving itinerary:", error);
    }
  };

  const handleDeleteItinerary = async (key: string) => {
    if (!confirm("이 여행 일정을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/itinerary/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchItineraries();
      }
    } catch (error) {
      console.error("Error deleting itinerary:", error);
    }
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl">내 여행 일정</h1>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" />
                  새 일정
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[360px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>새 여행 일정 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveItinerary} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="mb-2 block">여행 제목</Label>
                    <Input
                      id="title"
                      placeholder="예: 제주도 힐링 여행"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="mb-2 block">여행지</Label>
                    <Input
                      id="location"
                      placeholder="예: 제주"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="startDate" className="mb-2 block">시작일</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="rounded-xl border-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="mb-2 block">종료일</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="rounded-xl border-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes" className="mb-2 block">메모</Label>
                    <Textarea
                      id="notes"
                      placeholder="여행 계획이나 메모를 작성하세요"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-xl border-2"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-xl">
                    저장하기
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : itineraries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-2">저장된 여행 일정이 없습니다</p>
              <p className="text-sm text-gray-400">새 일정을 추가해보세요!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {itineraries.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 shadow-sm border-2 border-gray-200 hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg text-gray-800 pr-4">{item.value.title}</h3>
                      <button
                        onClick={() => handleDeleteItinerary(item.key)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{item.value.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">
                          {new Date(item.value.startDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ~ {new Date(item.value.endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg">
                        {getDaysBetween(item.value.startDate, item.value.endDate)}일
                      </span>
                    </div>
                    
                    {item.value.notes && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">메모</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.value.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {itineraries.length > 0 && (
            <div className="mt-6 p-5 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed">
                💡 총 <strong>{itineraries.length}개</strong>의 여행 일정이 저장되어 있습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
