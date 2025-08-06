import { useSocket } from "../hooks/useSocket";

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus = ({ className = "" }: ConnectionStatusProps) => {
  const { connected } = useSocket();

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
