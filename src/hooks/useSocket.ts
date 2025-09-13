import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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
const DEBUG_SOCKET = false;

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
    if (DEBUG_SOCKET) console.log("[disconnectSocket] Disconnecting socket");
    globalSocket.disconnect();
    globalSocket = null;
    notifyListeners(false);
  }
};

export function useSocket() {
  const [connected, setConnected] = useState(globalSocket?.connected || false);
  const [moneyTransferEvent, setMoneyTransferEvent] =
    useState<MoneyTransferData | null>(null);
  const [moneySentEvent, setMoneySentEvent] =
    useState<MoneyTransferData | null>(null);

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

    const handleMoneyTransfer = (data: MoneyTransferData) => {
      setMoneyTransferEvent(data);
    };

    const handleMoneySent = (data: MoneyTransferData) => {
      console.log("Received money-sent event:", data);
      setMoneySentEvent(data);
    };

    // Add a debug handler for all events
    const debugHandler = (eventName: string, ...args: any[]) => {
      if (DEBUG_SOCKET)
        console.log(`[useSocket] Socket event received: ${eventName}`, args);
    };

    if (DEBUG_SOCKET) console.log("[useSocket] Registering event handlers");
    globalSocket.on("money-transfer", handleMoneyTransfer);
    globalSocket.on("money-sent", handleMoneySent);

    // @ts-ignore - Using internal socket.io method for debugging
    if (typeof globalSocket.onAny === "function") {
      globalSocket.onAny(debugHandler);
    }

    return () => {
      if (DEBUG_SOCKET) console.log("[useSocket] Cleaning up event handlers");
      globalSocket?.off("money-transfer", handleMoneyTransfer);
      globalSocket?.off("money-sent", handleMoneySent);

      // @ts-ignore - Using internal socket.io method for debugging
      if (typeof globalSocket?.offAny === "function") {
        globalSocket.offAny(debugHandler);
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
  };
}
