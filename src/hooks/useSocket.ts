// useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

// Helper to check if device is mobile - exported for use in other components
export const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
};

interface ServerToClientEvents {
  "money-transfer": (data: { from: string; amount: number }) => void;
  "money-sent": (data: { to: string; amount: number }) => void;
}

type SocketType = Socket<ServerToClientEvents>;

let globalSocket: SocketType | null = null;
let listeners: Array<(connected: boolean) => void> = [];

const notifyListeners = (connected: boolean) => {
  listeners.forEach((listener) => listener(connected));
};

export const connectSocket = (): SocketType | null => {
  // Don't establish socket connections on mobile devices
  if (isMobileDevice()) {
    console.log("Mobile device detected, skipping socket connection");
    return null;
  }

  if (globalSocket) {
    if (globalSocket.connected) {
      console.log("Socket already connected, reusing existing connection");
      return globalSocket;
    } else {
      // Socket exists but is disconnected, clean it up
      console.log("Cleaning up disconnected socket before creating new one");
      globalSocket.disconnect();
      globalSocket.removeAllListeners();
      globalSocket = null;
    }
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No auth token found, cannot connect to socket server");
    return null;
  }

  const socket: SocketType = io(import.meta.env.VITE_NODEJS_URL, {
    auth: {
      token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  globalSocket = socket;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    notifyListeners(true);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    notifyListeners(false);
  });

  // Handle money transfer events (receiving money)
  socket.on("money-transfer", (data) => {
    toast.success(`Received $${data.amount.toFixed(2)} from ${data.from}`, {
      toastId: "transaction-toast",
      position: "bottom-right",
      autoClose: 5000,
    });
  });

  // Handle money sent events (sending money)
  socket.on("money-sent", (data) => {
    // Show toast for outgoing money
    toast.info(`Sent $${data.amount.toFixed(2)} to ${data.to}`, {
      toastId: "transaction-toast",
      position: "bottom-right",
      autoClose: 5000,
    });
  });

  return socket;
};

// Global disconnect function
export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    notifyListeners(false);
  }
};

// Hook for components to use the global socket
export function useSocket() {
  const [connected, setConnected] = useState(() => {
    // Always return false for mobile devices
    if (isMobileDevice()) return false;
    return globalSocket?.connected || false;
  });

  useEffect(() => {
    // Skip socket connection logic for mobile devices
    if (isMobileDevice()) {
      return;
    }

    // Register this component as a listener for connection state changes
    const listener = (isConnected: boolean) => {
      setConnected(isConnected);
    };

    listeners.push(listener);

    // Set initial state
    setConnected(globalSocket?.connected || false);

    // Clean up listener on unmount
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    socket: globalSocket,
    connected,
    connect: connectSocket,
    disconnect: disconnectSocket,
  };
}
