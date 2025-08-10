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
  } = useSocket();

  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (moneyTransferEvent) {
      toast.success(
        `Received $${moneyTransferEvent.amount.toFixed(2)} from ${
          moneyTransferEvent.from
        }`,
        {
          toastId: `money-transfer-${moneyTransferEvent.from}-${moneyTransferEvent.amount}`,
          position: "bottom-right",
          autoClose: 5000,
        }
      );

      setActiveRoom(moneyTransferEvent.videoCallUrl.split("/").pop() || null);
      clearMoneyTransferEvent();
    }
  }, [moneyTransferEvent, clearMoneyTransferEvent]);

  useEffect(() => {
    if (moneySentEvent) {
      toast.info(
        `Sent $${moneySentEvent.amount.toFixed(2)} to ${moneySentEvent.to}`,
        {
          toastId: `money-sent-${moneySentEvent.to}-${moneySentEvent.amount}`,
          position: "bottom-right",
          autoClose: 5000,
        }
      );

      setActiveRoom(moneySentEvent.videoCallUrl.split("/").pop() || null);
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
            onClose={() => setActiveRoom(null)}
          />
        </div>
      )}
    </div>
  );
}
