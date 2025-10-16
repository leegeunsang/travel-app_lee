import { Heart, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TripCardProps {
  image: string;
  likes: number;
  views: number;
  comments: number;
}

export function TripCard({ image, likes, comments }: TripCardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm" style={{ aspectRatio: '1 / 1' }}>
        <ImageWithFallback
          src={image}
          alt="여행지"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <div className="flex items-center gap-1 text-gray-600">
          <Heart className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs font-semibold">{likes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="text-xs">{comments}</span>
        </div>
      </div>
    </div>
  );
}
