import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus = ({ className = "" }: ConnectionStatusProps) => {
  const { connected } = useSocket();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    // Re-check on resize in case of device orientation change
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render anything on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-xs font-bold text-white">
        {connected ? "Online" : "Offline"}
      </span>
    </div>
  );
};
