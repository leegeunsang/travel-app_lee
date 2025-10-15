import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { CalendarDays, MapPin, Trash2, Plus, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-white min-h-screen pb-20 px-6 shadow-xl">
        <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">내 여행 일정</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                새 일정
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 여행 일정 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveItinerary} className="space-y-4">
                <div>
                  <Label htmlFor="title">여행 제목</Label>
                  <Input
                    id="title"
                    placeholder="예: 제주도 힐링 여행"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="location">여행지</Label>
                  <Input
                    id="location"
                    placeholder="예: 제주"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">메모</Label>
                  <Textarea
                    id="notes"
                    placeholder="여행 계획이나 메모를 작성하세요"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">
                  저장하기
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">저장된 여행 일정이 없습니다</p>
            <p className="text-sm text-gray-400">새 일정을 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraries.map((item) => (
              <Card key={item.key} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3>{item.value.title}</h3>
                  <button
                    onClick={() => handleDeleteItinerary(item.key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{item.value.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {new Date(item.value.startDate).toLocaleDateString('ko-KR')} ~ {new Date(item.value.endDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                {item.value.notes && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {item.value.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
