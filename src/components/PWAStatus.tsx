import { useEffect, useState } from "react";
import { Smartphone, Check } from "lucide-react";
import { motion } from "motion/react";
import { isPWAInstalled } from "../utils/pwa";

export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const installed = isPWAInstalled();
    setIsInstalled(installed);
    
    if (installed) {
      // Show status briefly when app opens
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-[412px]">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              ✨ 앱 모드로 실행 중
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
