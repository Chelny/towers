import { useRef } from "react";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { useSocket } from "@/context/SocketContext";

interface AvatarSave {
  saveAvatarDebounced: (avatarId: string) => void
}

export function useAvatarSave(): AvatarSave {
  const tRef = useRef<number | null>(null);
  const { socketRef } = useSocket();

  const saveAvatarDebounced = (avatarId: string): void => {
    if (tRef.current) window.clearTimeout(tRef.current);

    tRef.current = window.setTimeout(() => {
      socketRef.current?.emit(ClientToServerEvents.USER_SETTINGS_AVATAR, { avatarId });
    }, 1000);
  };

  return { saveAvatarDebounced };
}
