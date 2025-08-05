// useSocket.ts
import { useCallback, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  "money-transfer": (data: { from: string; amount: number }) => void;
}

type SocketType = Socket<ServerToClientEvents>;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<SocketType | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found, cannot connect to socket server");
      return;
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

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("Socket disconnected:", reason);
    });

    return socket;
  }, []);

  // Function to disconnect from socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
  };
}
