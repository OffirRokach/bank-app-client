import { useSocket } from "../hooks/useSocket";

interface ConnectionStatusProps {
  className?: string;
}

// Helper to check if device is mobile - same as in useSocket.ts
const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

export const ConnectionStatus = ({ className = "" }: ConnectionStatusProps) => {
  const { connected } = useSocket();
  
  // Don't render anything on mobile devices - check immediately
  if (isMobileDevice()) {
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
