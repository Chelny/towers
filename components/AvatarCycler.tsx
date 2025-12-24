"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { Socket } from "socket.io-client";
import { Avatar, AVATARS } from "@/constants/avatars";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useSocket } from "@/context/SocketContext";
import { useAvatarSave } from "@/hooks/useAvatarSave";

type AvatarCyclerProps = {
  userId?: string
  initialAvatarId?: string
  size?: number
  onAvatarChange?: (avatarId: string) => void
};

export function AvatarCycler({
  userId,
  initialAvatarId = AVATARS[0].id,
  size = 40,
  onAvatarChange,
}: AvatarCyclerProps): ReactNode {
  const { socketRef, isConnected, session } = useSocket();
  const { t } = useLingui();
  const { saveAvatarDebounced } = useAvatarSave();
  const [avatarId, setAvatarId] = useState<string | undefined>(initialAvatarId);

  const isCurrentUser: boolean = useMemo(() => userId === session?.user.id, [userId, session?.user.id]);

  const selected = useMemo(() => AVATARS.find((avatar: Avatar) => avatar.id === avatarId) ?? AVATARS[0], [avatarId]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const handleUpdateAvatar = ({ userId: updatedUserId, avatarId }: { userId: string; avatarId: string }): void => {
      if (updatedUserId === userId) {
        setAvatarId(avatarId);
      }
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.USER_SETTINGS_AVATAR, handleUpdateAvatar);
    };

    if (socket.connected) {
      attachListeners();
    } else {
      socket.once("connect", () => {
        attachListeners();
      });
    }

    return () => {
      socket.off(ServerToClientEvents.USER_SETTINGS_AVATAR, handleUpdateAvatar);
      socket.off("connect");
    };
  }, [isConnected, socketRef]);

  const handleDoubleClick = (): void => {
    const nextId: string = getNextId(avatarId);
    setAvatarId(nextId);
    onAvatarChange?.(nextId);
    saveAvatarDebounced(nextId);
  };

  return (
    <div className="inline-grid justify-items-center gap-1.5">
      <button
        type="button"
        className={clsx("grid place-items-center p-0 overflow-hidden", isCurrentUser && "cursor-default")}
        style={{ width: size, height: size }}
        title={t({ message: "Double-click to change avatar" })}
        onDoubleClick={isCurrentUser ? handleDoubleClick : undefined}
      >
        <Image src={selected.src} className="rtl:-scale-x-100" width={size} height={size} alt={selected.label} />
      </button>
    </div>
  );
}

function getNextId(currentId: string | undefined): string {
  const idx: number = AVATARS.findIndex((avatar: Avatar) => avatar.id === currentId);
  const nextIdx: number = idx === -1 ? 0 : (idx + 1) % AVATARS.length;
  return AVATARS[nextIdx].id;
}
