import { Home, Users, Search, Menu } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-6 py-4">
        <button 
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center gap-1 relative"
        >
          <Home className={`w-6 h-6 ${currentPage === "home" ? "text-black" : "text-gray-400"}`} />
          {currentPage === "home" && (
            <div className="absolute -bottom-2 w-12 h-1 bg-black rounded-full"></div>
          )}
        </button>
        <button 
          onClick={() => onNavigate("community")}
          className="flex flex-col items-center gap-1 relative"
        >
          <Users className={`w-6 h-6 ${currentPage === "community" ? "text-black" : "text-gray-400"}`} />
          {currentPage === "community" && (
            <div className="absolute -bottom-2 w-12 h-1 bg-black rounded-full"></div>
          )}
        </button>
        <button 
          onClick={() => onNavigate("search")}
          className="flex flex-col items-center gap-1 relative"
        >
          <Search className={`w-6 h-6 ${currentPage === "search" ? "text-black" : "text-gray-400"}`} />
          {currentPage === "search" && (
            <div className="absolute -bottom-2 w-12 h-1 bg-black rounded-full"></div>
          )}
        </button>
        <button 
          onClick={() => onNavigate("menu")}
          className="flex flex-col items-center gap-1 relative"
        >
          <Menu className={`w-6 h-6 ${currentPage === "menu" ? "text-black" : "text-gray-400"}`} />
          {currentPage === "menu" && (
            <div className="absolute -bottom-2 w-12 h-1 bg-black rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}
