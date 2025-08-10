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

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      apiRef.current.addListener("videoConferenceJoined", () => {});
      
      apiRef.current.addListener("readyToClose", () => {
        if (onClose) onClose();
      });
      
      apiRef.current.addListener("participantJoined", () => {});
      
      apiRef.current.addListener("error", () => {});
    } catch (error) {}

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, onClose]);

  return <div ref={containerRef} />;
}
