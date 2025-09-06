import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MoneyTransferData {
  from?: string;
  to?: string;
  amount: number;
  videoCallUrl: string;
}

interface ServerToClientEvents {
  "money-transfer": (data: MoneyTransferData) => void;
  "money-sent": (data: MoneyTransferData) => void;
}

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
      globalSocket.disconnect();
      globalSocket.removeAllListeners();
      globalSocket = null;
    }
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  const socket: SocketType = io(import.meta.env.VITE_NODEJS_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  globalSocket = socket;

  socket.on("connect", () => {
    notifyListeners(true);
  });

  socket.on("disconnect", () => {
    notifyListeners(false);
  });

  socket.on("connect_error", () => {});

  return socket;
};

export const disconnectSocket = () => {
  if (globalSocket) {
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
      setMoneySentEvent(data);
    };

    globalSocket.on("money-transfer", handleMoneyTransfer);
    globalSocket.on("money-sent", handleMoneySent);

    return () => {
      globalSocket?.off("money-transfer", handleMoneyTransfer);
      globalSocket?.off("money-sent", handleMoneySent);
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
