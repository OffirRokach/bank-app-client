import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSocket } from "../hooks/useSocket";
import { JitsiMeeting } from "./JitsiMeeting";

export function MoneyTransferNotifications() {
  const {
    moneyTransferEvent,
    moneySentEvent,
    clearMoneyTransferEvent,
    clearMoneySentEvent,
    connect,
    connected,
    socket,
  } = useSocket();

  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
  }, [connected, socket]);

  useEffect(() => {
    if (moneyTransferEvent) {
      // Create a custom toast with clickable link
      toast.success(
        <div>
          Received ${moneyTransferEvent.amount.toFixed(2)} from {moneyTransferEvent.from}
          <br />
          <a 
            href={moneyTransferEvent.videoCallUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0078ff', textDecoration: 'underline' }}
            onClick={(e) => {
              e.preventDefault();
              const roomId = moneyTransferEvent.videoCallUrl.split("/").pop() || null;
              setActiveRoom(roomId);
            }}
          >
            Join Video Call
          </a>
        </div>,
        {
          toastId: `money-transfer-${moneyTransferEvent.from}-${moneyTransferEvent.amount}`,
          position: "bottom-right",
          autoClose: 10000,
        }
      );

      const roomId = moneyTransferEvent.videoCallUrl.split("/").pop() || null;
      setActiveRoom(roomId);
      clearMoneyTransferEvent();
    }
  }, [moneyTransferEvent, clearMoneyTransferEvent]);

  useEffect(() => {
    if (moneySentEvent) {
      // Create a custom toast with clickable link
      toast.info(
        <div>
          Sent ${moneySentEvent.amount.toFixed(2)} to {moneySentEvent.to}
          <br />
          <a 
            href={moneySentEvent.videoCallUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0078ff', textDecoration: 'underline' }}
            onClick={(e) => {
              e.preventDefault();
              const roomId = moneySentEvent.videoCallUrl.split("/").pop() || null;
              setActiveRoom(roomId);
            }}
          >
            Join Video Call
          </a>
        </div>,
        {
          toastId: `money-sent-${moneySentEvent.to}-${moneySentEvent.amount}`,
          position: "bottom-right",
          autoClose: 10000,
        }
      );

      const roomId = moneySentEvent.videoCallUrl.split("/").pop() || null;
      setActiveRoom(roomId);
      clearMoneySentEvent();
    }
  }, [moneySentEvent, clearMoneySentEvent]);

  return (
    <div>
      {activeRoom && (
        <div>
          <h3>Video call for transaction</h3>
          <JitsiMeeting
            roomName={activeRoom}
            onClose={() => {
              setActiveRoom(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
