import { Heart, Eye, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TripCardProps {
  image: string;
  likes: number;
  views: number;
  comments: number;
}

export function TripCard({ image, likes, views, comments }: TripCardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
        <ImageWithFallback
          src={image}
          alt="여행지"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <div className="flex items-center gap-1 text-gray-600">
          <Heart className="w-3 h-3" />
          <span className="text-xs font-medium">{likes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-2.5 h-2.5" />
          <span className="text-xs">{comments}</span>
        </div>
      </div>
    </div>
  );
}
