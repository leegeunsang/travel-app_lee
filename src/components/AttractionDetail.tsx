import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Globe, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AttractionDetailProps {
  contentId: string;
  onBack: () => void;
}

interface DetailInfo {
  title: string;
  addr1: string;
  tel?: string;
  homepage?: string;
  overview?: string;
  firstimage?: string;
  mapx?: string;
  mapy?: string;
  contentid: string;
  contenttypeid?: string;
  zipcode?: string;
}

interface ImageInfo {
  originimgurl: string;
  smallimageurl: string;
}

export function AttractionDetail({ contentId, onBack }: AttractionDetailProps) {
  const [detail, setDetail] = useState<DetailInfo | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchDetail();
    fetchImages();
  }, [contentId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/attraction/detail/${contentId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDetail(data.detail);
      }
    } catch (error) {
      console.error("Error fetching attraction detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/attraction/images/${contentId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const openInKakaoMap = () => {
    if (detail?.mapx && detail?.mapy) {
      window.open(
        `https://map.kakao.com/link/map/${encodeURIComponent(detail.title)},${detail.mapy},${detail.mapx}`,
        "_blank"
      );
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-[412px] bg-white min-h-screen shadow-xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">관광지 정보를 불러올 수 없습니다</p>
            <Button onClick={onBack}>돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = images.length > 0 ? images : detail.firstimage ? [{ originimgurl: detail.firstimage, smallimageurl: detail.firstimage }] : [];

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
        <div className="bg-white px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl line-clamp-1">{detail.title}</h1>
          </div>
        </div>

        <div className="pb-6">
          {/* Image Gallery */}
          {displayImages.length > 0 && (
            <div className="mb-6">
              <div className="relative h-80 bg-gray-100">
                <img
                  src={displayImages[selectedImageIndex].originimgurl}
                  alt={detail.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
                  }}
                />
                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {displayImages.length > 1 && (
                <div className="px-6 mt-4 flex gap-2 overflow-x-auto pb-2">
                  {displayImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === idx ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.smallimageurl}
                        alt={`${detail.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=200";
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-6 space-y-6">
            {/* Title and Badge */}
            <div>
              <h2 className="mb-2">{detail.title}</h2>
              <Badge variant="secondary">관광명소</Badge>
            </div>

            {/* Information */}
            <div className="space-y-4">
              {detail.addr1 && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">주소</p>
                    <p className="text-gray-800">{detail.addr1}</p>
                    {detail.zipcode && (
                      <p className="text-sm text-gray-500 mt-1">우편번호: {detail.zipcode}</p>
                    )}
                  </div>
                </div>
              )}

              {detail.tel && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">전화번호</p>
                    <a href={`tel:${detail.tel}`} className="text-blue-600 hover:underline">
                      {detail.tel}
                    </a>
                  </div>
                </div>
              )}

              {detail.homepage && (
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">홈페이지</p>
                    <div
                      className="text-blue-600 hover:underline cursor-pointer line-clamp-2"
                      onClick={() => {
                        const urlMatch = detail.homepage?.match(/href="([^"]*)"/);
                        if (urlMatch) {
                          window.open(urlMatch[1], "_blank");
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: detail.homepage }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Overview */}
            {detail.overview && (
              <div className="space-y-2">
                <h3 className="text-gray-700">소개</h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {stripHtml(detail.overview)}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {detail.mapx && detail.mapy && (
                <Button
                  onClick={openInKakaoMap}
                  className="flex-1 py-6 rounded-xl"
                  variant="outline"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  지도에서 보기
                </Button>
              )}
            </div>

            {/* Info Notice */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed">
                💡 한국관광공사에서 제공하는 정보입니다. 
                방문 전 운영시간 및 휴무일을 확인하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
