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
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
        <ImageWithFallback
          src={image}
          alt="여행지"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <div className="flex items-center gap-1 text-gray-600">
          <Heart className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{likes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs">{comments}</span>
        </div>
      </div>
    </div>
  );
}
