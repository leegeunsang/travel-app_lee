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
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <ImageWithFallback
          src={image}
          alt="여행지"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          <span className="text-xs">{likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span className="text-xs">{views}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{comments}</span>
        </div>
      </div>
    </div>
  );
}
