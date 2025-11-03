import { Home, Users, Search, Menu } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "홈" },
    { id: "community", icon: Users, label: "커뮤니티" },
    { id: "search", icon: Search, label: "검색" },
    { id: "menu", icon: Menu, label: "메뉴" },
  ];

  return (
    <div className="sticky bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-50">
      <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 relative min-w-[64px]"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${
                    isActive 
                      ? "text-indigo-600" 
                      : "text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <motion.span
                className={`text-xs transition-all ${
                  isActive 
                    ? "text-indigo-600 font-medium" 
                    : "text-gray-500"
                }`}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95,
                }}
              >
                {item.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
