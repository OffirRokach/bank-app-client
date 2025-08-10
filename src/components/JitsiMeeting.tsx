import { useEffect, useRef } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  roomName: string;
  onClose?: () => void;
}

export function JitsiMeeting({ roomName, onClose }: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet API script not loaded");
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: 500,
      configOverwrite: {},
      interfaceConfigOverwrite: {},
    };

    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    apiRef.current.addListener("readyToClose", () => {
      if (onClose) onClose();
    });

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [roomName, onClose]);

  return <div ref={containerRef} />;
}
