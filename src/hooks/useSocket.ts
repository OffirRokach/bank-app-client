import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

interface MoneyTransferData {
  from?: string;
  to?: string;
  amount: number;
  videoCallUrl: string;
  timestamp?: Date;
}

interface ServerToClientEvents {
  "money-transfer": (data: MoneyTransferData) => void;
  "money-sent": (data: MoneyTransferData) => void;
}

// For debugging - log only specific events
const DEBUG_SOCKET = true;

type SocketType = Socket<ServerToClientEvents>;

let globalSocket: SocketType | null = null;
let listeners: Array<(connected: boolean) => void> = [];

const notifyListeners = (connected: boolean) => {
  listeners.forEach((listener) => listener(connected));
};

export const connectSocket = (): SocketType | null => {
  if (globalSocket) {
    if (globalSocket.connected) {
      return globalSocket;
    } else {
      try {
        globalSocket.disconnect();
        globalSocket.removeAllListeners();
      } catch (e) {
        // Silent error handling
      }
      globalSocket = null;
    }
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  try {
    const socket: SocketType = io(import.meta.env.VITE_NODEJS_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
    });

    globalSocket = socket;

    socket.on("connect", () => {
      notifyListeners(true);
    });

    socket.on("disconnect", () => {
      notifyListeners(false);
    });

    socket.on("connect_error", () => {});

    // @ts-ignore - Socket.IO internal events
    socket.on("reconnect", () => {});

    // @ts-ignore - Socket.IO internal events
    socket.on("reconnect_attempt", () => {});

    // @ts-ignore - Socket.IO internal events
    socket.on("reconnect_error", () => {});

    // @ts-ignore - Socket.IO internal events
    socket.on("reconnect_failed", () => {});

    return socket;
  } catch (error) {
    return null;
  }
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    notifyListeners(false);
  }
};

// Track if event handlers are registered to prevent duplicate registrations
let handlersRegistered = false;

export function useSocket() {
  const [connected, setConnected] = useState(globalSocket?.connected || false);
  const [moneyTransferEvent, setMoneyTransferEvent] =
    useState<MoneyTransferData | null>(null);
  const [moneySentEvent, setMoneySentEvent] =
    useState<MoneyTransferData | null>(null);

  // Use a ref to track if this instance has registered handlers
  const hasRegisteredHandlers = useRef(false);

  useEffect(() => {
    const listener = (isConnected: boolean) => setConnected(isConnected);
    listeners.push(listener);
    setConnected(globalSocket?.connected || false);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    if (!globalSocket) {
      return;
    }

    // Only register handlers once per socket instance
    if (handlersRegistered) {
      return;
    }

    // Helper function to show money transfer toast
    const showMoneyTransferToast = (data: MoneyTransferData) => {
      try {
        const message = `Received $${data.amount.toFixed(2)} from ${
          data.from || "unknown"
        }\nClick to join video call`;

        toast.success(message, {
          toastId: `money-transfer-${data.from}-${data.amount}`,
          position: "bottom-right",
          autoClose: 10000,
          onClick: () => {
            // Open video call URL in new tab
            window.open(data.videoCallUrl, "_blank");
          },
        });

        console.log("[useSocket] Toast for money transfer shown successfully");
      } catch (error) {
        console.error(
          "[useSocket] Error showing toast for money transfer:",
          error
        );
      }
    };

    // Helper function to show money sent toast
    const showMoneySentToast = (data: MoneyTransferData) => {
      try {
        const message = `Sent $${data.amount.toFixed(2)} to ${
          data.to || "unknown"
        }\nClick to join video call`;

        toast.success(message, {
          toastId: `money-sent-${data.to}-${data.amount}`,
          position: "bottom-right",
          autoClose: 10000,
          onClick: () => {
            // Open video call URL in new tab
            window.open(data.videoCallUrl, "_blank");
          },
        });
      } catch (error) {
        console.error("[useSocket] Error showing toast for money sent:", error);
      }
    };

    const handleMoneyTransfer = (data: MoneyTransferData) => {
      console.log(
        "[useSocket] Money transfer event received, updating state:",
        data
      );
      setMoneyTransferEvent(data);
      showMoneyTransferToast(data);
    };

    const handleMoneySent = (data: MoneyTransferData) => {
      console.log(
        "[useSocket] Money sent event received, updating state:",
        data
      );
      setMoneySentEvent(data);
      showMoneySentToast(data);
    };

    // Add a debug handler for all events
    const debugHandler = (eventName: string, ...args: any[]) => {
      console.log(`[useSocket] Socket event received: ${eventName}`, args);
    };

    globalSocket.on("money-transfer", handleMoneyTransfer);
    globalSocket.on("money-sent", handleMoneySent);

    // Mark handlers as registered
    handlersRegistered = true;
    hasRegisteredHandlers.current = true;

    // Listen for all events to debug
    if (typeof globalSocket.onAny === "function") {
      globalSocket.onAny(debugHandler);
    }

    return () => {
      // Only clean up if this instance registered the handlers
      if (hasRegisteredHandlers.current) {
        globalSocket?.off("money-transfer", handleMoneyTransfer);
        globalSocket?.off("money-sent", handleMoneySent);

        if (typeof globalSocket?.offAny === "function") {
          globalSocket.offAny(debugHandler);
        }

        // Reset the registration flag when component unmounts
        handlersRegistered = false;
      }
    };
  }, []);

  return {
    socket: globalSocket,
    connected,
    connect: connectSocket,
    disconnect: disconnectSocket,
    moneyTransferEvent,
    moneySentEvent,
    clearMoneyTransferEvent: () => setMoneyTransferEvent(null),
    clearMoneySentEvent: () => setMoneySentEvent(null),
    // Expose state setters for testing
    setMoneyTransferEvent,
    setMoneySentEvent,
  };
}
